# PostgreSQL Architecture for Niku TelePrompter

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Niku TelePrompter Application                   │
├─────────────────────────────────────────────────────────────────────┤
│                         .NET Server API                              │
│  (ASP.NET Core 10 + Entity Framework Core)                          │
│  ├─ Controllers                                                      │
│  ├─ Services                                                         │
│  └─ ApplicationDbContext                                             │
└────────────────────────┬────────────────────────────────────────────┘
						 │
						 │ (SQL Queries)
						 │
		   ┌─────────────▼──────────────┐
		   │   PostgreSQL Database      │
		   │    Port: 5432              │
		   ├────────────────────────────┤
		   │  TABLES (26+)              │
		   │  ├─ Identity Tables (5)    │
		   │  ├─ Customer Tables (5)    │
		   │  └─ Shop Tables (5)        │
		   │                            │
		   │  VOLUMES:                  │
		   │  └─ postgres_data/         │
		   └─────────────┬──────────────┘
						 │
		  ┌──────────────▼──────────────┐
		  │     pgAdmin Web UI          │
		  │      Port: 5050             │
		  │  (Database Management)      │
		  └────────────────────────────┘
```

## 📊 Database Schema Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    NIKU_TELEPROMTER DB                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         IDENTITY TABLES (ASP.NET Core)                │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  AspNetUsers         ◄──┐                             │  │
│  │  AspNetRoles            │  Users have Roles          │  │
│  │  AspNetUserRoles     ───┘                             │  │
│  │  AspNetUserClaims                                     │  │
│  │  AspNetRoleClaims                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         SHOP TABLES (Custom Schema)                   │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │  AppCustomers                                         │  │
│  │       │                                               │  │
│  │       └──────────┐                                    │  │
│  │                  │ (has many)                        │  │
│  │  AppOrders  ◄────┘                                    │  │
│  │       │                                               │  │
│  │       └──────────┐                                    │  │
│  │                  │ (has many)                        │  │
│  │  AppOrderDetails ◄──────────► AppProducts            │  │
│  │                       (references)                    │  │
│  │  AppProducts  ◄──────┐                                │  │
│  │       │              │ (parent/child)                │  │
│  │       └──────────────┘                                │  │
│  │       │                                               │  │
│  │       └──────────┐                                    │  │
│  │                  │ (has category)                    │  │
│  │  AppProductCategories                                │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
┌─────────────────────┐
│   Angular Client    │
│  (TypeScript/HTML)  │
└──────────┬──────────┘
		   │ HTTP/REST
		   │
┌──────────▼──────────────────────┐
│   API Controllers               │
│  ├─ UserAccountController      │
│  ├─ UserRoleController         │
│  ├─ CustomerController         │
│  └─ AuthorizationController    │
└──────────┬──────────────────────┘
		   │
┌──────────▼──────────────────────┐
│   Application Services          │
│  ├─ UserAccountService         │
│  ├─ UserRoleService            │
│  ├─ CustomerService            │
│  ├─ ProductService             │
│  └─ OrdersService              │
└──────────┬──────────────────────┘
		   │
┌──────────▼──────────────────────────────────────┐
│   Entity Framework Core DbContext               │
│  (ApplicationDbContext)                         │
│  ├─ DbSet<AspNetUser>                          │
│  ├─ DbSet<AspNetRole>                          │
│  ├─ DbSet<Customer>                            │
│  ├─ DbSet<Product>                             │
│  ├─ DbSet<Order>                               │
│  └─ DbSet<OrderDetail>                         │
└──────────┬──────────────────────────────────────┘
		   │ SQL Queries
		   │
┌──────────▼──────────────────────┐
│   PostgreSQL Database           │
│  ├─ Connection Pool             │
│  ├─ Query Executor              │
│  ├─ Transaction Manager         │
│  └─ Storage Engine              │
└──────────┬──────────────────────┘
		   │
┌──────────▼──────────────────────┐
│   Persistent Storage            │
│  ├─ Data Files                  │
│  ├─ Indexes                     │
│  ├─ Transaction Logs            │
│  └─ Backups                     │
└─────────────────────────────────┘
```

## 🐳 Docker Network Topology

```
┌─────────────────────────────────────────────────────┐
│              Docker Network: niku_network          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐    ┌──────────────────────┐  │
│  │ PostgreSQL       │    │ pgAdmin              │  │
│  │ Container        │◄───┤ Container            │  │
│  ├──────────────────┤    ├──────────────────────┤  │
│  │ Port: 5432       │    │ Port: 5050           │  │
│  │ Status: running  │    │ Status: running      │  │
│  │ Image: postgres  │    │ Image: pgadmin4      │  │
│  │ 16-alpine        │    │ latest               │  │
│  └──────────────────┘    └──────────────────────┘  │
│         ▲                           │               │
│         │                           │               │
│         │ (depends_on)              │ (admin UI)   │
│         └───────────────────────────┘              │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │         Docker Volumes                      │   │
│  ├─────────────────────────────────────────────┤   │
│  │  postgres_data/                             │   │
│  │  ├─ data/pgdata/                            │   │
│  │  │  ├─ base/           (databases)         │   │
│  │  │  ├─ pg_tblspc/      (tablespaces)       │   │
│  │  │  └─ pg_wal/         (WAL logs)          │   │
│  │  │                                          │   │
│  │  pgadmin_data/                              │   │
│  │  ├─ pgadmin4/                               │   │
│  │  │  └─ pgadmin4.db                          │   │
│  │  │                                          │   │
│  │  init-scripts/                              │   │
│  │  ├─ 01-init-database.sql                    │   │
│  │  └─ 02-migration-guide.sql                  │   │
│  │                                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 📈 Entity Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                      ENTITY RELATIONSHIPS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ApplicationUser (n) ──has many──► ApplicationRole (m)          │
│       │                            (AspNetRoles)                │
│       │ (AspNetUsers)                                           │
│       │                                                          │
│       ├─────────────────── ApplicationUserClaim (1:n)           │
│       │                    (AspNetUserClaims)                   │
│       │                                                          │
│       └─────────────────── ApplicationUserRole (1:n)            │
│                            (AspNetUserRoles)                    │
│                                                                  │
│────────────────────────────────────────────────────────────────│
│                                                                  │
│  Customer (1) ──has many──► Order (n)                          │
│       │           (FK: CustomerId)                              │
│       │                                                          │
│       ├─ Id             Order (1) ──has many──► OrderDetail (n) │
│       ├─ Name                │           (FK: OrderId)          │
│       ├─ Email               │                                  │
│       ├─ PhoneNumber         └─► Product (n)                    │
│       ├─ City                    (FK: CustomerId)               │
│       └─ [Audit Fields]                                         │
│                                                                  │
│  Product (n) ─────┐  ProductCategory (1)                       │
│       │           │       │                                     │
│       │           ├─ has category                               │
│       │           │                                             │
│       │ Parent    └─ Id                                         │
│       │ (Self Reference)  Name                                  │
│       │           Description                                   │
│       └─ Children (1:n)                                         │
│                                                                  │
│────────────────────────────────────────────────────────────────│
│                        AUDIT FIELDS (All Tables)                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  CreatedBy        (string) - User who created record       ││
│  │  CreatedDate      (DateTime) - When record was created      ││
│  │  LastModifiedBy   (string) - User who last modified         ││
│  │  LastModifiedDate (DateTime) - When last modified           ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Connection Flow

```
Application
	│
	├─► Read appsettings.json
	│   └─► Extract ConnectionString
	│       "Host=localhost;Port=5432;Database=niku_telepromter;
	│        Username=postgres;Password=your_password"
	│
	├─► Create DbContextOptions
	│   └─► Configure PostgreSQL provider (Npgsql)
	│
	├─► Initialize DbContext
	│   └─► Create connection pool
	│
	├─► Execute Migrations
	│   └─► Apply pending migrations
	│
	└─► Ready for queries
		├─► SELECT operations
		├─► INSERT operations
		├─► UPDATE operations
		└─► DELETE operations
```

## 📊 Table Statistics

```
┌──────────────────────┬──────────────┬─────────────────────────┐
│ Table Name           │ Rows (est.)  │ Purpose                 │
├──────────────────────┼──────────────┼─────────────────────────┤
│ AspNetUsers          │ 10-1000      │ User accounts           │
│ AspNetRoles          │ 5-50         │ Role definitions        │
│ AspNetUserRoles      │ 10-5000      │ User-Role assignments   │
│ AspNetUserClaims     │ 50-10000     │ User claims             │
│ AspNetRoleClaims     │ 20-500       │ Role permissions        │
├──────────────────────┼──────────────┼─────────────────────────┤
│ AppCustomers         │ 100-10000    │ Customer records        │
│ AppProductCategories │ 5-100        │ Product categories      │
│ AppProducts          │ 50-50000     │ Product inventory       │
│ AppOrders            │ 500-100000   │ Customer orders         │
│ AppOrderDetails      │ 5000-1000000 │ Order line items        │
└──────────────────────┴──────────────┴─────────────────────────┘
```

## 🎯 Key Configuration Points

```
┌────────────────────────────────────────────────────┐
│  CONFIGURATION HIERARCHY                           │
├────────────────────────────────────────────────────┤
│                                                    │
│  1. appsettings.json (Base)                        │
│     └─ ConnectionString (SQLServer)                │
│                                                    │
│  2. appsettings.PostgreSQL.json                    │
│     └─ ConnectionString (PostgreSQL)               │
│                                                    │
│  3. appsettings.Development.json                   │
│     └─ Override for development                    │
│                                                    │
│  4. .env.postgres (Environment)                    │
│     └─ Docker environment variables                │
│                                                    │
│  5. Runtime Environment Variables                  │
│     └─ ASPNETCORE_ENVIRONMENT = Production         │
│                                                    │
│  Precedence: Runtime Env > appsettings.{env}.json  │
│              > appsettings.json                    │
└────────────────────────────────────────────────────┘
```

---

**For detailed setup instructions, see POSTGRES_SETUP.md**

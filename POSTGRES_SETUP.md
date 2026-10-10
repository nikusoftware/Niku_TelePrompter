# PostgreSQL Setup Guide for Niku TelePrompter

## Overview
This guide explains how to set up PostgreSQL for the Niku TelePrompter project.

## Prerequisites
- Docker and Docker Compose (recommended)
- OR PostgreSQL 14+ installed locally
- .NET 10 SDK

## Option 1: Using Docker Compose (Recommended)

### Step 1: Start PostgreSQL Container
```bash
# Navigate to the project root directory
cd Niku_TelePrompter

# Start the PostgreSQL container with pgAdmin
docker-compose -f docker-compose.postgres.yml up -d

# Verify the container is running
docker ps
```

### Step 2: Verify Database Connection
```bash
# Check if PostgreSQL is ready
docker-compose -f docker-compose.postgres.yml ps

# Access pgAdmin at http://localhost:5050
# Login with:
#   Email: admin@example.com
#   Password: admin
```

### Step 3: Stop PostgreSQL Container
```bash
docker-compose -f docker-compose.postgres.yml down

# To remove volumes as well (this deletes data):
docker-compose -f docker-compose.postgres.yml down -v
```

---

## Option 2: Using PostgreSQL Locally

### Step 1: Install PostgreSQL
Download and install PostgreSQL from: https://www.postgresql.org/download/

### Step 2: Create Database
Open pgAdmin or psql terminal and run:
```sql
CREATE DATABASE niku_telepromter
  WITH
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8';

-- Create application user (optional but recommended)
CREATE USER niku_app WITH PASSWORD 'niku_app_password_123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE niku_telepromter TO niku_app;
GRANT ALL PRIVILEGES ON SCHEMA public TO niku_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO niku_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO niku_app;

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## Configuring the Application

### Step 1: Update Connection String
Edit `appsettings.json` or use the PostgreSQL-specific config file:

**Option A: Update default appsettings.json**
```json
{
  "ConnectionStrings": {
	"DefaultConnection": "Host=localhost;Port=5432;Database=niku_telepromter;Username=postgres;Password=your_password_here"
  }
}
```

**Option B: Use PostgreSQL config file**
Copy `appsettings.PostgreSQL.json` to your deployment environment:
```bash
cp appsettings.PostgreSQL.json appsettings.Production.json
```

Then configure for your environment:
```json
{
  "ConnectionStrings": {
	"DefaultConnection": "Host=your_host;Port=5432;Database=niku_telepromter;Username=niku_app;Password=your_password"
  }
}
```

### Step 2: Update Program.cs (if needed)
Ensure the Program.cs file is using the PostgreSQL provider:

```csharp
// In Program.cs
builder.Services.AddDbContext<ApplicationDbContext>(options =>
	options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
);
```

---

## Entity Framework Migrations

### Create and Apply Migrations

```bash
# Navigate to the Server project
cd "Niku Telepromter/Niku_Telepromter.Server"

# Update database with existing migrations
dotnet ef database update

# If you need to create a new migration
dotnet ef migrations add YourMigrationName --project ../Niku_Telepromter.Core

# Apply the migration
dotnet ef database update
```

### Common Migration Commands

```bash
# List all migrations
dotnet ef migrations list

# Remove the last migration
dotnet ef migrations remove

# Generate SQL script for a migration
dotnet ef migrations script -o init.sql

# Generate SQL from a specific migration
dotnet ef migrations script 20251225202239_Initial -o init.sql
```

---

## Database Schema

The Niku TelePrompter database includes the following main tables (created by Entity Framework):

### Identity Tables (AspNetCore Identity)
- `AspNetUsers` - Application users
- `AspNetRoles` - User roles
- `AspNetUserRoles` - User-Role relationships
- `AspNetUserClaims` - User claims
- `AspNetRoleClaims` - Role claims

### Application Tables
- `AppCustomers` - Customer information
- `AppProductCategories` - Product categories
- `AppProducts` - Product inventory
- `AppOrders` - Customer orders
- `AppOrderDetails` - Order line items

---

## Connection String Reference

### Docker PostgreSQL
```
Host=localhost;Port=5432;Database=niku_telepromter;Username=postgres;Password=your_password_here
```

### Local PostgreSQL
```
Host=localhost;Port=5432;Database=niku_telepromter;Username=postgres;Password=YourPassword
```

### With Application User
```
Host=localhost;Port=5432;Database=niku_telepromter;Username=niku_app;Password=niku_app_password_123
```

### Remote PostgreSQL Server
```
Host=your.db.server;Port=5432;Database=niku_telepromter;Username=niku_app;Password=YourSecurePassword;SSL Mode=Require
```

---

## Troubleshooting

### Connection Refused
- Check if PostgreSQL service is running
- Verify the correct port (default: 5432)
- Check firewall settings

### Database Does Not Exist
```bash
# Connect to default postgres database
psql -U postgres -d postgres

# List all databases
\l

# Create database if missing
CREATE DATABASE niku_telepromter;
```

### User Permission Issues
```bash
# Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE niku_telepromter TO niku_app;
GRANT ALL PRIVILEGES ON SCHEMA public TO niku_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO niku_app;
```

### pgAdmin Connection Failed
- Verify PostgreSQL container is running: `docker ps`
- Check network connectivity between containers
- Restart containers: `docker-compose -f docker-compose.postgres.yml restart`

---

## Backup and Restore

### Database Backup
```bash
# Using pg_dump (Docker)
docker exec niku_telepromter_postgres pg_dump -U postgres niku_telepromter > backup.sql

# Using pg_dump (Local)
pg_dump -U postgres niku_telepromter > backup.sql
```

### Database Restore
```bash
# Using psql (Docker)
docker exec -i niku_telepromter_postgres psql -U postgres niku_telepromter < backup.sql

# Using psql (Local)
psql -U postgres niku_telepromter < backup.sql
```

---

## Additional Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [Entity Framework Core PostgreSQL](https://www.npgsql.org/efcore/)
- [Docker PostgreSQL](https://hub.docker.com/_/postgres)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)

---

## Support

For issues or questions, please contact the development team or check the project repository.

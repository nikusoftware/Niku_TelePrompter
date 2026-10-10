# PostgreSQL Configuration for Niku TelePrompter

This directory and the associated files provide complete PostgreSQL database setup and configuration for the Niku TelePrompter project.

## 📁 Files Overview

### Configuration Files
- **`appsettings.PostgreSQL.json`** - PostgreSQL connection string configuration
- **`.env.postgres`** - Environment variables template for Docker Compose
- **`docker-compose.postgres.yml`** - Docker Compose configuration for PostgreSQL and pgAdmin

### Database Initialization
- **`init-scripts/01-init-database.sql`** - PostgreSQL initialization script

### Setup Guides
- **`POSTGRES_SETUP.md`** - Comprehensive setup and troubleshooting guide
- **`setup-postgres.ps1`** - PowerShell setup automation script (Windows)
- **`setup-postgres.sh`** - Bash setup automation script (Linux/macOS)

---

## 🚀 Quick Start

### Using Docker Compose (Recommended)

#### Windows (PowerShell)
```powershell
# Make script executable
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Start PostgreSQL
.\setup-postgres.ps1 -Action up

# Run migrations
.\setup-postgres.ps1 -Action migrate

# View pgAdmin
.\setup-postgres.ps1 -Action connect
```

#### Linux/macOS (Bash)
```bash
# Make script executable
chmod +x setup-postgres.sh

# Start PostgreSQL
./setup-postgres.sh up

# Run migrations
./setup-postgres.sh migrate

# View pgAdmin
./setup-postgres.sh connect
```

#### Manual Docker Compose
```bash
# Start containers
docker-compose -f docker-compose.postgres.yml up -d

# Check status
docker-compose -f docker-compose.postgres.yml ps

# View logs
docker-compose -f docker-compose.postgres.yml logs -f postgres

# Stop containers
docker-compose -f docker-compose.postgres.yml down
```

---

## 📋 Connection Details

### Default Connection String
```
Host=localhost;Port=5432;Database=niku_telepromter;Username=postgres;Password=your_password_here
```

### Docker Services
- **PostgreSQL**: `localhost:5432`
- **pgAdmin**: `http://localhost:5050`
  - Email: `admin@example.com`
  - Password: `admin`

### Database Credentials
- **Master User**: `postgres`
- **App User**: `niku_app` (optional)
- **Default Database**: `niku_telepromter`

---

## 🔧 Common Tasks

### View Available Scripts
```bash
# Windows
.\setup-postgres.ps1 -Action help

# Linux/macOS
./setup-postgres.sh help
```

### Start/Stop PostgreSQL
```bash
# Windows
.\setup-postgres.ps1 -Action up      # Start
.\setup-postgres.ps1 -Action down    # Stop

# Linux/macOS
./setup-postgres.sh up               # Start
./setup-postgres.sh down             # Stop
```

### Apply Database Migrations
```bash
# Windows
.\setup-postgres.ps1 -Action migrate

# Linux/macOS
./setup-postgres.sh migrate

# Or manually
cd "Niku Telepromter/Niku_Telepromter.Server"
dotnet ef database update
```

### Backup Database
```bash
# Windows
.\setup-postgres.ps1 -Action backup

# Linux/macOS
./setup-postgres.sh backup
```

### Access PostgreSQL Shell
```bash
# Windows
.\setup-postgres.ps1 -Action shell

# Linux/macOS
./setup-postgres.sh shell

# Or directly with psql
psql -h localhost -U postgres -d niku_telepromter
```

---

## 🔐 Security Recommendations

### For Development
- Use default credentials in `.env.postgres`
- Database only accessible on localhost
- pgAdmin password changeable after first login

### For Production
1. **Update Connection String**
   ```json
   {
	 "ConnectionStrings": {
	   "DefaultConnection": "Host=prod.db.server;Port=5432;Database=niku_telepromter;Username=niku_app;Password=StrongSecurePassword123!;SSL Mode=Require"
	 }
   }
   ```

2. **Use Application-Specific User**
   ```sql
   CREATE USER niku_app WITH PASSWORD 'StrongSecurePassword123!';
   GRANT CONNECT ON DATABASE niku_telepromter TO niku_app;
   GRANT USAGE ON SCHEMA public TO niku_app;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO niku_app;
   ```

3. **Enable SSL/TLS Connection**
   - Add `SSL Mode=Require` to connection string
   - Configure PostgreSQL server SSL certificates

4. **Restrict Network Access**
   - Configure firewall rules
   - Use VPN/Private networks for database access
   - Don't expose port 5432 publicly

---

## 📊 Database Schema

### Identity & Authentication
- `AspNetUsers` - User accounts
- `AspNetRoles` - Application roles
- `AspNetUserRoles` - User-Role assignments
- `AspNetUserClaims` - User claims/permissions
- `AspNetRoleClaims` - Role claims

### Business Entities
- `AppCustomers` - Customer records
- `AppProductCategories` - Product categories
- `AppProducts` - Product inventory
- `AppOrders` - Sales orders
- `AppOrderDetails` - Order line items

### Audit Trail
All tables include audit columns:
- `CreatedBy` - User who created record
- `CreatedDate` - Creation timestamp
- `LastModifiedBy` - Last user to modify
- `LastModifiedDate` - Last modification timestamp

---

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.postgres.yml logs postgres

# Verify port isn't in use
netstat -tuln | grep 5432  # Linux/macOS
netstat -ano | findstr :5432  # Windows

# Remove and restart
docker-compose -f docker-compose.postgres.yml down
docker volume rm docker_postgres_data  # Clear data
docker-compose -f docker-compose.postgres.yml up -d
```

### Connection Refused
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check network connectivity
docker exec niku_telepromter_postgres pg_isready -U postgres

# Test connection
psql -h localhost -U postgres -d niku_telepromter
```

### Migrations Fail
```bash
# Verify connection string in appsettings.json
# Check Entity Framework tools installed
dotnet tool install -g dotnet-ef

# Try database update with verbose output
dotnet ef database update --verbose
```

### pgAdmin Can't Connect
```bash
# Ensure both containers are running
docker-compose -f docker-compose.postgres.yml ps

# Check container network
docker network inspect niku_network

# Restart services
docker-compose -f docker-compose.postgres.yml restart
```

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Entity Framework Core PostgreSQL](https://www.npgsql.org/efcore/)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 📝 Configuration Files

### appsettings.PostgreSQL.json
Contains PostgreSQL-specific connection string and configuration.
Update with your database credentials before deployment.

### docker-compose.postgres.yml
Defines PostgreSQL container, pgAdmin, volumes, and networks.
Customize as needed for your environment.

### .env.postgres
Environment variable template for Docker Compose configuration.
Copy and modify for your specific deployment.

---

## 🎯 Integration with Application

### Using in Development
1. Copy `appsettings.PostgreSQL.json` content to `appsettings.Development.json`
2. Update connection string with your local credentials
3. Run migrations: `dotnet ef database update`
4. Application automatically uses PostgreSQL

### Using in Production
1. Set environment variable `ASPNETCORE_ENVIRONMENT=Production`
2. Configure `appsettings.Production.json` with secure connection string
3. Ensure PostgreSQL server is accessible and configured
4. Run migrations before deployment or during initialization

---

## ✅ Verification Checklist

- [ ] Docker and Docker Compose installed
- [ ] Connection string configured in appsettings
- [ ] PostgreSQL container running (`docker ps`)
- [ ] Database created (`niku_telepromter`)
- [ ] Entity Framework migrations applied
- [ ] pgAdmin accessible at `http://localhost:5050`
- [ ] Test connection with sample query

---

For detailed setup instructions, see `POSTGRES_SETUP.md`.

# PostgreSQL Setup Checklist for Niku TelePrompter

## ✅ Pre-Setup Requirements

- [ ] Docker Desktop installed and running (Windows/Mac)
- [ ] Docker daemon running (Linux)
- [ ] Docker Compose installed (usually included with Docker Desktop)
- [ ] .NET 10 SDK installed
- [ ] PostgreSQL client tools (optional, for manual connections)
- [ ] Administrator/sudo access on the machine
- [ ] At least 2GB free disk space
- [ ] Ports 5432 and 5050 available (not in use)

## ✅ Installation Steps

### Step 1: Verify Prerequisites
- [ ] Run `docker --version` - should be 20.10+
- [ ] Run `docker-compose --version` - should be 2.0+
- [ ] Run `dotnet --version` - should be 10.0+
- [ ] Run `git status` - verify in project root

### Step 2: Review Files Created
- [ ] `docker-compose.postgres.yml` - exists and readable
- [ ] `appsettings.PostgreSQL.json` - exists with correct format
- [ ] `.env.postgres` - exists with template variables
- [ ] `setup-postgres.ps1` (Windows) or `setup-postgres.sh` (Linux/Mac) - exists
- [ ] `init-scripts/01-init-database.sql` - exists
- [ ] `POSTGRES_SETUP.md` - documentation available
- [ ] `POSTGRES_README.md` - quick reference available

### Step 3: Update Configuration
- [ ] Open `appsettings.PostgreSQL.json`
- [ ] Verify connection string format
- [ ] Note username and password (default: postgres/your_password_here)
- [ ] Copy content to `appsettings.json` ConnectionStrings section OR
- [ ] Create `appsettings.Development.json` with PostgreSQL settings

### Step 4: Start PostgreSQL
**Windows (PowerShell):**
- [ ] Open PowerShell in project root
- [ ] Run: `.\setup-postgres.ps1 -Action up`
- [ ] Wait for "PostgreSQL is ready!" message
- [ ] Or manually: `docker-compose -f docker-compose.postgres.yml up -d`

**Linux/macOS (Bash):**
- [ ] Open terminal in project root
- [ ] Run: `chmod +x setup-postgres.sh`
- [ ] Run: `./setup-postgres.sh up`
- [ ] Wait for "PostgreSQL is ready!" message
- [ ] Or manually: `docker-compose -f docker-compose.postgres.yml up -d`

### Step 5: Verify PostgreSQL Started
- [ ] Run: `docker-compose -f docker-compose.postgres.yml ps`
- [ ] Both containers should show "Up" status
- [ ] PostgreSQL container healthy (if showing status)
- [ ] Database logs show no errors: `docker-compose -f docker-compose.postgres.yml logs postgres`

### Step 6: Test Database Connection
**Using psql (if installed):**
- [ ] Run: `psql -h localhost -U postgres -d niku_telepromter`
- [ ] Connection successful without errors
- [ ] Type `\q` to exit

**Using Docker:**
- [ ] Run: `docker exec niku_telepromter_postgres psql -U postgres -d niku_telepromter -c "SELECT 1"`
- [ ] Should return result "1"

**Using SQL Tools (DBeaver, etc.):**
- [ ] Create new PostgreSQL connection
- [ ] Host: localhost
- [ ] Port: 5432
- [ ] Database: niku_telepromter
- [ ] User: postgres
- [ ] Password: your_password_here
- [ ] Click "Test Connection" - should succeed

### Step 7: Access pgAdmin
- [ ] Open browser to http://localhost:5050
- [ ] pgAdmin login page appears
- [ ] Login with email: admin@example.com
- [ ] Login with password: admin
- [ ] Dashboard loads successfully
- [ ] Add PostgreSQL connection in pgAdmin (optional)

### Step 8: Apply Entity Framework Migrations
**Using PowerShell (Windows):**
- [ ] Run: `.\setup-postgres.ps1 -Action migrate`
- [ ] Migrations complete without errors

**Using Bash (Linux/macOS):**
- [ ] Run: `./setup-postgres.sh migrate`
- [ ] Migrations complete without errors

**Manual:**
- [ ] Open terminal in `Niku Telepromter/Niku_Telepromter.Server` directory
- [ ] Run: `dotnet ef database update`
- [ ] Database created with all tables
- [ ] Completion message shown

### Step 9: Verify Database Tables
**Using psql:**
- [ ] Run: `psql -h localhost -U postgres -d niku_telepromter -c "\dt"`
- [ ] List of tables appears showing AspNet* and App* tables

**Using pgAdmin:**
- [ ] Navigate to Databases > niku_telepromter > Schemas > public > Tables
- [ ] Should see 26+ tables (AspNet and App tables)
- [ ] Right-click table > Properties to view structure

**Using SQL Query:**
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
```
- [ ] Result should be approximately 26-30 tables

## ✅ Database Contents Verification

### Identity Tables
- [ ] `AspNetUsers` - User accounts table exists
- [ ] `AspNetRoles` - Roles table exists
- [ ] `AspNetUserRoles` - User-role junction table exists
- [ ] `AspNetUserClaims` - Claims table exists
- [ ] `AspNetRoleClaims` - Role claims table exists

### Business Tables
- [ ] `AppCustomers` - Customers table exists
- [ ] `AppProductCategories` - Categories table exists
- [ ] `AppProducts` - Products table exists
- [ ] `AppOrders` - Orders table exists
- [ ] `AppOrderDetails` - Order details table exists

### Table Structure
- [ ] All tables have IdN primary key
- [ ] Audit columns exist (CreatedBy, CreatedDate, LastModifiedBy, LastModifiedDate)
- [ ] Foreign keys properly configured
- [ ] Indexes created for frequently searched columns

## ✅ Application Integration

### Step 1: Update Application Configuration
- [ ] Open `Program.cs` in Server project
- [ ] Verify DbContext is configured with PostgreSQL provider (UseNpgsql)
- [ ] Connection string points to PostgreSQL database
- [ ] No hardcoded server name (should use configuration)

### Step 2: Test Application Startup
- [ ] Open `Niku Telepromter.Server` project in Visual Studio or terminal
- [ ] Run: `dotnet run` or press F5 in Visual Studio
- [ ] Application starts without database connection errors
- [ ] Swagger/API documentation loads
- [ ] No migration error messages

### Step 3: Test API Endpoints
- [ ] Start the application
- [ ] Open Swagger UI at https://localhost:5001/swagger (or configured port)
- [ ] Test GET endpoint for users
- [ ] Test GET endpoint for customers/products
- [ ] Responses received successfully from database
- [ ] No connection errors in logs

### Step 4: Test Angular Client
- [ ] Build Angular client: `npm run build`
- [ ] Serve Angular: `npm start`
- [ ] Application loads without API errors
- [ ] Can view/browse data from database
- [ ] Create, read, update operations work

## ✅ Backup and Recovery

### Step 1: Create First Backup
- [ ] Run: `.\setup-postgres.ps1 -Action backup` (Windows)
- [ ] Or: `./setup-postgres.sh backup` (Linux/macOS)
- [ ] Backup file created with timestamp
- [ ] File size > 100KB (non-empty backup)

### Step 2: Test Backup Integrity
- [ ] List backup files
- [ ] Verify backup file is readable
- [ ] Backup timestamp is recent

### Step 3: Document Backup Procedure
- [ ] Backup location documented for production
- [ ] Backup retention policy defined
- [ ] Automated backup scheduling considered

## ✅ Production Preparation

### Security
- [ ] Changed all default passwords in appsettings
- [ ] Connection string secured (not in public repository)
- [ ] SSL/TLS enabled for remote connections
- [ ] Database user permissions restricted
- [ ] Fire wall rules configured for database access

### Performance
- [ ] Indexes created for common queries
- [ ] Query performance analyzed
- [ ] Database statistics updated
- [ ] Connection pooling configured

### Monitoring
- [ ] Database monitoring enabled (if using cloud)
- [ ] Backup verification scheduled
- [ ] Log rotation configured
- [ ] Alerts setup for issues

### Documentation
- [ ] Connection string migration documented
- [ ] Recovery procedures documented
- [ ] Deployment checklist prepared
- [ ] Support contacts listed

## ✅ Troubleshooting Verification

### If Containers Won't Start
- [ ] Checked port availability: `netstat -tuln | grep 5432`
- [ ] Killed existing containers: `docker-compose -f docker-compose.postgres.yml down`
- [ ] Removed old volumes if needed: `docker volume rm docker_postgres_data`
- [ ] Checked Docker daemon running: `docker ps`

### If Migrations Fail
- [ ] Entity Framework tools installed: `dotnet tool list -g dotnet-ef`
- [ ] Connection string verified in appsettings
- [ ] Database exists and is accessible
- [ ] Ran with verbose output: `dotnet ef database update --verbose`

### If pgAdmin Can't Connect
- [ ] Both containers running: `docker-compose -f docker-compose.postgres.yml ps`
- [ ] Network created: `docker network ls | grep niku_network`
- [ ] Container logs checked: `docker logs niku_telepromter_postgres`
- [ ] Restarted services if needed

## ✅ Documentation Review

- [ ] Read `POSTGRES_README.md` - overview
- [ ] Read `POSTGRES_SETUP.md` - detailed guide
- [ ] Read `POSTGRES_ARCHITECTURE.md` - system design
- [ ] Saved `POSTGRES_SETUP_SUMMARY.txt` for reference
- [ ] Bookmarked official documentation links

## ✅ Sign-Off

- [ ] All prerequisites met
- [ ] All installation steps completed
- [ ] All verifications passed
- [ ] Database tables present with correct structure
- [ ] Application integration tested
- [ ] Backups working
- [ ] Production considerations addressed
- [ ] Documentation reviewed
- [ ] Ready for development/deployment

---

## 📝 Notes

**Installation Date**: _______________
**Completed By**: _______________
**Issues Encountered**:
```

```

**Resolutions Applied**:
```

```

**Database Backup Location**: _______________
**Production DB Host**: _______________
**Production DB Port**: _______________

---

## 🆘 Support

If you encounter issues:

1. Check the relevant section in `POSTGRES_SETUP.md`
2. Review error logs: `docker-compose -f docker-compose.postgres.yml logs -f`
3. Verify prerequisites are all installed
4. Check port availability
5. Review architecture diagram in `POSTGRES_ARCHITECTURE.md`

For additional help:
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Entity Framework Docs: https://docs.microsoft.com/en-us/ef/
- Project Repository: https://github.com/nikusoftware/Niku_TelePrompter

---

**Last Updated**: 2024-12-25  
**PostgreSQL Version**: 16-alpine  
**Entity Framework Version**: 10  
**Project**: Niku TelePrompter

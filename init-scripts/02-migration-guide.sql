-- Niku TelePrompter PostgreSQL Migration Guide
-- This file documents the database schema and common migration operations

-- ============================================================================
-- DATABASE INITIALIZATION
-- ============================================================================

-- Create database
CREATE DATABASE "NikuTelePrompter"
  WITH
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;

-- Connect to the database
\c "NikuTelePrompter";

-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create application schemas (optional, if not using public)
CREATE SCHEMA app;

GRANT USAGE ON SCHEMA app TO PUBLIC;

-- ============================================================================
-- IDENTITY TABLES (Created by Entity Framework)
-- ============================================================================

-- AspNetUsers
-- Stores user account information
-- Columns: Id, UserName, NormalizedUserName, Email, NormalizedEmail, 
--          EmailConfirmed, PasswordHash, SecurityStamp, ConcurrencyStamp,
--          PhoneNumber, PhoneNumberConfirmed, TwoFactorEnabled, 
--          LockoutEnd, LockoutEnabled, AccessFailedCount

-- AspNetRoles
-- Stores role definitions
-- Columns: Id, Name, NormalizedName, ConcurrencyStamp

-- AspNetUserRoles
-- Stores user-to-role assignments
-- Columns: UserId, RoleId

-- AspNetUserClaims
-- Stores user claims
-- Columns: Id, UserId, ClaimType, ClaimValue

-- AspNetRoleClaims
-- Stores role claims
-- Columns: Id, RoleId, ClaimType, ClaimValue

-- ============================================================================
-- APPLICATION TABLES (Created by Entity Framework)
-- ============================================================================

-- AppCustomers
-- Stores customer information with audit trail
-- Columns: Id, Name, Email, PhoneNumber, City, Gender, CreatedBy, CreatedDate, 
--          LastModifiedBy, LastModifiedDate

-- AppProductCategories
-- Stores product categories with audit trail
-- Columns: Id, Name, Description, CreatedBy, CreatedDate, 
--          LastModifiedBy, LastModifiedDate

-- AppProducts
-- Stores product information with pricing and inventory
-- Columns: Id, Name, Description, Icon, BuyingPrice, SellingPrice, 
--          ProductCategoryId, ParentProductId, IsPublished, 
--          CreatedBy, CreatedDate, LastModifiedBy, LastModifiedDate

-- AppOrders
-- Stores customer orders with audit trail
-- Columns: Id, CustomerId, OrderDate, Discount, Comments, 
--          CreatedBy, CreatedDate, LastModifiedBy, LastModifiedDate

-- AppOrderDetails
-- Stores order line items
-- Columns: Id, OrderId, ProductId, Quantity, UnitPrice, Discount, 
--          CreatedBy, CreatedDate, LastModifiedBy, LastModifiedDate

-- ============================================================================
-- COMMON MIGRATION OPERATIONS
-- ============================================================================

-- View all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- View table structure
\d table_name;
-- Or using SQL:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'table_name' 
ORDER BY ordinal_position;

-- View indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'table_name';

-- View foreign keys
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name 
FROM information_schema.table_constraints tc 
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name 
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'table_name';

-- Count records in all tables
SELECT schemaname, tablename, n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- ============================================================================
-- COMMON MAINTENANCE OPERATIONS
-- ============================================================================

-- Analyze and optimize database
ANALYZE;
REINDEX DATABASE "NikuTelePrompter";

-- Vacuum to reclaim space
VACUUM;
VACUUM ANALYZE;

-- View slow queries (requires pg_stat_statements extension)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Reset query statistics
SELECT pg_stat_statements_reset();

-- ============================================================================
-- BACKUP AND RESTORE OPERATIONS
-- ============================================================================

-- Full database backup (run in shell, not in psql)
-- pg_dump -U postgres -h localhost "NikuTelePrompter" > backup.sql

-- Backup specific table
-- pg_dump -t table_name -U postgres "NikuTelePrompter" > table_backup.sql

-- Restore from backup (run in shell, not in psql)
-- psql -U postgres "NikuTelePrompter" < backup.sql

-- Backup with custom format (smaller size)
-- pg_dump -F c -U postgres "NikuTelePrompter" > backup.dump

-- Restore from custom format
-- pg_restore -d "NikuTelePrompter" backup.dump

-- ============================================================================
-- USER AND PERMISSION MANAGEMENT
-- ============================================================================

-- Create application user
CREATE USER niku_app WITH PASSWORD 'secure_password_123';

-- Grant connection privileges
GRANT CONNECT ON DATABASE "NikuTelePrompter" TO niku_app;

-- Grant schema privileges
GRANT USAGE ON SCHEMA public TO niku_app;

-- Grant table privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO niku_app;

-- Grant sequence privileges (for auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO niku_app;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO niku_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO niku_app;

-- Revoke all privileges
REVOKE ALL PRIVILEGES ON DATABASE "NikuTelePrompter" FROM niku_app;
REVOKE ALL ON SCHEMA public FROM niku_app;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM niku_app;

-- Drop user
DROP USER IF EXISTS niku_app;

-- ============================================================================
-- DATA INTEGRITY CHECKS
-- ============================================================================

-- List orphaned records (OrderDetails without Orders)
SELECT od.* 
FROM "AppOrderDetails" od
LEFT JOIN "AppOrders" o ON od."OrderId" = o."Id"
WHERE o."Id" IS NULL;

-- Find duplicate customers by email
SELECT "Email", COUNT(*) as count
FROM "AppCustomers"
WHERE "Email" IS NOT NULL
GROUP BY "Email"
HAVING COUNT(*) > 1;

-- Verify referential integrity
-- Check for orphaned products
SELECT p.* 
FROM "AppProducts" p
LEFT JOIN "AppProductCategories" pc ON p."ProductCategoryId" = pc."Id"
WHERE p."ProductCategoryId" IS NOT NULL AND pc."Id" IS NULL;

-- ============================================================================
-- PERFORMANCE TUNING
-- ============================================================================

-- Create indexes for commonly searched fields
CREATE INDEX idx_customers_email ON "AppCustomers"("Email");
CREATE INDEX idx_customers_name ON "AppCustomers"("Name");
CREATE INDEX idx_products_name ON "AppProducts"("Name");
CREATE INDEX idx_orders_customerId ON "AppOrders"("CustomerId");
CREATE INDEX idx_orders_orderDate ON "AppOrders"("OrderDate");
CREATE INDEX idx_orderDetails_orderId ON "AppOrderDetails"("OrderId");

-- Create compound indexes
CREATE INDEX idx_products_category_published ON "AppProducts"("ProductCategoryId", "IsPublished");

-- Drop unused indexes
DROP INDEX idx_unused_index;

-- Analyze index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ============================================================================
-- SAMPLE DATA QUERIES
-- ============================================================================

-- Get top 10 customers by order count
SELECT c."Id", c."Name", COUNT(o."Id") as order_count
FROM "AppCustomers" c
LEFT JOIN "AppOrders" o ON c."Id" = o."CustomerId"
GROUP BY c."Id", c."Name"
ORDER BY order_count DESC
LIMIT 10;

-- Get products with sales
SELECT p."Id", p."Name", COUNT(od."Id") as sales_count, 
	   SUM(od."Quantity") as units_sold, 
	   SUM(od."Quantity" * od."UnitPrice") as total_revenue
FROM "AppProducts" p
LEFT JOIN "AppOrderDetails" od ON p."Id" = od."ProductId"
GROUP BY p."Id", p."Name"
ORDER BY total_revenue DESC;

-- Get recent orders with customer details
SELECT o."Id", c."Name", o."OrderDate", SUM(od."Quantity" * od."UnitPrice") as total
FROM "AppOrders" o
JOIN "AppCustomers" c ON o."CustomerId" = c."Id"
LEFT JOIN "AppOrderDetails" od ON o."Id" = od."OrderId"
WHERE o."OrderDate" >= NOW() - INTERVAL '30 days'
GROUP BY o."Id", c."Name", o."OrderDate"
ORDER BY o."OrderDate" DESC;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

-- For more information on Entity Framework migrations:
-- https://docs.microsoft.com/en-us/ef/core/managing-schemas/migrations/
--
-- For PostgreSQL-specific information:
-- https://www.postgresql.org/docs/current/
--
-- For Npgsql Entity Framework provider:
-- https://www.npgsql.org/efcore/


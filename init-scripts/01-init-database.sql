-- Niku TelePrompter Database Initialization Script for PostgreSQL
-- This script creates the necessary PostgreSQL database and roles

-- Create the main database
CREATE DATABASE "NikuTelePrompter"
  WITH
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;

-- Connect to the new database
\c "NikuTelePrompter";

-- Create a dedicated user for the application (optional, for security)
CREATE USER niku_app WITH PASSWORD 'niku_app_password_123';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE "NikuTelePrompter" TO niku_app;
GRANT ALL PRIVILEGES ON SCHEMA public TO niku_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO niku_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO niku_app;

-- Create extensions needed by Entity Framework
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial schemas and tables
-- These will be managed by Entity Framework migrations, but you can add custom initialization here

COMMIT;

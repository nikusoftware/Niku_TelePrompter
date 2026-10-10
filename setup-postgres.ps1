# Niku TelePrompter PostgreSQL Setup Script
# This script helps set up PostgreSQL for development

param(
	[string]$Action = "help",
	[string]$DbPassword = "your_password_here",
	[switch]$Production = $false
)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$composePath = Join-Path $projectRoot "docker-compose.postgres.yml"
$appsettingsPath = Join-Path $projectRoot "Niku Telepromter/Niku_Telepromter.Server/appsettings.json"
$postgresqlConfigPath = Join-Path $projectRoot "Niku Telepromter/Niku_Telepromter.Server/appsettings.PostgreSQL.json"

function Show-Help {
	Write-Host @"
Niku TelePrompter PostgreSQL Setup Script

Usage: .\setup-postgres.ps1 -Action <action> [options]

Actions:
  help              Show this help message
  up                Start PostgreSQL container
  down              Stop PostgreSQL container
  status            Show container status
  logs              Show container logs
  migrate           Run EF Core migrations
  backup            Backup the database
  restore           Restore from backup
  connect           Open pgAdmin (requires browser)
  shell             Open PostgreSQL shell

Examples:
  .\setup-postgres.ps1 -Action up
  .\setup-postgres.ps1 -Action migrate
  .\setup-postgres.ps1 -Action backup

"@
}

function Start-PostgreSQL {
	Write-Host "Starting PostgreSQL container..." -ForegroundColor Green

	if (-not (Test-Path $composePath)) {
		Write-Host "Error: docker-compose.postgres.yml not found" -ForegroundColor Red
		return
	}

	docker-compose -f $composePath up -d

	Write-Host "PostgreSQL is starting..." -ForegroundColor Yellow
	Start-Sleep -Seconds 5

	$retries = 0
	$maxRetries = 30

	while ($retries -lt $maxRetries) {
		try {
			$result = docker exec niku_telepromter_postgres pg_isready -U postgres
			if ($LASTEXITCODE -eq 0) {
				Write-Host "✓ PostgreSQL is ready!" -ForegroundColor Green
				Write-Host "  Connection: localhost:5432" -ForegroundColor Cyan
				Write-Host "  pgAdmin: http://localhost:5050" -ForegroundColor Cyan
				Write-Host "  User: admin@example.com / admin" -ForegroundColor Cyan
				return
			}
		} catch {
			# Continue waiting
		}

		$retries++
		Write-Host "Waiting for PostgreSQL... ($retries/$maxRetries)" -ForegroundColor Yellow
		Start-Sleep -Seconds 2
	}

	Write-Host "PostgreSQL failed to start" -ForegroundColor Red
}

function Stop-PostgreSQL {
	Write-Host "Stopping PostgreSQL container..." -ForegroundColor Yellow

	docker-compose -f $composePath down

	Write-Host "PostgreSQL stopped" -ForegroundColor Green
}

function Show-Status {
	Write-Host "Checking PostgreSQL container status..." -ForegroundColor Green

	docker-compose -f $composePath ps
}

function Show-Logs {
	Write-Host "PostgreSQL logs:" -ForegroundColor Green

	docker-compose -f $composePath logs -f postgres
}

function Run-Migrations {
	Write-Host "Running Entity Framework migrations..." -ForegroundColor Green

	$serverPath = Join-Path $projectRoot "Niku Telepromter/Niku_Telepromter.Server"

	Push-Location $serverPath

	try {
		Write-Host "Updating database..." -ForegroundColor Yellow
		dotnet ef database update
		Write-Host "✓ Migrations applied successfully!" -ForegroundColor Green
	} catch {
		Write-Host "✗ Migration failed: $_" -ForegroundColor Red
	} finally {
		Pop-Location
	}
}

function Backup-Database {
	Write-Host "Creating database backup..." -ForegroundColor Green

	$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
	$backupFile = "niku_telepromter_backup_$timestamp.sql"

	try {
		docker exec niku_telepromter_postgres pg_dump -U postgres niku_telepromter | Out-File -FilePath $backupFile
		Write-Host "✓ Backup created: $backupFile" -ForegroundColor Green
	} catch {
		Write-Host "✗ Backup failed: $_" -ForegroundColor Red
	}
}

function Restore-Database {
	Write-Host "Restoring database from backup..." -ForegroundColor Green

	$backupFile = Read-Host "Enter backup file path"

	if (-not (Test-Path $backupFile)) {
		Write-Host "Error: Backup file not found" -ForegroundColor Red
		return
	}

	Write-Host "This will overwrite the current database. Continue? (y/n)" -ForegroundColor Yellow
	$confirm = Read-Host

	if ($confirm -ne "y") {
		Write-Host "Restore cancelled" -ForegroundColor Yellow
		return
	}

	try {
		Get-Content $backupFile | docker exec -i niku_telepromter_postgres psql -U postgres niku_telepromter
		Write-Host "✓ Database restored successfully!" -ForegroundColor Green
	} catch {
		Write-Host "✗ Restore failed: $_" -ForegroundColor Red
	}
}

function Open-pgAdmin {
	Write-Host "Opening pgAdmin..." -ForegroundColor Green
	Write-Host "URL: http://localhost:5050" -ForegroundColor Cyan
	Write-Host "Login: admin@example.com / admin" -ForegroundColor Cyan

	Start-Process "http://localhost:5050"
}

function Open-Shell {
	Write-Host "Opening PostgreSQL shell..." -ForegroundColor Green

	docker exec -it niku_telepromter_postgres psql -U postgres -d niku_telepromter
}

# Main execution
switch ($Action.ToLower()) {
	"help" { Show-Help }
	"up" { Start-PostgreSQL }
	"down" { Stop-PostgreSQL }
	"status" { Show-Status }
	"logs" { Show-Logs }
	"migrate" { Run-Migrations }
	"backup" { Backup-Database }
	"restore" { Restore-Database }
	"connect" { Open-pgAdmin }
	"shell" { Open-Shell }
	default { 
		Write-Host "Unknown action: $Action" -ForegroundColor Red
		Show-Help
	}
}

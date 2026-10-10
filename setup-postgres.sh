#!/bin/bash

# Niku TelePrompter PostgreSQL Setup Script
# This script helps set up PostgreSQL for development

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.postgres.yml"
APPSETTINGS_PATH="$PROJECT_ROOT/Niku Telepromter/Niku_Telepromter.Server/appsettings.json"

ACTION="${1:-help}"

show_help() {
	cat << EOF
Niku TelePrompter PostgreSQL Setup Script

Usage: ./setup-postgres.sh [action]

Actions:
  help              Show this help message
  up                Start PostgreSQL container
  down              Stop PostgreSQL container
  status            Show container status
  logs              Show container logs
  migrate           Run EF Core migrations
  backup            Backup the database
  restore           Restore from backup
  connect           Open pgAdmin URL
  shell             Open PostgreSQL shell

Examples:
  ./setup-postgres.sh up
  ./setup-postgres.sh migrate
  ./setup-postgres.sh backup

EOF
}

start_postgresql() {
	echo "Starting PostgreSQL container..."

	if [ ! -f "$COMPOSE_FILE" ]; then
		echo "Error: docker-compose.postgres.yml not found"
		exit 1
	fi

	docker-compose -f "$COMPOSE_FILE" up -d

	echo "PostgreSQL is starting..."
	sleep 5

	# Wait for PostgreSQL to be ready
	RETRIES=0
	MAX_RETRIES=30

	while [ $RETRIES -lt $MAX_RETRIES ]; do
		if docker exec niku_telepromter_postgres pg_isready -U postgres > /dev/null 2>&1; then
			echo "✓ PostgreSQL is ready!"
			echo "  Connection: localhost:5432"
			echo "  pgAdmin: http://localhost:5050"
			echo "  User: admin@example.com / admin"
			return 0
		fi

		RETRIES=$((RETRIES + 1))
		echo "Waiting for PostgreSQL... ($RETRIES/$MAX_RETRIES)"
		sleep 2
	done

	echo "PostgreSQL failed to start"
	exit 1
}

stop_postgresql() {
	echo "Stopping PostgreSQL container..."
	docker-compose -f "$COMPOSE_FILE" down
	echo "PostgreSQL stopped"
}

show_status() {
	echo "PostgreSQL container status:"
	docker-compose -f "$COMPOSE_FILE" ps
}

show_logs() {
	echo "PostgreSQL logs:"
	docker-compose -f "$COMPOSE_FILE" logs -f postgres
}

run_migrations() {
	echo "Running Entity Framework migrations..."

	SERVER_PATH="$PROJECT_ROOT/Niku Telepromter/Niku_Telepromter.Server"

	cd "$SERVER_PATH"

	echo "Updating database..."
	dotnet ef database update

	echo "✓ Migrations applied successfully!"
}

backup_database() {
	echo "Creating database backup..."

	TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
	BACKUP_FILE="niku_telepromter_backup_$TIMESTAMP.sql"

	docker exec niku_telepromter_postgres pg_dump -U postgres niku_telepromter > "$BACKUP_FILE"

	echo "✓ Backup created: $BACKUP_FILE"
}

restore_database() {
	echo "Restoring database from backup..."

	read -p "Enter backup file path: " BACKUP_FILE

	if [ ! -f "$BACKUP_FILE" ]; then
		echo "Error: Backup file not found"
		exit 1
	fi

	read -p "This will overwrite the current database. Continue? (y/n): " CONFIRM

	if [ "$CONFIRM" != "y" ]; then
		echo "Restore cancelled"
		return
	fi

	cat "$BACKUP_FILE" | docker exec -i niku_telepromter_postgres psql -U postgres niku_telepromter

	echo "✓ Database restored successfully!"
}

open_pgadmin() {
	echo "Opening pgAdmin..."
	echo "URL: http://localhost:5050"
	echo "Login: admin@example.com / admin"

	if command -v xdg-open > /dev/null; then
		xdg-open "http://localhost:5050"
	elif command -v open > /dev/null; then
		open "http://localhost:5050"
	else
		echo "Please open http://localhost:5050 in your browser"
	fi
}

open_shell() {
	echo "Opening PostgreSQL shell..."
	docker exec -it niku_telepromter_postgres psql -U postgres -d niku_telepromter
}

# Main execution
case "$ACTION" in
	help)
		show_help
		;;
	up)
		start_postgresql
		;;
	down)
		stop_postgresql
		;;
	status)
		show_status
		;;
	logs)
		show_logs
		;;
	migrate)
		run_migrations
		;;
	backup)
		backup_database
		;;
	restore)
		restore_database
		;;
	connect)
		open_pgadmin
		;;
	shell)
		open_shell
		;;
	*)
		echo "Unknown action: $ACTION"
		show_help
		exit 1
		;;
esac

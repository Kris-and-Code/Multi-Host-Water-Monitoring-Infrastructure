#!/bin/bash
# Water Monitoring Infrastructure - Automated Backup System
set -e

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../backups" && pwd)"
DATA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../data" && pwd)"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="water_monitor_backup_$TIMESTAMP"

echo "Starting backup process: $BACKUP_NAME"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup configuration files
echo "Backing up configuration files..."
tar -czf "$BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz" \
    -C "$(dirname "$DATA_DIR")" configs/

# Create backup manifest
cat > "$BACKUP_DIR/backup_manifest_$TIMESTAMP.txt" << MANIFEST
Water Monitoring Infrastructure Backup
=====================================
Backup Date: $(date)
Backup Name: $BACKUP_NAME
Components Backed Up:
- Configuration files
- System state

Backup Files:
- config_backup_$TIMESTAMP.tar.gz
- backup_manifest_$TIMESTAMP.txt

System Information:
- Hostname: $(hostname)
- OS: $(uname -a)
- Docker Version: $(docker --version)
- Disk Usage: $(df -h / | tail -1)
MANIFEST

# Clean up old backups
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "backup_manifest_*.txt" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully: $BACKUP_NAME"
echo "Backup location: $BACKUP_DIR"

#!/bin/bash

# Water Monitoring Infrastructure - Automated Backup System
set -e

# Configuration
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../backups" && pwd)"
DATA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../data" && pwd)"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="water_monitor_backup_$TIMESTAMP"

echo "Starting backup process: $BACKUP_NAME"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup InfluxDB data
echo "Backing up InfluxDB data..."
docker exec water_monitoring_influxdb influx backup /tmp/backup
docker cp water_monitoring_influxdb:/tmp/backup "$BACKUP_DIR/influxdb_backup_$TIMESTAMP"

# Backup configuration files
echo "Backing up configuration files..."
tar -czf "$BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz" \
    -C "$(dirname "$DATA_DIR")" configs/

# Backup Docker volumes
echo "Backing up Docker volumes..."
docker run --rm -v water_monitoring_influxdb_data:/data -v "$BACKUP_DIR":/backup \
    alpine tar -czf "/backup/volumes_backup_$TIMESTAMP.tar.gz" -C /data .

# Create backup manifest
cat > "$BACKUP_DIR/backup_manifest_$TIMESTAMP.txt" << EOF
Water Monitoring Infrastructure Backup
=====================================
Backup Date: $(date)
Backup Name: $BACKUP_NAME
Components Backed Up:
- InfluxDB data
- Configuration files
- Docker volumes
- System state

Backup Files:
- influxdb_backup_$TIMESTAMP/
- config_backup_$TIMESTAMP.tar.gz
- volumes_backup_$TIMESTAMP.tar.gz
- backup_manifest_$TIMESTAMP.txt

System Information:
- Hostname: $(hostname)
- OS: $(uname -a)
- Docker Version: $(docker --version)
- Disk Usage: $(df -h / | tail -1)
EOF

# Clean up old backups
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "water_monitor_backup_*" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "backup_manifest_*.txt" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully: $BACKUP_NAME"
echo "Backup location: $BACKUP_DIR"

#!/bin/bash
# PandaPrompt OS - Automated Backup Script
# Usage: ./backup.sh

BACKUP_DIR="/var/backups/pandaprompt"
DATE=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="pandaprompt_backup_$DATE.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "Starting PandaPrompt OS backup at $(date)..."

# Create archive of application directory and configs
tar -czf "$BACKUP_DIR/$ARCHIVE_NAME" \
    --exclude="node_modules" \
    --exclude="dist" \
    --exclude=".git" \
    .

echo "Backup completed successfully: $BACKUP_DIR/$ARCHIVE_NAME"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "pandaprompt_backup_*.tar.gz" -mtime +7 -delete
echo "Cleanup complete. Old backups older than 7 days removed."

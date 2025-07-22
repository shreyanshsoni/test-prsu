#!/bin/bash

# Script to remove sensitive files from Git history
# WARNING: This script rewrites Git history. Use with caution.
# Make sure you have a backup before running this script.

set -e

echo "WARNING: This script will rewrite Git history to remove sensitive files."
echo "Make sure you have a backup of your repository before continuing."
echo "All team members will need to re-clone the repository after this operation."
echo ""
read -p "Do you want to continue? (y/N): " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Operation cancelled."
    exit 0
fi

# Create a backup of the repository
echo "Creating backup of the repository..."
BACKUP_DIR="../$(basename $(pwd))-backup-$(date +%Y%m%d%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r .git "$BACKUP_DIR/"
echo "Backup created at $BACKUP_DIR"

# Files to remove from history
FILES_TO_REMOVE=".env.local .env.development .env.production .env"

# Remove each file from Git history
for file in $FILES_TO_REMOVE; do
    echo "Removing $file from Git history..."
    git filter-branch --force --index-filter \
        "git rm --cached --ignore-unmatch $file" \
        --prune-empty --tag-name-filter cat -- --all
done

echo ""
echo "Files have been removed from Git history."
echo "To complete the process, run the following commands:"
echo ""
echo "  git push --force --all"
echo "  git push --force --tags"
echo ""
echo "IMPORTANT: All team members will need to re-clone the repository after this operation."
echo "The backup of your original repository is available at: $BACKUP_DIR" 
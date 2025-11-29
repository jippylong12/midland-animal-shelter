#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build successful!"
  
  # Configuration
  REMOTE_HOST="hostinger-marcus"
  REMOTE_DIR="www/midland-tx-available-pets/"
  ARCHIVE_DIR="archive"
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)

  echo "Deploying to $REMOTE_HOST..."

  # SSH: Archive old files and clean up
  ssh $REMOTE_HOST << EOF
    cd $REMOTE_DIR
    
    # Create archive directory if it doesn't exist
    mkdir -p $ARCHIVE_DIR
    
    # Create a new directory for this backup
    mkdir -p $ARCHIVE_DIR/$TIMESTAMP
    
    # Move all files EXCEPT the archive folder to the new backup folder
    # We use find to list files/dirs, exclude archive, and move them
    # Using ls -A to grab hidden files too, but simple globbing might miss dotfiles if not careful.
    # A safer approach for "everything but X":
    ls -A | grep -v "^$ARCHIVE_DIR$" | xargs -I {} mv {} $ARCHIVE_DIR/$TIMESTAMP/
    
    echo "Archived current version to $ARCHIVE_DIR/$TIMESTAMP"

    # Keep only the last 5 backups
    cd $ARCHIVE_DIR
    ls -t | tail -n +6 | xargs -I {} rm -rf {}
    echo "Cleaned up old archives, keeping last 5."
EOF

  # SCP: Upload new files
  echo "Uploading new files..."
  scp -r dist/* $REMOTE_HOST:$REMOTE_DIR

  echo "Deployment complete!"
fi

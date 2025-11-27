#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build successful!"
  echo "You can now deploy the 'dist' folder to your server."
  echo "To preview the production build locally, run:"
  echo "npm run preview"
else
  echo "Build failed."
  exit 1
fi

#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

<<<<<<< HEAD
# Create the output directory if it doesn't exist
mkdir -p out

# Copy the build files to the output directory
cp -r .next/standalone/* out/
cp -r .next/static out/.next/
cp -r public out/
=======
# Create the output directory structure
echo "Creating output directories..."
mkdir -p out
mkdir -p out/beta
mkdir -p out/beta/dev

# Copy the build files to the output directory
echo "Copying files to output directory..."
cp -r .next/* out/beta/dev/
cp -r public/* out/
>>>>>>> 9eec6a181e7b80c73d3522b845e1a20cc4d1c6bf

echo "Build completed successfully!" 
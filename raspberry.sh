#!/bin/bash

# Exit on any error
set -e

# Navigate to frontend directory
echo "Navigating to frontend directory..."
cd frontend || { echo "Directory 'frontend' not found"; exit 1; }

# Install Node.js dependencies and build frontend
echo "Installing Node.js dependencies..."
npm i

echo "Building frontend..."
npm run build

# Build the Go application
echo "Building Go application..."
cd .. || { echo "Failed to navigate back to root directory"; exit 1; }
go build -o yt-dlp-webui main.go

echo "New EXECUTABLE is ready!!!"
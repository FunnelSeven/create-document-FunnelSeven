#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing Chromium..."
apt-get update
apt-get install -y chromium

echo "Installing npm dependencies..."
npm install --legacy-peer-deps

echo "Building application..."
npm run build

echo "Build completed successfully!"

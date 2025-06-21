#!/usr/bin/env bash
set -o errexit

# Install dependencies
npm --prefix client install --include=dev
npm --prefix server install --include=dev

# Build client with increased memory limit
cd client
node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build
cd ..

# Then build the server
npm --prefix server run build

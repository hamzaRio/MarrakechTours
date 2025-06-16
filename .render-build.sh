#!/usr/bin/env bash
# Install dependencies in both root, client, and server
npm install
npm --prefix client install
npm --prefix server install

# Build the client and server
npm run build

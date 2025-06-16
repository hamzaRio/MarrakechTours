#!/usr/bin/env bash

# Install dependencies for both client and server
npm --prefix client install
npm --prefix server install

# Build frontend and backend
npm --prefix client run build
npm --prefix server run build

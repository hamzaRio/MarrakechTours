#!/usr/bin/env bash
set -o errexit

# Ensure both environments get all deps (including dev)
npm --prefix client install --include=dev
npm --prefix server install --include=dev

npm run build

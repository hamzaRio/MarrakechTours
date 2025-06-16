#!/usr/bin/env bash
set -o errexit

# Ensure both environments get all deps
npm --prefix client install
npm --prefix server install --include=dev

npm run build

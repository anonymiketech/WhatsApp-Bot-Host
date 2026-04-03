#!/bin/bash
echo "Starting ANONYMIKETECH..."
echo "Node version: $(node --version)"
npm install --production --silent 2>/dev/null || true
node server.mjs

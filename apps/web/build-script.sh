#!/bin/bash
set -e

echo "Building packages..."
cd ../../packages/core && npm run build
cd ../ui && npm run build

echo "Building web app..."
cd ../../apps/web && npm run build
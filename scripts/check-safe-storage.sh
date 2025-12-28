#!/bin/bash

echo "🔍 Checking for unsafe localStorage usage..."

# Search for localStorage.getItem( or localStorage.setItem( 
# Exclude: lib/safe-storage.ts and user_read_only_context
UNSAFE_USAGE=$(grep -r "localStorage\.$$getItem\|setItem\|removeItem$$(" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  --exclude-dir="user_read_only_context" \
  . | grep -v "lib/safe-storage.ts")

if [ -n "$UNSAFE_USAGE" ]; then
  echo "❌ ERROR: Direct localStorage usage found outside lib/safe-storage.ts"
  echo ""
  echo "The following files contain unsafe localStorage calls:"
  echo "$UNSAFE_USAGE"
  echo ""
  echo "Please use safeGetItem, safeSetItem, safeGetJSON, safeSetJSON, or safeRemoveItem instead."
  echo "Import from: lib/safe-storage.ts"
  exit 1
else
  echo "✅ All localStorage usage is safe!"
  exit 0
fi

#!/bin/bash
# ═══════════════════════════════════════════════════════
#  ANONYMIKETECH — Pterodactyl Release Builder
#  Builds the full platform into a single deployable zip
# ═══════════════════════════════════════════════════════
set -e

RELEASE_DIR="pterodactyl-release"
ZIP_NAME="anonymiketech-pterodactyl.zip"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  ANONYMIKETECH Pterodactyl Builder   ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Step 1: Clean previous release ─────────────────────
echo "🧹 Cleaning previous release..."
rm -rf "$RELEASE_DIR" "$ZIP_NAME"
mkdir -p "$RELEASE_DIR/public"

# ── Step 2: Build the React frontend ───────────────────
echo ""
echo "📦 Building frontend (React + Vite)..."
(
  cd artifacts/anonymiketech
  PORT=3000 BASE_PATH=/ NODE_ENV=production \
    pnpm vite build --config vite.config.prod.ts
)
echo "   ✓ Frontend built"

# ── Step 3: Copy frontend into release ─────────────────
cp -r artifacts/anonymiketech/dist/public/. "$RELEASE_DIR/public/"
echo "   ✓ Frontend copied to release/public/"

# ── Step 4: Build the API server ───────────────────────
echo ""
echo "⚙️  Building API server (esbuild)..."
(
  cd artifacts/api-server
  SERVE_STATIC=true pnpm run build
)
echo "   ✓ API server built"

# ── Step 5: Copy API build to release ──────────────────
cp artifacts/api-server/dist/index.mjs "$RELEASE_DIR/server.mjs"

# Copy pino logging workers
for f in artifacts/api-server/dist/pino-worker.mjs \
          artifacts/api-server/dist/pino-file.mjs \
          artifacts/api-server/dist/pino-pretty.mjs \
          artifacts/api-server/dist/thread-stream-worker.mjs; do
  [ -f "$f" ] && cp "$f" "$RELEASE_DIR/" && echo "   ✓ Copied $(basename $f)"
done

# ── Step 6: Write production package.json ──────────────
echo ""
echo "📝 Writing package.json..."
cat > "$RELEASE_DIR/package.json" << 'EOF'
{
  "name": "anonymiketech",
  "version": "1.0.0",
  "description": "ANONYMIKETECH WhatsApp Bot Hosting Platform",
  "type": "module",
  "scripts": {
    "start": "node server.mjs"
  },
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "7.0.0-rc.9",
    "protobufjs": "^8.0.0"
  }
}
EOF
echo "   ✓ package.json written"

# ── Step 7: Copy supporting files ──────────────────────
echo ""
echo "📂 Copying support files..."
cp pterodactyl/schema.sql "$RELEASE_DIR/schema.sql"
cp pterodactyl/.env.example "$RELEASE_DIR/.env.example"
cp pterodactyl/README.md "$RELEASE_DIR/README.md"

# ── Step 8: Write startup.sh ───────────────────────────
cat > "$RELEASE_DIR/startup.sh" << 'EOF'
#!/bin/bash
echo "Starting ANONYMIKETECH..."
echo "Node version: $(node --version)"
npm install --production --silent 2>/dev/null || true
node server.mjs
EOF
chmod +x "$RELEASE_DIR/startup.sh"
echo "   ✓ startup.sh written"

# ── Step 9: Create the archive ─────────────────────────
TAR_NAME="${RELEASE_DIR}.tar.gz"
echo ""
echo "🗜️  Creating archive..."
tar -czf "$TAR_NAME" "$RELEASE_DIR/"
echo "   ✓ $TAR_NAME created ($(du -sh $TAR_NAME | cut -f1))"

# ── Done ───────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════╗"
echo "║           Build Complete!            ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "  📦 Release folder: $RELEASE_DIR/"
echo "  🗜️  Archive:        $TAR_NAME"
echo ""
echo "  Contents:"
ls -lh "$RELEASE_DIR/"
echo ""
echo "  Next steps:"
echo "  1. Upload $TAR_NAME (or the $RELEASE_DIR/ folder) to GitHub"
echo "  2. Set up your PostgreSQL DB using schema.sql"
echo "  3. Set environment variables (see .env.example)"
echo "  4. Pterodactyl startup command: npm install --production && node server.mjs"
echo ""

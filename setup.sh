#!/bin/bash
# TBD Stream - Setup & Run Script

echo ""
echo "🎬  T.B.D. Stream Setup"
echo "========================"

# Check for Node
if ! command -v node &> /dev/null; then
  echo "❌  Node.js not found. Install it from https://nodejs.org"
  exit 1
fi

echo "✅  Node.js found: $(node -v)"

# Check for API key
if grep -q "YOUR_TMDB_API_KEY_HERE" server/index.js; then
  echo ""
  echo "⚠️   TMDB API key not set!"
  echo "    1. Go to https://www.themoviedb.org/settings/api"
  echo "    2. Create a free account and get your API key"
  echo "    3. Open server/index.js and replace YOUR_TMDB_API_KEY_HERE"
  echo "    OR run:  export TMDB_API_KEY=your_key_here  before starting"
  echo ""
fi

# Install deps
echo "📦  Installing server dependencies..."
npm install

echo "📦  Installing client dependencies..."
cd client && npm install && cd ..

# Build client
echo "🔨  Building client..."
cd client && npm run build && cd ..

echo ""
echo "✅  Setup complete! Starting server..."
echo ""
npm start

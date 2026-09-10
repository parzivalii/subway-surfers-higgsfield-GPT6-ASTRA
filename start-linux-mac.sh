#!/usr/bin/env bash
echo "========================================================"
echo "   Switchyard Sprint - Subway Surfers Astra"
echo "========================================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH!"
    echo "Please download and install Node.js (LTS version) from: https://nodejs.org/"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing required dependencies (first-time setup)..."
    npm install
fi

echo ""
echo "[INFO] Launching game server..."
echo "[INFO] Opening game in your default browser..."
echo ""

if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173 &
elif command -v open &> /dev/null; then
    open http://localhost:5173 &
fi

npm run dev
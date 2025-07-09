#!/bin/bash

# n8n VS Code Integration Startup Script

echo "🚀 Starting n8n VS Code Integration..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create workflows directory if it doesn't exist
if [ ! -d workflows ]; then
    mkdir -p workflows
    echo "📁 Created workflows directory"
fi

# Start the sync server in the background
echo "🔄 Starting sync server..."
npm start &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start the VS Code integration
echo "🔗 Starting VS Code integration..."
node -e "
const VSCodeN8nIntegration = require('./src/vscode-integration');
new VSCodeN8nIntegration();
console.log('VS Code integration started. Press Ctrl+C to stop.');
process.on('SIGINT', () => {
    console.log('\\n👋 Shutting down...');
    process.exit(0);
});
" &
VSCODE_PID=$!

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping processes..."
    kill $SERVER_PID 2>/dev/null
    kill $VSCODE_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

echo "✅ n8n VS Code Integration is running!"
echo "📊 Dashboard: http://localhost:3000"
echo "📝 Workflow ID: $N8N_WORKFLOW_ID"
echo "🌐 n8n Instance: https://n8n.fahmiarif.dev"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for both processes
wait $SERVER_PID $VSCODE_PID

#!/bin/bash

echo "🎯 n8n VS Code Integration - Quick Tutorial"
echo "=========================================="
echo ""

# Check if the server is running
if ! pgrep -f "node src/index.js" > /dev/null; then
    echo "❌ Sync server is not running. Starting it now..."
    npm start &
    sleep 5
fi

echo "✅ Current setup:"
echo "   - n8n Instance: https://your-n8n-url.dev"
echo "   - Workflow ID: your-worflow-id"
echo "   - Local File: workflows/workflow_your-worflow-id".json"
echo "   - Dashboard: http://localhost:3000"
echo ""

echo "🚀 Available commands:"
echo ""
echo "1. View current workflow:"
echo "   cat workflows/workflow_your-worflow-id".json | jq"
echo ""
echo "2. Edit workflow in VS Code:"
echo "   code workflows/workflow_your-worflow-id".json"
echo ""
echo "3. CLI operations:"
echo "   node cli.js list          # List all workflows"
echo "   node cli.js sync          # Download from n8n"
echo "   node cli.js push          # Upload to n8n"
echo "   node cli.js activate      # Activate workflow"
echo "   node cli.js deactivate    # Deactivate workflow"
echo ""
echo "4. Real-time sync:"
echo "   node test-integration.js  # Start VS Code integration"
echo ""
echo "5. Web dashboard:"
echo "   Open http://localhost:3000 in your browser"
echo ""

echo "🔄 How it works:"
echo "   1. Edit workflows/workflow_your-worflow-id".json in VS Code"
echo "   2. Changes are automatically detected and synced to n8n"
echo "   3. Other connected clients receive real-time updates"
echo "   4. Browser tab refreshes will show the latest changes"
echo ""

echo "🤖 AI Agent Integration:"
echo "   - Use src/n8n-client.js to programmatically modify workflows"
echo "   - Changes are automatically synced across all connected clients"
echo "   - Perfect for AI agents that need to modify n8n workflows"
echo ""

echo "📁 File structure:"
find . -type f -name "*.js" -o -name "*.json" -o -name "*.html" -o -name "*.md" | head -20 | sort
echo ""

echo "🎉 Ready to use! Try editing the workflow file and watch the magic happen!"

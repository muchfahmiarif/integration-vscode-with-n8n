# n8n VS Code Integration

Real-time integration between VS Code and your self-hosted n8n instance, allowing you to modify workflows programmatically and sync them automatically.

## Features

- 🔄 Real-time sync between VS Code and n8n
- 📊 Web dashboard for monitoring and manual operations
- 🛠️ CLI tools for workflow management
- 📁 Local file watching and auto-sync
- 🔗 WebSocket-based real-time communication
- 🎯 AI agent integration ready

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Your `.env` file is already configured with:
- n8n instance URL: `Input your n8n instance URL here`
- API token for authentication
- Workflow ID: `Input your workflow ID here`

### 3. Start the Integration

```bash
# Make start script executable
chmod +x start.sh

# Start all services
./start.sh
```

Or start components individually:

```bash
# Start sync server
npm start

# Start VS Code integration (in another terminal)
npm run watch
```

## Usage

### Web Dashboard
- Open `http://localhost:3000` in your browser
- Monitor connection status
- Edit workflows directly in the browser
- Sync changes to n8n

### CLI Commands

```bash
# Sync workflow from n8n to local file
node cli.js sync

# Push local changes to n8n
node cli.js push

# List all workflows
node cli.js list

# Activate/deactivate workflow
node cli.js activate
node cli.js deactivate

# Execute workflow
node cli.js execute --data '{"key": "value"}'
```

### VS Code Integration

1. The integration automatically downloads your workflow to `workflows/workflow_InputYourIDWorkflow.json`
2. Edit the JSON file in VS Code
3. Changes are automatically synced to n8n
4. Other connected clients receive real-time updates

## File Structure

```
├── src/
│   ├── index.js              # Main entry point
│   ├── n8n-client.js         # n8n API client
│   ├── sync-server.js        # Real-time sync server
│   └── vscode-integration.js # VS Code integration
├── public/
│   └── index.html            # Web dashboard
├── workflows/                # Local workflow files
├── cli.js                    # Command-line interface
├── start.sh                  # Startup script
└── README.md                 # This file
```

## API Endpoints

### REST API
- `GET /api/workflow/:id` - Get workflow
- `PUT /api/workflow/:id` - Update workflow
- `POST /api/workflow/:id/sync` - Sync workflow
- `GET /api/workflows` - List all workflows

### WebSocket Events
- `join-workflow` - Join workflow room
- `workflow-change` - Send workflow changes
- `sync-to-n8n` - Trigger sync to n8n
- `workflow-updated` - Receive workflow updates
- `file-changed` - File change notifications

## AI Agent Integration

The system is designed to work with AI agents:

1. **Programmatic Access**: Use the n8n API client to modify workflows
2. **Real-time Updates**: Changes are immediately reflected in all connected clients
3. **File-based Editing**: AI agents can directly edit the JSON files
4. **Automatic Sync**: Changes are automatically pushed to n8n

### Example AI Agent Usage

```javascript
const N8nClient = require('./src/n8n-client');

const client = new N8nClient();

// Get current workflow
const workflow = await client.getWorkflow();

// Modify workflow (AI agent logic here)
workflow.nodes.push({
  id: 'new-node',
  type: 'n8n-nodes-base.httpRequest',
  // ... node configuration
});

// Update workflow
await client.updateWorkflow(workflow.id, workflow);
```

## Configuration

### Environment Variables

```env
# n8n Configuration
N8N_PROTOCOL=https
N8N_HOST=input-your-n8n-instance-url-here
N8N_API_TOKEN=your-api-token
N8N_WORKFLOW_ID=input-your-workflow-id-here

# Integration Settings
N8N_VSCODE_SYNC_ENABLED=true
PORT=3000
```

### Docker Compose Integration

Your existing `docker-compose.yml` should include the webhook configurations:

```yaml
environment:
  - N8N_PROTOCOL=https
  - N8N_HOST=input-your-n8n-instance-url-here
  - N8N_WEBHOOK_URL=input-your-n8n-webhook-url-here
  - WEBHOOK_URL=input-your-n8n-webhook-url-here
  - VUE_APP_URL_BASE_API=input-your-n8n-webhook-url-here/
```

## Troubleshooting

### Connection Issues
- Check if n8n is accessible at `input-your-n8n-webhook-url-here`
- Verify API token is valid
- Ensure Cloudflare tunnel is working

### Sync Issues
- Check file permissions in `workflows/` directory
- Verify workflow ID exists in n8n
- Check server logs for errors

### Performance
- The system uses WebSockets for real-time updates
- File watching is optimized for minimal resource usage
- Sync operations are throttled to prevent API rate limits

## Security Notes

- API token is stored in `.env` file (don't commit to version control)
- WebSocket connections are local-only by default
- Consider using HTTPS for production deployments
- Implement proper authentication for multi-user environments

## License

MIT License - feel free to modify and distribute as needed.

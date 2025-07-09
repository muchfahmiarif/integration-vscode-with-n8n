const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");
const N8nClient = require("./n8n-client");
require("dotenv").config();

class N8nSyncServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.n8nClient = new N8nClient();
    this.workflowsPath = path.join(__dirname, "..", "workflows");
    this.port = process.env.PORT || 3000;

    this.setupExpress();
    this.setupSocketIO();
    this.setupFileWatcher();
  }

  setupExpress() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, "..", "public")));

    // API Routes
    this.app.get("/api/workflow/:id", async (req, res) => {
      try {
        const workflow = await this.n8nClient.getWorkflow(req.params.id);
        res.json(workflow);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.put("/api/workflow/:id", async (req, res) => {
      try {
        const result = await this.n8nClient.updateWorkflow(
          req.params.id,
          req.body
        );

        // Broadcast update to all connected clients
        this.io.emit("workflow-updated", {
          workflowId: req.params.id,
          data: result,
        });

        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post("/api/workflow/:id/sync", async (req, res) => {
      try {
        await this.syncWorkflowToN8n(req.params.id);
        res.json({ message: "Workflow synced successfully" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get("/api/workflows", async (req, res) => {
      try {
        const workflows = await this.n8nClient.getAllWorkflows();
        res.json(workflows);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  setupSocketIO() {
    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join-workflow", (workflowId) => {
        socket.join(`workflow-${workflowId}`);
        console.log(`Client ${socket.id} joined workflow ${workflowId}`);
      });

      socket.on("workflow-change", async (data) => {
        try {
          // Save to local file
          await this.saveWorkflowLocally(data.workflowId, data.workflow);

          // Broadcast to other clients in the same workflow room
          socket
            .to(`workflow-${data.workflowId}`)
            .emit("workflow-updated", data);

          // Optional: Auto-sync to n8n
          if (data.autoSync) {
            await this.syncWorkflowToN8n(data.workflowId);
          }
        } catch (error) {
          socket.emit("error", { message: error.message });
        }
      });

      socket.on("sync-to-n8n", async (workflowId) => {
        try {
          await this.syncWorkflowToN8n(workflowId);
          socket.emit("sync-success", { workflowId });
        } catch (error) {
          socket.emit("sync-error", { workflowId, error: error.message });
        }
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  setupFileWatcher() {
    // Create workflows directory if it doesn't exist
    if (!fs.existsSync(this.workflowsPath)) {
      fs.mkdirSync(this.workflowsPath, { recursive: true });
    }

    const watcher = chokidar.watch(this.workflowsPath, {
      ignored: /^\./,
      persistent: true,
    });

    watcher.on("change", async (filePath) => {
      console.log("File changed:", filePath);
      const workflowId = this.extractWorkflowIdFromPath(filePath);

      if (workflowId) {
        try {
          const workflow = await this.n8nClient.loadWorkflowFromFile(filePath);

          // Broadcast file change to all connected clients
          this.io.to(`workflow-${workflowId}`).emit("file-changed", {
            workflowId,
            workflow,
            filePath,
          });
        } catch (error) {
          console.error("Error processing file change:", error.message);
        }
      }
    });
  }

  extractWorkflowIdFromPath(filePath) {
    const filename = path.basename(filePath, ".json");
    const match = filename.match(/workflow_(.+)/);
    return match ? match[1] : null;
  }

  async saveWorkflowLocally(workflowId, workflowData) {
    const filePath = path.join(
      this.workflowsPath,
      `workflow_${workflowId}.json`
    );
    fs.writeFileSync(filePath, JSON.stringify(workflowData, null, 2));
    console.log(`Workflow ${workflowId} saved locally`);
  }

  async syncWorkflowToN8n(workflowId) {
    const filePath = path.join(
      this.workflowsPath,
      `workflow_${workflowId}.json`
    );
    if (fs.existsSync(filePath)) {
      await this.n8nClient.syncFileToN8n(filePath, workflowId);
      console.log(`Workflow ${workflowId} synced to n8n`);
    } else {
      throw new Error(`Workflow file not found: ${filePath}`);
    }
  }

  async start() {
    this.server.listen(this.port, () => {
      console.log(`n8n Sync Server running on port ${this.port}`);
      console.log(`Dashboard: http://localhost:${this.port}`);
    });

    // Initial sync - download current workflow
    try {
      await this.n8nClient.saveWorkflowToFile();
      console.log("Initial workflow synced from n8n");
    } catch (error) {
      console.error("Error during initial sync:", error.message);
    }
  }
}

module.exports = N8nSyncServer;

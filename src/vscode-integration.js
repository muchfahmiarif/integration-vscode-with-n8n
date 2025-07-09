const io = require("socket.io-client");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
require("dotenv").config();

class VSCodeN8nIntegration {
  constructor() {
    this.socket = io("http://localhost:3000");
    this.workflowId = process.env.N8N_WORKFLOW_ID;
    this.workflowPath = path.join(
      __dirname,
      "..",
      "workflows",
      `workflow_${this.workflowId}.json`
    );

    this.setupSocketEvents();
    this.setupFileWatcher();
  }

  setupSocketEvents() {
    this.socket.on("connect", () => {
      console.log("Connected to n8n sync server");
      this.socket.emit("join-workflow", this.workflowId);
    });

    this.socket.on("workflow-updated", (data) => {
      console.log("Workflow updated:", data.workflowId);
      this.updateLocalFile(data.data);
    });

    this.socket.on("file-changed", (data) => {
      console.log("File changed on server:", data.filePath);
      // Handle file changes from other clients
    });

    this.socket.on("sync-success", (data) => {
      console.log("Sync successful:", data.workflowId);
    });

    this.socket.on("sync-error", (data) => {
      console.error("Sync error:", data.error);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from n8n sync server");
    });
  }

  setupFileWatcher() {
    const watcher = chokidar.watch(this.workflowPath, {
      ignored: /^\./,
      persistent: true,
    });

    watcher.on("change", () => {
      console.log("Local workflow file changed");
      this.syncToN8n();
    });
  }

  updateLocalFile(workflowData) {
    try {
      const dir = path.dirname(this.workflowPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.workflowPath,
        JSON.stringify(workflowData, null, 2)
      );
      console.log("Local workflow file updated");
    } catch (error) {
      console.error("Error updating local file:", error.message);
    }
  }

  syncToN8n() {
    if (fs.existsSync(this.workflowPath)) {
      try {
        const workflowData = JSON.parse(
          fs.readFileSync(this.workflowPath, "utf8")
        );
        this.socket.emit("workflow-change", {
          workflowId: this.workflowId,
          workflow: workflowData,
          autoSync: true,
        });
      } catch (error) {
        console.error("Error syncing to n8n:", error.message);
      }
    }
  }

  manualSync() {
    this.socket.emit("sync-to-n8n", this.workflowId);
  }
}

module.exports = VSCodeN8nIntegration;

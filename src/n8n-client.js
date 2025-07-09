const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

class N8nClient {
  constructor() {
    this.baseURL = process.env.N8N_PROTOCOL + "://" + process.env.N8N_HOST;
    this.apiToken = process.env.N8N_API_TOKEN;
    this.workflowId = process.env.N8N_WORKFLOW_ID;

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "X-N8N-API-KEY": this.apiToken,
        "Content-Type": "application/json",
      },
    });
  }

  async getWorkflow(workflowId = this.workflowId) {
    try {
      const response = await this.client.get(`/api/v1/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching workflow:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async updateWorkflow(workflowId = this.workflowId, workflowData) {
    try {
      const response = await this.client.put(
        `/api/v1/workflows/${workflowId}`,
        workflowData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error updating workflow:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async activateWorkflow(workflowId = this.workflowId) {
    try {
      const response = await this.client.post(
        `/api/v1/workflows/${workflowId}/activate`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error activating workflow:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async deactivateWorkflow(workflowId = this.workflowId) {
    try {
      const response = await this.client.post(
        `/api/v1/workflows/${workflowId}/deactivate`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error deactivating workflow:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getAllWorkflows() {
    try {
      const response = await this.client.get("/api/v1/workflows");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching workflows:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async executeWorkflow(workflowId = this.workflowId, inputData = {}) {
    try {
      const response = await this.client.post(
        `/api/v1/workflows/${workflowId}/execute`,
        inputData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error executing workflow:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  // Save workflow to local file
  async saveWorkflowToFile(workflowId = this.workflowId, filename = null) {
    try {
      const workflow = await this.getWorkflow(workflowId);
      const fileName = filename || `workflow_${workflowId}.json`;
      const filePath = path.join(__dirname, "..", "workflows", fileName);

      // Create workflows directory if it doesn't exist
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
      console.log(`Workflow saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error("Error saving workflow to file:", error.message);
      throw error;
    }
  }

  // Load workflow from local file
  async loadWorkflowFromFile(filePath) {
    try {
      const workflowData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return workflowData;
    } catch (error) {
      console.error("Error loading workflow from file:", error.message);
      throw error;
    }
  }

  // Sync local file to n8n
  async syncFileToN8n(filePath, workflowId = this.workflowId) {
    try {
      const workflowData = await this.loadWorkflowFromFile(filePath);
      const result = await this.updateWorkflow(workflowId, workflowData);
      console.log(`Workflow ${workflowId} synced successfully`);
      return result;
    } catch (error) {
      console.error("Error syncing file to n8n:", error.message);
      throw error;
    }
  }
}

module.exports = N8nClient;

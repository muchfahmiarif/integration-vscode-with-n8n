const N8nClient = require("./src/n8n-client");
const fs = require("fs");
const path = require("path");

/**
 * Example AI Agent that modifies n8n workflows
 * This demonstrates how an AI agent can programmatically modify workflows
 */
class AIWorkflowAgent {
  constructor() {
    this.n8nClient = new N8nClient();
    this.workflowId = process.env.N8N_WORKFLOW_ID;
  }

  async analyzeWorkflow() {
    console.log("🤖 AI Agent: Analyzing current workflow...");

    const workflow = await this.n8nClient.getWorkflow(this.workflowId);

    console.log(`📊 Workflow Analysis:`);
    console.log(`   - Name: ${workflow.name}`);
    console.log(`   - Nodes: ${workflow.nodes.length}`);
    console.log(
      `   - Connections: ${
        workflow.connections ? Object.keys(workflow.connections).length : 0
      }`
    );
    console.log(`   - Active: ${workflow.active}`);

    return workflow;
  }

  async addHttpRequestNode(workflow) {
    console.log("🔧 AI Agent: Adding HTTP Request node...");

    const newNode = {
      id: `ai-http-${Date.now()}`,
      name: "AI Generated HTTP Request",
      type: "n8n-nodes-base.httpRequest",
      position: [400, 300],
      parameters: {
        url: "https://api.github.com/repos/n8n-io/n8n",
        options: {},
        authentication: "none",
      },
      typeVersion: 1,
    };

    workflow.nodes.push(newNode);

    // Add connection if there's a manual trigger
    const manualTrigger = workflow.nodes.find(
      (node) => node.type === "n8n-nodes-base.manualTrigger"
    );

    if (manualTrigger) {
      if (!workflow.connections) workflow.connections = {};
      if (!workflow.connections[manualTrigger.name]) {
        workflow.connections[manualTrigger.name] = {};
      }
      workflow.connections[manualTrigger.name].main = [
        [
          {
            node: newNode.name,
            type: "main",
            index: 0,
          },
        ],
      ];
    }

    console.log(`✅ Added node: ${newNode.name}`);
    return workflow;
  }

  async addWebhookNode(workflow) {
    console.log("🔧 AI Agent: Adding Webhook node...");

    const newNode = {
      id: `ai-webhook-${Date.now()}`,
      name: "AI Generated Webhook",
      type: "n8n-nodes-base.webhook",
      position: [200, 200],
      parameters: {
        path: "ai-webhook",
        httpMethod: "POST",
        responseMode: "responseNode",
      },
      typeVersion: 1,
      webhookId: `ai-webhook-${Date.now()}`,
    };

    workflow.nodes.push(newNode);

    console.log(`✅ Added node: ${newNode.name}`);
    return workflow;
  }

  async optimizeWorkflow(workflow) {
    console.log("🚀 AI Agent: Optimizing workflow...");

    // Add error handling nodes
    const errorNodes = workflow.nodes.filter(
      (node) => node.type === "n8n-nodes-base.errorTrigger"
    );

    if (errorNodes.length === 0) {
      const errorNode = {
        id: `ai-error-${Date.now()}`,
        name: "AI Error Handler",
        type: "n8n-nodes-base.errorTrigger",
        position: [600, 400],
        parameters: {},
        typeVersion: 1,
      };

      workflow.nodes.push(errorNode);
      console.log("✅ Added error handling");
    }

    // Update workflow settings
    workflow.settings = {
      ...workflow.settings,
      errorWorkflow: {
        continueOnFail: true,
        retryOnFail: true,
        retrySettings: {
          maxTries: 3,
          waitTime: 1000,
        },
      },
    };

    console.log("✅ Optimized workflow settings");
    return workflow;
  }

  async demonstrateAIModification() {
    try {
      console.log("🎯 AI Agent Starting Workflow Modification Demo...");
      console.log("================================================");

      // 1. Analyze current workflow
      let workflow = await this.analyzeWorkflow();

      // 2. Make AI-driven modifications
      workflow = await this.addHttpRequestNode(workflow);
      workflow = await this.addWebhookNode(workflow);
      workflow = await this.optimizeWorkflow(workflow);

      // 3. Save locally first (this will trigger real-time sync)
      await this.n8nClient.saveWorkflowToFile(
        this.workflowId,
        `workflow_${this.workflowId}.json`
      );

      // 4. Update n8n
      console.log("📤 AI Agent: Syncing changes to n8n...");
      await this.n8nClient.updateWorkflow(this.workflowId, workflow);

      console.log("✅ AI Agent: Workflow successfully modified!");
      console.log(
        "🔄 All connected VS Code instances will receive real-time updates"
      );
      console.log(
        "🌐 Browser tabs will automatically refresh with new changes"
      );
    } catch (error) {
      console.error("❌ AI Agent Error:", error.message);
    }
  }

  async revertChanges() {
    console.log("🔄 AI Agent: Reverting to original workflow...");

    // This would typically restore from a backup
    const originalWorkflow = await this.n8nClient.getWorkflow(this.workflowId);

    // Remove AI-generated nodes
    const cleanedWorkflow = {
      ...originalWorkflow,
      nodes: originalWorkflow.nodes.filter(
        (node) => !node.id.startsWith("ai-")
      ),
    };

    await this.n8nClient.updateWorkflow(this.workflowId, cleanedWorkflow);
    console.log("✅ AI Agent: Workflow reverted to original state");
  }
}

// Demo execution
async function runDemo() {
  const agent = new AIWorkflowAgent();

  console.log("🚀 Starting AI Agent Demo...");
  console.log(
    "This demo shows how an AI agent can modify n8n workflows in real-time"
  );
  console.log("");

  // Run the demonstration
  await agent.demonstrateAIModification();

  console.log("");
  console.log(
    "🎉 Demo complete! Check your VS Code and browser for real-time updates"
  );
  console.log("");
  console.log("To revert changes, run:");
  console.log("node ai-agent-demo.js revert");
}

// Handle command line arguments
if (process.argv.includes("revert")) {
  const agent = new AIWorkflowAgent();
  agent.revertChanges();
} else {
  runDemo().catch(console.error);
}

module.exports = AIWorkflowAgent;

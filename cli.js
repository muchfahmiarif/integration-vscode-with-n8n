#!/usr/bin/env node

const { Command } = require("commander");
const N8nClient = require("./src/n8n-client");
const VSCodeN8nIntegration = require("./src/vscode-integration");

const program = new Command();
const n8nClient = new N8nClient();

program
  .name("n8n-vscode")
  .description("CLI tool for n8n VS Code integration")
  .version("1.0.0");

program
  .command("sync")
  .description("Sync workflow from n8n to local file")
  .option("-i, --id <workflowId>", "Workflow ID")
  .action(async (options) => {
    try {
      const workflowId = options.id || process.env.N8N_WORKFLOW_ID;
      const filePath = await n8nClient.saveWorkflowToFile(workflowId);
      console.log(`Workflow synced to: ${filePath}`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

program
  .command("push")
  .description("Push local workflow file to n8n")
  .option("-i, --id <workflowId>", "Workflow ID")
  .option("-f, --file <filePath>", "Local workflow file path")
  .action(async (options) => {
    try {
      const workflowId = options.id || process.env.N8N_WORKFLOW_ID;
      const filePath =
        options.file || `./workflows/workflow_${workflowId}.json`;
      await n8nClient.syncFileToN8n(filePath, workflowId);
      console.log(`Workflow ${workflowId} pushed to n8n`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

program
  .command("watch")
  .description("Start VS Code integration watcher")
  .action(() => {
    console.log("Starting VS Code integration...");
    new VSCodeN8nIntegration();
  });

program
  .command("list")
  .description("List all workflows")
  .action(async () => {
    try {
      const workflows = await n8nClient.getAllWorkflows();
      console.log("Available workflows:");
      workflows.data.forEach((workflow) => {
        console.log(
          `- ${workflow.id}: ${workflow.name} (${
            workflow.active ? "active" : "inactive"
          })`
        );
      });
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

program
  .command("activate")
  .description("Activate a workflow")
  .option("-i, --id <workflowId>", "Workflow ID")
  .action(async (options) => {
    try {
      const workflowId = options.id || process.env.N8N_WORKFLOW_ID;
      await n8nClient.activateWorkflow(workflowId);
      console.log(`Workflow ${workflowId} activated`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

program
  .command("deactivate")
  .description("Deactivate a workflow")
  .option("-i, --id <workflowId>", "Workflow ID")
  .action(async (options) => {
    try {
      const workflowId = options.id || process.env.N8N_WORKFLOW_ID;
      await n8nClient.deactivateWorkflow(workflowId);
      console.log(`Workflow ${workflowId} deactivated`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

program
  .command("execute")
  .description("Execute a workflow")
  .option("-i, --id <workflowId>", "Workflow ID")
  .option("-d, --data <data>", "Input data as JSON string")
  .action(async (options) => {
    try {
      const workflowId = options.id || process.env.N8N_WORKFLOW_ID;
      const inputData = options.data ? JSON.parse(options.data) : {};
      const result = await n8nClient.executeWorkflow(workflowId, inputData);
      console.log("Execution result:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

program.parse();

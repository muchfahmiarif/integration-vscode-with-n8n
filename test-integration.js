const VSCodeN8nIntegration = require("./src/vscode-integration");

console.log("Starting VS Code integration test...");

// Start the integration
const integration = new VSCodeN8nIntegration();

// Keep the process alive
setInterval(() => {
  console.log("Integration running... (Press Ctrl+C to stop)");
}, 30000);

process.on("SIGINT", () => {
  console.log("\nStopping VS Code integration...");
  process.exit(0);
});

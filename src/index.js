const N8nSyncServer = require("./sync-server");

async function main() {
  const server = new N8nSyncServer();
  await server.start();
}

main().catch(console.error);

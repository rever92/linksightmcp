// Wrapper CJS para Phusion Passenger — carga el server ESM via dynamic import()
async function main() {
  await import('./src/server.js');
}
main().catch(err => {
  console.error('Failed to start MCP server:', err);
  process.exit(1);
});

import express from 'express';
import { randomUUID } from 'crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { toolSchemas } from './tools/schemas.js';
import { toolHandlers } from './tools/index.js';

const app = express();
app.use(express.json());

// CORS — claude.ai and other MCP clients need access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id');
  res.header('Access-Control-Expose-Headers', 'Mcp-Session-Id');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// --- Auth: bearer token to protect the MCP endpoint ---
const MCP_AUTH_TOKEN = process.env.MCP_AUTH_TOKEN || '';

function authGuard(req, res, next) {
  if (!MCP_AUTH_TOKEN) return next(); // open in dev
  const header = req.headers.authorization;
  if (header === `Bearer ${MCP_AUTH_TOKEN}`) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// --- Health check (public) ---
app.get('/health', (_req, res) => res.json({ status: 'ok', server: 'linksight-mcp' }));

// --- Create MCP server instance ---
function createMCPServer() {
  const server = new Server(
    { name: 'linksight', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.entries(toolSchemas).map(([name, schema]) => ({
      name,
      description: schema.description,
      inputSchema: schema.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const handler = toolHandlers[name];
    if (!handler) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: false, error: { code: 404, message: `Unknown tool: ${name}` } }) }],
        isError: true,
      };
    }
    try {
      return await handler(args || {});
    } catch (e) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: false, error: { code: 500, message: e.message } }) }],
        isError: true,
      };
    }
  });

  return server;
}

// --- Session management ---
const sessions = new Map();

// POST /mcp — main MCP endpoint
app.post('/mcp', authGuard, async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'];

    if (sessionId && sessions.has(sessionId)) {
      const { transport } = sessions.get(sessionId);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    // New session
    const server = createMCPServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    transport.onclose = () => {
      const sid = transport.sessionId;
      if (sid) sessions.delete(sid);
      server.close().catch(() => {});
    };

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

    if (transport.sessionId) {
      sessions.set(transport.sessionId, { server, transport });
    }
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

// GET /mcp — SSE stream (notifications)
app.get('/mcp', authGuard, async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  if (!sessionId || !sessions.has(sessionId)) {
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Invalid or missing session ID. POST first to initialize.' },
      id: null,
    });
    return;
  }
  const { transport } = sessions.get(sessionId);
  await transport.handleRequest(req, res);
});

// DELETE /mcp — session cleanup
app.delete('/mcp', authGuard, async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  if (!sessionId || !sessions.has(sessionId)) {
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Invalid or missing session ID' },
      id: null,
    });
    return;
  }
  const { transport } = sessions.get(sessionId);
  await transport.close();
  sessions.delete(sessionId);
  res.status(200).json({ success: true });
});

// --- Start ---
const PORT = process.env.PORT || process.env.MCP_PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Linksight MCP server running on port ${PORT}`);
  console.log(`Auth: ${MCP_AUTH_TOKEN ? 'enabled (MCP_AUTH_TOKEN set)' : 'DISABLED (set MCP_AUTH_TOKEN to secure)'}`);
  if (typeof PhusionPassenger !== 'undefined') {
    console.log('Running under Phusion Passenger');
  }
});

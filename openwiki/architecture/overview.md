---
type: architecture overview
title: System architecture
description: Composition and dependency boundaries of the Linksight MCP proxy.
tags: [architecture, runtime, mcp]
---

# System architecture

`src/server.js` is the composition root. It creates Express middleware, the MCP `Server`, `StreamableHTTPServerTransport` instances, the session map, and the listener. `app.cjs` exists only to let Phusion Passenger load the ESM server through dynamic `import()`.

The process has three boundaries: MCP clients call `/mcp`; `server.js` dispatches tool names through `toolSchemas` and `toolHandlers`; handlers call the external Linksight API through `createClient()` and its bearer-token provider in `auth.js`. The external backend owns persistence, authorization, and response schemas.

```mermaid
sequenceDiagram
    participant Client as MCP client
    participant HTTP as Express server
    participant MCP as MCP Server
    participant Handler as Tool handler
    participant Auth as Token store
    participant API as Linksight API
    Client->>HTTP: JSON-RPC POST /mcp
    HTTP->>MCP: StreamableHTTP transport
    MCP->>Handler: dispatch tool name
    Handler->>Auth: getValidAccessToken
    Auth->>API: refresh or login when needed
    Handler->>API: REST request
    API-->>Handler: JSON or text response
    Handler-->>MCP: success or error text envelope
    MCP-->>Client: JSON-RPC response
```

Caption: an MCP tool call crosses the transport, handler registry, authentication, and external API boundaries.

## Change navigation

- Transport or session behavior: [MCP transport](mcp-transport.md).
- Token and REST behavior: [Authentication and API client](../authentication/client.md).
- Tool registration: [Tool surface](../tools/overview.md).
- Deployment: [Operations](../operations/deployment.md).

Focused validation is `node --check src/server.js`, followed by a health request and MCP initialize/list call. No automated tests are present.

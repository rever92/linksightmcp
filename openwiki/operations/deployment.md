---
type: operations guide
title: Deployment and operations
description: Startup modes, environment configuration, health checks, and automated wiki refresh.
tags: [operations, deployment, configuration]
---

# Deployment and operations

`npm start` runs `node src/server.js`. Plesk Passenger uses `app.cjs`, which imports the ESM server. The listener binds `0.0.0.0` and selects `PORT`, then `MCP_PORT`, then `3002`. `.env.example` documents `MCP_AUTH_TOKEN`, `LINKSIGHT_API_URL`, `LINKSIGHT_EMAIL`, `LINKSIGHT_PASSWORD`, and `MCP_PORT`; do not commit real values.

`GET /health` returns `{status:'ok',server:'linksight-mcp'}` and is public. Production should set `MCP_AUTH_TOKEN`; an empty value intentionally disables the MCP bearer guard for development. Tokens and sessions are process-local and disappear on restart, so horizontal scaling requires external coordination not implemented here.

`SETUP.md` documents the deployed HTTPS endpoint `https://mcp.linksight.es/mcp`, bearer header, Claude configuration, StreamableHTTP methods, and Plesk restart procedure. The GitHub workflow runs OpenWiki daily at 08:00 UTC or manually, installs pinned tooling, runs `openwiki code --update --print`, and opens an update PR.

On Passenger, `app.cjs` is the startup file and its `main()` dynamic import logs `Failed to start MCP server:` and exits 1 on import failure; direct Node startup is `npm start`. Verify both paths, the startup auth-mode log, and port precedence with isolated processes. Smoke-check public health, 401 protection when `MCP_AUTH_TOKEN` is set, open development mode when unset, MCP initialize, and health on the selected port. Because `MCP_AUTH_TOKEN`, `sessions`, and token state are module globals, each auth, transport, tool, analytics, and deployment smoke case should run in a fresh process rather than mutate a reused module; tool/API stubs should be reset between cases. There is no repository test script.

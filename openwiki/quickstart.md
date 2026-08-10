---
type: wiki entrypoint
title: Linksight MCP code wiki
description: Navigation and task routing for the Linksight remote MCP server and its 20 tool integrations.
tags: [quickstart, mcp, linksight]
---

# Linksight MCP code wiki

This repository is a small Node.js ESM proxy that exposes 20 Linksight API capabilities through MCP StreamableHTTP. Start with [system architecture](architecture/overview.md), then use [MCP transport](architecture/mcp-transport.md) for request lifecycle, [authentication and API client](authentication/client.md) for the backend boundary, and [tool surface](tools/overview.md) for registration and domain routing.

## Main concepts

- [MCP transport and sessions](architecture/mcp-transport.md): `/health`, `/mcp`, bearer protection, CORS, session lifecycle, and error branches.
- [Authentication and API client](authentication/client.md): process-global tokens, refresh/login fallback, URL construction, serialization, and normalized errors.
- [Tool surface](tools/overview.md): schema/handler registry, MCP envelopes, all 20 names, and extension rules.
- [Authentication tools](tools/authentication.md), [post tools](tools/posts.md), [planner tools](tools/planner.md), [premium tools](tools/premium.md), [billing tools](tools/billing.md), [recommendations](tools/recommendations.md), and [analytics summary](tools/analytics.md).
- [Deployment and operations](operations/deployment.md): startup, Passenger, environment variables, health checks, and OpenWiki automation.

## Task routing

| Intent | Canonical page | Source entrypoints | Focused validation |
|---|---|---|---|
| Change `/mcp`, sessions, auth guard, or CORS | [Transport](architecture/mcp-transport.md) | `src/server.js:authGuard`, `app.post/get/delete('/mcp')`, `sessions` | Fresh-process branch smoke tests and `node --check src/server.js` |
| Change backend login, refresh, or REST calls | [Auth/client](authentication/client.md) | `src/auth.js:getValidAccessToken`, `src/api-client.js:createClient` | Stub refresh/login and non-2xx/text responses |
| Add or rename an MCP tool | [Tool surface](tools/overview.md) | `src/tools/schemas.js:toolSchemas`, `src/tools/index.js:toolHandlers` | Registry-key parity, `tools/list`, stubbed `tools/call` |
| Change LinkedIn post ingestion | [Posts](tools/posts.md) | `linksight_posts_*` handlers | Assert encoded URL, body, count, and failure envelope |
| Change planner lifecycle or optimization | [Planner](tools/planner.md) | `linksight_planner_*` handlers | Assert partial payload and state enum behavior |
| Change premium usage | [Premium](tools/premium.md) | `linksight_premium_*` handlers | Stub GET/action requests without live side effects |
| Change Stripe/products | [Billing](tools/billing.md) | `linksight_products_list`, `linksight_stripe_*` | Assert nested response projections |
| Change AI recommendations | [Recommendations](tools/recommendations.md) | `linksight_recommendations_*` handlers | Test null latest and five-field save |
| Change computed analytics | [Analytics](tools/analytics.md) | `linksight_analytics_summary` | Fixtures for empty, missing metrics, ties, dates, and zero views |
| Change deployment or port/auth configuration | [Operations](operations/deployment.md) | `package.json`, `app.cjs`, `src/server.js`, `.env.example` | Fresh-process startup, health, auth, and precedence checks |

## Runtime commands

```bash
npm start
node app.cjs
```

The service defaults to port `3002`, with precedence `PORT`, then `MCP_PORT`, then `3002`. `GET /health` is public. Set `MCP_AUTH_TOKEN` to protect `/mcp`; set `LINKSIGHT_API_URL`, `LINKSIGHT_EMAIL`, and `LINKSIGHT_PASSWORD` for the proxied backend.

## Scope and evidence

The backend API, persistence schemas, Stripe behavior, and production infrastructure are outside this repository; pages describe only the calls and assumptions evidenced here. No automated test files or test script are present. The narrowest general checks are syntax checks, fresh-process HTTP stubs, health requests, and MCP initialize/list/call smoke tests. `SETUP.md` remains the deployment-oriented operator reference, while source code is authoritative for runtime behavior.

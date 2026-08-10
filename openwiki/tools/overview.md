---
type: public tool surface
title: MCP tool surface
description: Registration contract, response envelope, and complete tool inventory for the Linksight MCP server.
tags: [mcp, tools, api]
---

# MCP tool surface

`src/tools/schemas.js:toolSchemas` describes public names, inputs, required fields, and enums. `src/tools/index.js:toolHandlers` implements the same keys. `server.js` exposes schemas through `tools/list` and dispatches calls through `tools/call`; CallTool resolves `toolHandlers[name]`, passes `request.params.arguments || {}`, returns a text `isError` response with code 404 for unknown names, and converts uncaught exceptions to code 500. Adding a tool requires both maps plus its upstream API contract. The current source has one-to-one parity across all 20 schema and handler keys; maintain that invariant with a registry-key comparison check.

Handlers normally use `ok(data, meta)` for JSON text `{success:true,data,meta}` and `fail(code,message,hint)` for `{success:false,error}` with `isError:true`. Handler exceptions are converted by the server to code 500.

| Domain | Tools | Upstream routes |
|---|---|---|
| Auth | `linksight_login`, `linksight_whoami`, `linksight_profile` | POST `auth/login`; GET `auth/me`, `user/profile` |
| Posts | `linksight_posts_list`, `linksight_posts_upsert`, `linksight_posts_update_category` | GET `posts`; POST `posts/upsert`; PUT `posts/{url}/category` |
| Planner | `linksight_planner_list`, `linksight_planner_create`, `linksight_planner_update`, `linksight_planner_save_optimization` | `planner/posts` and `planner/posts/{id}` routes |
| Premium | `linksight_premium_limits`, `linksight_premium_usage`, `linksight_premium_cycle_usage`, `linksight_premium_record_action` | `premium/limits`, `premium/usage`, `premium/cycle-usage`, POST `premium/actions` |
| Billing | `linksight_products_list`, `linksight_stripe_checkout`, `linksight_stripe_portal` | GET `products`; POST `stripe/checkout`, `stripe/portal` |
| Recommendations | `linksight_recommendations_latest`, `linksight_recommendations_save` | GET `recommendations/latest`; POST `recommendations` |
| Analytics | `linksight_analytics_summary` | GET `posts`, then local computation |

Detailed contracts live in [authentication](authentication.md), [posts](posts.md), [planner](planner.md), [premium](premium.md), [billing](billing.md), [recommendations](recommendations.md), and [analytics](analytics.md). Verify each domain with an isolated HTTP stub asserting method, path, body, optional-field behavior, projection, count, and normalized failure; analytics needs fixtures for empty input, defaults, ties, category fallback, zero views, long text, month boundaries, and malformed dates. MCP `tools/list` plus `node --check src/tools/*.js` are the narrowest static checks; no test suite is present.

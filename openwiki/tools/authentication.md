---
type: tool domain
title: Authentication tools
description: MCP tools for login, identity status, and the full user profile.
tags: [tools, authentication]
---

# Authentication tools

- `linksight_login(email,password)` directly POSTs `auth/login`, stores the complete token response with `setTokens`, and returns only email, role, and subscription status. Upstream failures preserve status and error text; because token storage occurs only after an OK response, a failed explicit login preserves any prior in-memory account and tokens. Success returns the selected email, role, and subscription status while the full token response remains process-local.
- `linksight_whoami` returns cached `getTokens().user`; without a cached user it GETs `auth/me`, caches `data.user`, or returns 401 with a hint to log in or configure credentials.
- `linksight_profile` GETs `user/profile` and passes the response through the common envelope.

Schemas and handlers must change together. The backend owns credential validation and profile shape. Validate through MCP calls against a safe test account or a stub server; no automated tests exist.
ough MCP calls against a safe test account or a stub server; no automated tests exist.

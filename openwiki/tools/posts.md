---
type: tool domain
title: LinkedIn post tools
description: Post analytics ingestion, listing, and category update tools.
tags: [tools, linkedin, analytics]
---

# LinkedIn post tools

`linksight_posts_list` GETs `posts` and returns the array with `meta.count`. `linksight_posts_upsert` requires `posts`, POSTs `{posts}` to `posts/upsert`, and returns the resulting array with a count. The schema describes URL matching as the backend’s upsert identity.

`linksight_posts_update_category(url,category)` PUTs `{category}` to `posts/${encodeURIComponent(url)}/category`; encoding the URL path segment is a local invariant. All upstream failures become `fail(e.status || 500, e.message)`. The backend owns persistence and metric semantics. Schema requires `posts` and each item `url`, while the handler forwards all supplied item fields without local validation; the backend therefore remains authoritative for shape. Validate arrays, URL encoding, count projection, and an upstream error with MCP or a stub server.

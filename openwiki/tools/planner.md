---
type: tool domain
title: Planner tools
description: Draft, schedule, update, and AI-optimization persistence tools for planner posts.
tags: [tools, planner]
---

# Planner tools

`linksight_planner_list` GETs `planner/posts` and reports a count. Create POSTs only defined `content`, truthy `state`, and truthy `scheduled_datetime`; states are `borrador`, `listo`, and `planificado`. Update requires `id`, PUTs to `planner/posts/{id}`, and accepts `eliminado` in addition to the create states. Optimization requires `id`, `original_content`, and `optimized_content`, then POSTs them to `planner/posts/{id}/optimizations`.

The backend owns state persistence and scheduling rules. Partial payload behavior is intentional: undefined fields are omitted, but create uses truthiness for `state` and `scheduled_datetime` whereas update uses truthiness for `state` and an undefined check for `scheduled_datetime`. The schema permits the same planner states except `eliminado` is update-only; it does not enforce defaults locally. Validate create/update payloads and upstream failures with a stub server; no tests are present.

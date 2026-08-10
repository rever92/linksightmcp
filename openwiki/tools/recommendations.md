---
type: tool domain
title: Recommendation tools
description: Read and persist AI-generated LinkedIn recommendation fields.
tags: [tools, recommendations, ai]
---

# Recommendation tools

`linksight_recommendations_latest` GETs `recommendations/latest`. A falsy response returns `ok(null,{message:'No recommendations yet'})`; otherwise it passes through the data. `linksight_recommendations_save` requires and POSTs `tipos_de_contenido`, `mejores_horarios`, `longitud_optima`, `frecuencia_recomendada`, and `estrategias_de_engagement` to `recommendations`.

The latest schema has no inputs and the save schema requires exactly five named fields; the save handler forwards all five without transformation or local content validation. The backend owns persistence and field semantics. Validate required schema fields and the empty latest response using a stub or MCP test account.

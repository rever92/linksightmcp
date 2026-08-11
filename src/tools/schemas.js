const plannerMetricProperties = {
  impresiones: { type: ['integer', 'null'], minimum: 0, description: 'LinkedIn post impressions' },
  reacciones: { type: ['integer', 'null'], minimum: 0, description: 'LinkedIn post reactions' },
  comentarios: { type: ['integer', 'null'], minimum: 0, description: 'LinkedIn post comments' },
  compartidos: { type: ['integer', 'null'], minimum: 0, description: 'LinkedIn post shares/reposts' },
  guardados: { type: ['integer', 'null'], minimum: 0, description: 'LinkedIn post saves' },
  fecha_medicion: { type: ['string', 'null'], description: 'ISO date/time when the metrics were measured' },
};
const legacyPlannerMetricProperties = {
  views: { type: 'integer', minimum: 0 }, likes: { type: 'integer', minimum: 0 }, comments: { type: 'integer', minimum: 0 }, shares: { type: 'integer', minimum: 0 }, saves: { type: 'integer', minimum: 0 },
};

export const toolSchemas = {
  // ─── Auth ───────────────────────────────────────────────────────────
  linksight_login: {
    description: 'Authenticate with Linksight. Normally auto-handled via env vars, but use this to switch accounts or re-authenticate.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'User email' },
        password: { type: 'string', description: 'User password' },
      },
      required: ['email', 'password'],
    },
  },

  linksight_whoami: {
    description: 'Show current authentication status: email, role, subscription info.',
    inputSchema: { type: 'object', properties: {} },
  },

  linksight_profile: {
    description: 'Get the full user profile: email, role, subscription status/plan/expiry, beta tester status, Stripe customer ID.',
    inputSchema: { type: 'object', properties: {} },
  },

  // ─── LinkedIn Posts (analytics) ─────────────────────────────────────
  linksight_posts_list: {
    description: 'Legacy: list historical imported LinkedIn posts. Do not use this dataset to resolve or update planner metrics; use linksight_planner_find_by_text and planner _id instead.',
    inputSchema: { type: 'object', properties: {} },
  },

  linksight_posts_upsert: {
    description: 'Legacy historical import only. It does not update planner metrics or planner analytics. For screenshot metrics, always find the planner _id and call linksight_planner_update_metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        posts: {
          type: 'array',
          description: 'Array of post objects to upsert',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string', description: 'LinkedIn post URL (unique identifier)' },
              date: { type: 'string', description: 'Post date ISO string' },
              text: { type: 'string', description: 'Post content text' },
              views: { type: 'number', description: 'Number of views' },
              likes: { type: 'number', description: 'Number of likes' },
              comments: { type: 'number', description: 'Number of comments' },
              shares: { type: 'number', description: 'Number of shares' },
              saves: { type: 'number', description: 'Number of saves' },
              post_type: { type: 'string', description: 'Type of post (e.g. article, image, video)' },
              linea_editorial: { type: 'string', description: 'Editorial line; use linksight_taxonomies_list to discover valid values' },
              funcion_editorial: { type: 'string', description: 'Editorial function; use linksight_taxonomies_list to discover valid values' },
              formato: { type: 'string', description: 'Content format; use linksight_taxonomies_list to discover valid values' },
            },
            required: ['url'],
          },
        },
      },
      required: ['posts'],
    },
  },

  linksight_posts_update_category: {
    description: 'Update the category of a specific LinkedIn post.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL-encoded LinkedIn post URL' },
        category: { type: 'string', description: 'New category for the post' },
      },
      required: ['url', 'category'],
    },
  },

  // ─── Planner ────────────────────────────────────────────────────────
  linksight_planner_list: {
    description: 'List planner ideas. Includes idea context and can filter by state or editorial line.',
    inputSchema: { type: 'object', properties: { state: { type: 'string', enum: ['borrador', 'listo', 'planificado', 'publicado'] }, linea_editorial: { type: 'string' } } },
  },

  linksight_planner_find_by_text: {
    description: 'Find planner items whose content starts with or contains text read from a LinkedIn statistics screenshot. Returns ranked matches with planner _id, title, content preview, and state. Use the returned _id for metric writes; never identify metrics by URL.',
    inputSchema: { type: 'object', properties: { text: { type: 'string', minLength: 3, description: 'First words or another exact excerpt from the post' } }, required: ['text'] },
  },

  linksight_planner_create: {
    description: 'Create a new planner post (draft by default).',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Post content text (default: empty)' },
        state: { type: 'string', enum: ['borrador', 'listo', 'planificado', 'publicado'], description: 'Post state (default: borrador)' },
        scheduled_datetime: { type: 'string', description: 'Scheduled/published date-time ISO string (preserved for planificado and publicado states)' },
        titulo: { type: 'string' }, linea_editorial: { type: 'string' }, funcion_editorial: { type: 'string' }, formato: { type: 'string' }, fuente: { type: 'string' }, punto_de_vista: { type: 'string' }, hipotesis: { type: 'string' }, activo_reutilizable: { type: 'string' }, published_post_url: { type: 'string' },
        ...plannerMetricProperties,
        ...legacyPlannerMetricProperties,
      },
    },
  },

  linksight_planner_update: {
    description: 'Update a planner post (content, state, or scheduled datetime).',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Planner post ID' },
        content: { type: 'string', description: 'New content text' },
        state: { type: 'string', enum: ['borrador', 'listo', 'planificado', 'publicado', 'eliminado'], description: 'New state' },
        scheduled_datetime: { type: 'string', description: 'New scheduled date/time ISO string' },
        titulo: { type: 'string' }, linea_editorial: { type: 'string' }, funcion_editorial: { type: 'string' }, formato: { type: 'string' }, fuente: { type: 'string' }, punto_de_vista: { type: 'string' }, hipotesis: { type: 'string' }, activo_reutilizable: { type: 'string' }, published_post_url: { type: 'string' },
        ...plannerMetricProperties,
        ...legacyPlannerMetricProperties,
      },
      required: ['id'],
    },
  },

  linksight_planner_publish: {
    description: 'Mark a planner idea as published while preserving its calendar date. The LinkedIn URL and analytics are optional.',
    inputSchema: { type: 'object', properties: { id: { type: 'string' }, published_post_url: { type: 'string', description: 'Optional informational URL; never used to identify metrics' }, scheduled_datetime: { type: 'string' }, ...plannerMetricProperties, ...legacyPlannerMetricProperties }, required: ['id'] },
  },

  linksight_planner_update_analytics: {
    description: 'Deprecated compatibility alias. Update planner metrics by planner _id; legacy English metric names are mapped to the canonical fields.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Planner post _id' }, ...legacyPlannerMetricProperties },
      required: ['id'],
    },
  },

  linksight_planner_update_metrics: {
    description: 'Store LinkedIn metrics directly on a planner item, identified exclusively by its internal planner _id. URL is never used.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Internal planner item _id' }, ...plannerMetricProperties },
      required: ['id'],
    },
  },

  linksight_planner_analytics: {
    description: 'Get aggregated analytics for published planner posts, optionally filtered by editorial line, editorial function, and format. Averages exclude posts whose metrics are all zero.',
    inputSchema: {
      type: 'object',
      properties: {
        linea_editorial: { type: 'string' },
        funcion_editorial: { type: 'string' },
        formato: { type: 'string' },
      },
    },
  },

  linksight_taxonomies_list: {
    description: 'List content taxonomy values for editorial lines, editorial functions, and formats. States are fixed and are not taxonomies.',
    inputSchema: { type: 'object', properties: { include_inactive: { type: 'boolean', description: 'Include hidden values' } } },
  },

  linksight_taxonomies_create: {
    description: 'Create a content taxonomy value or reactivate a previously hidden value.',
    inputSchema: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['linea_editorial', 'funcion_editorial', 'formato'] },
        value: { type: 'string' },
      },
      required: ['kind', 'value'],
    },
  },

  linksight_taxonomies_update: {
    description: 'Rename, reorder, hide, or restore a taxonomy. Renaming also updates existing content that uses the old value.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Taxonomy ID' },
        value: { type: 'string' },
        active: { type: 'boolean' },
        sort_order: { type: 'number' },
      },
      required: ['id'],
    },
  },

  linksight_taxonomies_delete: {
    description: 'Hide a taxonomy value without altering historical posts. It can be restored with linksight_taxonomies_update.',
    inputSchema: { type: 'object', properties: { id: { type: 'string', description: 'Taxonomy ID' } }, required: ['id'] },
  },

  linksight_planner_save_optimization: {
    description: 'Save an AI optimization result for a planner post. Records the original and optimized content.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Planner post ID' },
        original_content: { type: 'string', description: 'Original post content before optimization' },
        optimized_content: { type: 'string', description: 'AI-optimized post content' },
      },
      required: ['id', 'original_content', 'optimized_content'],
    },
  },

  // ─── Premium ────────────────────────────────────────────────────────
  linksight_premium_limits: {
    description: 'Get the premium usage limits for the current user role (profile analysis, post optimization, batch analysis).',
    inputSchema: { type: 'object', properties: {} },
  },

  linksight_premium_usage: {
    description: 'Get current month premium feature usage counts by action type.',
    inputSchema: { type: 'object', properties: {} },
  },

  linksight_premium_cycle_usage: {
    description: 'Get premium feature usage for the current billing cycle (uses subscription start date if available).',
    inputSchema: { type: 'object', properties: {} },
  },

  linksight_premium_record_action: {
    description: 'Record a premium action (track usage of a premium feature).',
    inputSchema: {
      type: 'object',
      properties: {
        action_type: {
          type: 'string',
          enum: ['profile_analysis', 'post_optimization', 'batch_analysis'],
          description: 'Type of premium action performed',
        },
        metadata: { type: 'object', description: 'Optional metadata about the action' },
      },
      required: ['action_type'],
    },
  },

  // ─── Products ───────────────────────────────────────────────────────
  linksight_products_list: {
    description: 'List all available subscription products with their prices (Stripe-synced).',
    inputSchema: { type: 'object', properties: {} },
  },

  // ─── Stripe ─────────────────────────────────────────────────────────
  linksight_stripe_checkout: {
    description: 'Create a Stripe checkout session for subscription purchase. Returns the checkout URL.',
    inputSchema: {
      type: 'object',
      properties: {
        price_id: { type: 'string', description: 'Stripe price ID to subscribe to' },
      },
      required: ['price_id'],
    },
  },

  linksight_stripe_portal: {
    description: 'Create a Stripe billing portal session for managing the subscription. Returns the portal URL.',
    inputSchema: { type: 'object', properties: {} },
  },

  // ─── Recommendations ───────────────────────────────────────────────
  linksight_recommendations_latest: {
    description: 'Get the latest AI-generated LinkedIn recommendations for the user (content types, best posting times, optimal length, frequency, engagement strategies).',
    inputSchema: { type: 'object', properties: {} },
  },

  linksight_recommendations_save: {
    description: 'Save new AI-generated LinkedIn recommendations.',
    inputSchema: {
      type: 'object',
      properties: {
        tipos_de_contenido: { type: 'string', description: 'Recommended content types analysis' },
        mejores_horarios: { type: 'string', description: 'Best posting times analysis' },
        longitud_optima: { type: 'string', description: 'Optimal post length analysis' },
        frecuencia_recomendada: { type: 'string', description: 'Recommended posting frequency' },
        estrategias_de_engagement: { type: 'string', description: 'Engagement strategies analysis' },
      },
      required: [
        'tipos_de_contenido',
        'mejores_horarios',
        'longitud_optima',
        'frecuencia_recomendada',
        'estrategias_de_engagement',
      ],
    },
  },

  // ─── Analytics (compound tools) ────────────────────────────────────
  linksight_analytics_summary: {
    description: 'Get totals, averages, and editorial breakdowns calculated exclusively from published planner items and their planner metrics. Posts with no recorded metrics are excluded from averages.',
    inputSchema: { type: 'object', properties: {} },
  },
};

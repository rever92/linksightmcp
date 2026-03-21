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
    description: 'List all tracked LinkedIn posts with their metrics (views, likes, comments, shares) and metadata (category, post_type). Sorted by date descending.',
    inputSchema: { type: 'object', properties: {} },
  },

  linksight_posts_upsert: {
    description: 'Bulk upsert LinkedIn posts. Posts are matched by URL — existing posts are updated, new ones are created. Returns all user posts after upsert.',
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
              post_type: { type: 'string', description: 'Type of post (e.g. article, image, video)' },
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
    description: 'List all planner posts (drafts, ready, scheduled). Excludes deleted posts. Sorted by creation date.',
    inputSchema: { type: 'object', properties: {} },
  },

  linksight_planner_create: {
    description: 'Create a new planner post (draft by default).',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Post content text (default: empty)' },
        state: { type: 'string', enum: ['borrador', 'listo', 'planificado'], description: 'Post state (default: borrador)' },
        scheduled_datetime: { type: 'string', description: 'Scheduled date/time ISO string (optional, for planificado state)' },
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
        state: { type: 'string', enum: ['borrador', 'listo', 'planificado', 'eliminado'], description: 'New state' },
        scheduled_datetime: { type: 'string', description: 'New scheduled date/time ISO string' },
      },
      required: ['id'],
    },
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
    description: 'Get a computed analytics summary of LinkedIn post performance. Calculates totals, averages, best/worst posts, category breakdown, and trends. Useful for quick performance overviews without having to process raw post data.',
    inputSchema: { type: 'object', properties: {} },
  },
};

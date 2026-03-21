import { createClient } from '../api-client.js';
import { setTokens, getTokens, clearTokens } from '../auth.js';
import { resolveBaseUrl } from '../config.js';

function ok(data, meta) {
  return { content: [{ type: 'text', text: JSON.stringify({ success: true, data, meta }, null, 2) }] };
}

function fail(code, message, hint) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ success: false, error: { code, message, ...(hint ? { hint } : {}) } }, null, 2) }],
    isError: true,
  };
}

export const toolHandlers = {
  // ─── Auth ───────────────────────────────────────────────────────────
  async linksight_login({ email, password }) {
    try {
      const baseUrl = resolveBaseUrl();
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return fail(res.status, err.error || 'Login failed');
      }
      const data = await res.json();
      setTokens(data);
      return ok({ email: data.user.email, role: data.user.role, subscription_status: data.user.subscription_status });
    } catch (e) {
      return fail(500, e.message);
    }
  },

  async linksight_whoami() {
    const { user } = getTokens();
    if (!user) {
      // Try fetching from API
      try {
        const data = await createClient().get('auth/me');
        setTokens({ user: data.user });
        return ok(data.user);
      } catch (e) {
        return fail(401, 'Not authenticated', 'Use linksight_login or configure LINKSIGHT_EMAIL/LINKSIGHT_PASSWORD env vars');
      }
    }
    return ok(user);
  },

  async linksight_profile() {
    try {
      const data = await createClient().get('user/profile');
      return ok(data);
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  // ─── LinkedIn Posts ─────────────────────────────────────────────────
  async linksight_posts_list() {
    try {
      const data = await createClient().get('posts');
      return ok(data, { count: data.length });
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_posts_upsert({ posts }) {
    try {
      const data = await createClient().post('posts/upsert', { posts });
      return ok(data, { count: data.length });
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_posts_update_category({ url, category }) {
    try {
      const data = await createClient().put(`posts/${encodeURIComponent(url)}/category`, { category });
      return ok(data);
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  // ─── Planner ────────────────────────────────────────────────────────
  async linksight_planner_list() {
    try {
      const data = await createClient().get('planner/posts');
      return ok(data, { count: data.length });
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_planner_create({ content, state, scheduled_datetime }) {
    try {
      const body = {};
      if (content !== undefined) body.content = content;
      if (state) body.state = state;
      if (scheduled_datetime) body.scheduled_datetime = scheduled_datetime;
      const data = await createClient().post('planner/posts', body);
      return ok(data);
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_planner_update({ id, content, state, scheduled_datetime }) {
    try {
      const body = {};
      if (content !== undefined) body.content = content;
      if (state) body.state = state;
      if (scheduled_datetime !== undefined) body.scheduled_datetime = scheduled_datetime;
      const data = await createClient().put(`planner/posts/${id}`, body);
      return ok(data);
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_planner_save_optimization({ id, original_content, optimized_content }) {
    try {
      const data = await createClient().post(`planner/posts/${id}/optimizations`, {
        original_content,
        optimized_content,
      });
      return ok(data);
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  // ─── Premium ────────────────────────────────────────────────────────
  async linksight_premium_limits() {
    try {
      return ok(await createClient().get('premium/limits'));
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_premium_usage() {
    try {
      return ok(await createClient().get('premium/usage'));
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_premium_cycle_usage() {
    try {
      return ok(await createClient().get('premium/cycle-usage'));
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_premium_record_action({ action_type, metadata }) {
    try {
      const body = { action_type };
      if (metadata) body.metadata = metadata;
      return ok(await createClient().post('premium/actions', body));
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  // ─── Products ───────────────────────────────────────────────────────
  async linksight_products_list() {
    try {
      const data = await createClient().get('products');
      return ok(data, { count: data.length });
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  // ─── Stripe ─────────────────────────────────────────────────────────
  async linksight_stripe_checkout({ price_id }) {
    try {
      const data = await createClient().post('stripe/checkout', { price_id });
      return ok({ url: data.session.url, session_id: data.session.id });
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_stripe_portal() {
    try {
      const data = await createClient().post('stripe/portal');
      return ok({ url: data.url });
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  // ─── Recommendations ───────────────────────────────────────────────
  async linksight_recommendations_latest() {
    try {
      const data = await createClient().get('recommendations/latest');
      if (!data) return ok(null, { message: 'No recommendations yet' });
      return ok(data);
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_recommendations_save({ tipos_de_contenido, mejores_horarios, longitud_optima, frecuencia_recomendada, estrategias_de_engagement }) {
    try {
      const data = await createClient().post('recommendations', {
        tipos_de_contenido,
        mejores_horarios,
        longitud_optima,
        frecuencia_recomendada,
        estrategias_de_engagement,
      });
      return ok(data);
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  // ─── Analytics (compound) ──────────────────────────────────────────
  async linksight_analytics_summary() {
    try {
      const posts = await createClient().get('posts');

      if (!posts || posts.length === 0) {
        return ok({ message: 'No posts found' }, { count: 0 });
      }

      const total = {
        posts: posts.length,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      };

      const byCategory = {};
      let bestPost = null;
      let worstPost = null;

      for (const p of posts) {
        total.views += p.views || 0;
        total.likes += p.likes || 0;
        total.comments += p.comments || 0;
        total.shares += p.shares || 0;

        const cat = p.category || 'Sin categoría';
        if (!byCategory[cat]) {
          byCategory[cat] = { posts: 0, views: 0, likes: 0, comments: 0, shares: 0 };
        }
        byCategory[cat].posts++;
        byCategory[cat].views += p.views || 0;
        byCategory[cat].likes += p.likes || 0;
        byCategory[cat].comments += p.comments || 0;
        byCategory[cat].shares += p.shares || 0;

        const engagement = (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
        if (!bestPost || engagement > bestPost.engagement) {
          bestPost = { url: p.url, text: (p.text || '').substring(0, 100), engagement, views: p.views, date: p.date };
        }
        if (!worstPost || engagement < worstPost.engagement) {
          worstPost = { url: p.url, text: (p.text || '').substring(0, 100), engagement, views: p.views, date: p.date };
        }
      }

      const avg = {
        views: Math.round(total.views / total.posts),
        likes: Math.round((total.likes / total.posts) * 10) / 10,
        comments: Math.round((total.comments / total.posts) * 10) / 10,
        shares: Math.round((total.shares / total.posts) * 10) / 10,
        engagement_rate: total.views > 0
          ? Math.round(((total.likes + total.comments + total.shares) / total.views) * 10000) / 100
          : 0,
      };

      // Category averages
      for (const cat of Object.keys(byCategory)) {
        const c = byCategory[cat];
        c.avg_views = Math.round(c.views / c.posts);
        c.avg_engagement = Math.round(((c.likes + c.comments + c.shares) / c.posts) * 10) / 10;
      }

      // Monthly trend (last 6 months)
      const now = new Date();
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthPosts = posts.filter(p => {
          const pd = new Date(p.date);
          return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth();
        });
        monthlyTrend.push({
          month: monthKey,
          posts: monthPosts.length,
          views: monthPosts.reduce((s, p) => s + (p.views || 0), 0),
          engagement: monthPosts.reduce((s, p) => s + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0),
        });
      }

      return ok({
        total,
        averages: avg,
        best_post: bestPost,
        worst_post: worstPost,
        by_category: byCategory,
        monthly_trend: monthlyTrend,
      });
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },
};

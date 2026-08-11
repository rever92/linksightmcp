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
  async linksight_planner_list({ state, linea_editorial } = {}) {
    try {
      const data = await createClient().get('planner/posts', { query: { state, linea_editorial } });
      return ok(data, { count: data.length });
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_planner_find_by_text({ text }) {
    try {
      const data = await createClient().get('planner/posts/find-by-text', { query: { text } });
      return ok(data, { count: data.length });
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_planner_create(args) {
    try {
      const body = Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined));
      const data = await createClient().post('planner/posts', body);
      return ok(data);
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_planner_update({ id, ...args }) {
    try {
      const body = Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined));
      const data = await createClient().put(`planner/posts/${id}`, body);
      return ok(data);
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_planner_publish({ id, ...args }) {
    try {
      const body = Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined));
      return ok(await createClient().post(`planner/posts/${id}/publish`, body));
    }
    catch (e) { return fail(e.status || 500, e.message); }
  },

  async linksight_planner_update_analytics({ id, ...metrics }) {
    try {
      const aliases = { views: 'impresiones', likes: 'reacciones', comments: 'comentarios', shares: 'compartidos', saves: 'guardados' };
      const body = Object.fromEntries(Object.entries(metrics).filter(([, value]) => value !== undefined).map(([field, value]) => [aliases[field] || field, value]));
      return ok(await createClient().put(`planner/posts/${id}/metrics`, body));
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_planner_update_metrics({ id, ...metrics }) {
    try {
      const body = Object.fromEntries(Object.entries(metrics).filter(([, value]) => value !== undefined));
      return ok(await createClient().put(`planner/posts/${id}/metrics`, body));
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_planner_analytics(args = {}) {
    try {
      return ok(await createClient().get('planner/analytics', { query: args }));
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_taxonomies_list({ include_inactive } = {}) {
    try {
      const data = await createClient().get('planner/taxonomies', { query: { include_inactive } });
      return ok(data, { count: data.length });
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_taxonomies_create({ kind, value }) {
    try {
      return ok(await createClient().post('planner/taxonomies', { kind, value }));
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_taxonomies_update({ id, ...changes }) {
    try {
      const body = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
      return ok(await createClient().put(`planner/taxonomies/${id}`, body));
    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },

  async linksight_taxonomies_delete({ id }) {
    try {
      return ok(await createClient().delete(`planner/taxonomies/${id}`));
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
      const analytics = await createClient().get('planner/analytics');
      const withMetrics = (rows) => rows.filter((row) => row.posts_with_metrics > 0);
      return ok({
        total: { ...analytics.summary, posts: analytics.summary.posts_with_metrics },
        published_posts: analytics.summary.posts,
        by_linea_editorial: withMetrics(analytics.breakdowns.linea_editorial),
        by_funcion_editorial: withMetrics(analytics.breakdowns.funcion_editorial),
        by_formato: withMetrics(analytics.breakdowns.formato),
      }, { source: 'planner', posts_with_metrics: analytics.summary.posts_with_metrics });

    } catch (e) {
      return fail(e.status || 500, e.message);
    }
  },
};

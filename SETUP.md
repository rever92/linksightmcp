# Linksight MCP — Setup para agentes

Servidor MCP remoto que expone 20 herramientas para interactuar con la API de Linksight.

**Endpoint**: `https://mcp.linksight.es/mcp`
**Health check**: `https://mcp.linksight.es/health`

---

## Claude Code (PC)

Añade al fichero `~/.mcp.json` (global) o `<proyecto>/.mcp.json` (por proyecto):

```json
{
  "mcpServers": {
    "linksight": {
      "type": "url",
      "url": "https://mcp.linksight.es/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_AUTH_TOKEN>"
      }
    }
  }
}
```

Reinicia Claude Code para que cargue el MCP.

---

## Claude.ai (web)

1. Ve a Settings > MCP Servers > Add
2. URL: `https://mcp.linksight.es/mcp`
3. Header: `Authorization: Bearer <MCP_AUTH_TOKEN>`

---

## Bot Telegram / Agentes remotos

Cualquier cliente MCP compatible con StreamableHTTP puede conectarse:

- **URL**: `https://mcp.linksight.es/mcp`
- **Method**: POST (initialize, tool calls) / GET (SSE) / DELETE (cleanup)
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json, text/event-stream`
  - `Authorization: Bearer <MCP_AUTH_TOKEN>`

### Ejemplo: Initialize

```bash
curl -X POST https://mcp.linksight.es/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer <MCP_AUTH_TOKEN>" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": {"name": "my-agent", "version": "1.0.0"}
    },
    "id": 1
  }'
```

### Ejemplo: Listar tools

```bash
curl -X POST https://mcp.linksight.es/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer <MCP_AUTH_TOKEN>" \
  -H "Mcp-Session-Id: <session-id-del-initialize>" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
  }'
```

### Ejemplo: Llamar a un tool

```bash
curl -X POST https://mcp.linksight.es/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer <MCP_AUTH_TOKEN>" \
  -H "Mcp-Session-Id: <session-id>" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "linksight_posts_list",
      "arguments": {}
    },
    "id": 3
  }'
```

---

## Tools disponibles (20)

| Tool | Descripcion |
|---|---|
| `linksight_login` | Auth manual (normalmente auto via env vars) |
| `linksight_whoami` | Estado de autenticacion actual |
| `linksight_profile` | Perfil completo del usuario |
| `linksight_posts_list` | Listar posts de LinkedIn con metricas |
| `linksight_posts_upsert` | Bulk upsert de posts por URL |
| `linksight_posts_update_category` | Actualizar categoria de un post |
| `linksight_planner_list` | Listar posts del planificador |
| `linksight_planner_create` | Crear borrador en el planificador |
| `linksight_planner_update` | Actualizar post del planificador |
| `linksight_planner_save_optimization` | Guardar optimizacion AI de un post |
| `linksight_premium_limits` | Limites premium del rol actual |
| `linksight_premium_usage` | Uso mensual de features premium |
| `linksight_premium_cycle_usage` | Uso del ciclo de facturacion actual |
| `linksight_premium_record_action` | Registrar accion premium |
| `linksight_products_list` | Listar productos/precios disponibles |
| `linksight_stripe_checkout` | Crear sesion de checkout Stripe |
| `linksight_stripe_portal` | Crear sesion del portal de facturacion |
| `linksight_recommendations_latest` | Ultima recomendacion AI generada |
| `linksight_recommendations_save` | Guardar nueva recomendacion AI |
| `linksight_analytics_summary` | Resumen analitico calculado (totales, medias, tendencias) |

---

## Despliegue en VPS (Plesk + Passenger)

1. Clonar repo en el subdominio: `git clone https://github.com/rever92/linksightmcp.git httpdocs`
2. `cd httpdocs && npm install --production`
3. En Plesk > Node.js:
   - Startup file: `app.cjs`
   - Application root: `/httpdocs`
4. Configurar env vars en Plesk:
   - `MCP_AUTH_TOKEN` — token para proteger el endpoint MCP
   - `LINKSIGHT_API_URL` — URL de la API (ej: `https://linksight.es/api`)
   - `LINKSIGHT_EMAIL` — email de usuario Linksight
   - `LINKSIGHT_PASSWORD` — password de usuario Linksight
5. Restart App
6. Verificar: `curl https://mcp.linksight.es/health`

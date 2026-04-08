# Linksight MCP - Setup para agentes

Servidor MCP remoto que expone 20 herramientas para interactuar con la API de Linksight.

**Endpoint**: `https://mcp.linksight.es/mcp`  
**Health check**: `https://mcp.linksight.es/health`

---

## Datos que necesita cualquier cliente MCP

- **Transporte**: HTTP
- **URL**: `https://mcp.linksight.es/mcp`
- **Header de autenticacion**: `Authorization: Bearer <MCP_AUTH_TOKEN>`

---

## Claude Code

Claude Code soporta MCP remoto por HTTP. A dia de hoy, lo mas comodo es usar el CLI `claude mcp ...`.

### Opcion 1: configurarlo solo para ti en este proyecto

Esto no modifica el repo. Claude Code lo guarda en tu configuracion local.

```bash
claude mcp add --scope local --transport http linksight https://mcp.linksight.es/mcp --header "Authorization: Bearer <MCP_AUTH_TOKEN>"
```

### Opcion 2: compartir la config en el repo

Esto crea o actualiza `.mcp.json` en la raiz del proyecto.

```bash
claude mcp add --scope project --transport http linksight https://mcp.linksight.es/mcp --header "Authorization: Bearer <MCP_AUTH_TOKEN>"
```

Tambien puedes dejarlo manualmente en `.mcp.json`:

```json
{
  "mcpServers": {
    "linksight": {
      "type": "http",
      "url": "https://mcp.linksight.es/mcp",
      "headers": {
        "Authorization": "Bearer ${MCP_AUTH_TOKEN}"
      }
    }
  }
}
```

Notas:

- `local` es el scope por defecto y queda solo para tu usuario en este proyecto.
- `project` deja la configuracion compartida en `.mcp.json`.
- Claude Code expande `${MCP_AUTH_TOKEN}` dentro de `.mcp.json`.
- Si usas `.mcp.json`, asegurate de tener `MCP_AUTH_TOKEN` definido antes de abrir Claude Code.

Verificacion rapida:

```bash
claude mcp get linksight
claude mcp list
```

Tambien puedes abrir Claude Code y ejecutar `/mcp`.

### Variables de entorno utiles

PowerShell:

```powershell
$env:MCP_AUTH_TOKEN="tu-token"
```

macOS / Linux:

```bash
export MCP_AUTH_TOKEN="tu-token"
```

---

## Instrucciones para darle a otro agente

Si quieres pegarle a otro agente un bloque de instrucciones para que se configure el acceso por si mismo, puedes usar esto tal cual:

```text
Configura en Claude Code el MCP remoto de Linksight para este proyecto.

Datos del servidor:
- Nombre: linksight
- Transporte: http
- URL: https://mcp.linksight.es/mcp
- Header: Authorization: Bearer <MCP_AUTH_TOKEN>

Haz lo siguiente:
1. Si solo necesitas acceso para tu sesion/localmente en este proyecto, ejecuta:
   claude mcp add --scope local --transport http linksight https://mcp.linksight.es/mcp --header "Authorization: Bearer <MCP_AUTH_TOKEN>"
2. Si quieres dejar la configuracion compartida en el repo, crea o actualiza .mcp.json con este contenido:
   {
     "mcpServers": {
       "linksight": {
         "type": "http",
         "url": "https://mcp.linksight.es/mcp",
         "headers": {
           "Authorization": "Bearer ${MCP_AUTH_TOKEN}"
         }
       }
     }
   }
3. Verifica que el servidor ha quedado registrado con:
   claude mcp get linksight
4. Si usas la variante con .mcp.json, confirma que la variable de entorno MCP_AUTH_TOKEN existe antes de abrir Claude Code.
```

Sugerencia: para no pasar el token en claro dentro del prompt, es mejor que el agente use la variante de `.mcp.json` con `${MCP_AUTH_TOKEN}` o que lea el token desde una variable de entorno ya definida.

---

## Claude.ai (web)

1. Ve a `Settings > MCP Servers > Add`
2. URL: `https://mcp.linksight.es/mcp`
3. Header: `Authorization: Bearer <MCP_AUTH_TOKEN>`

---

## Bot Telegram / Agentes remotos

Cualquier cliente MCP compatible con StreamableHTTP puede conectarse:

- **URL**: `https://mcp.linksight.es/mcp`
- **Method**: `POST` (initialize, tool calls) / `GET` (SSE) / `DELETE` (cleanup)
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
   - `MCP_AUTH_TOKEN` - token para proteger el endpoint MCP
   - `LINKSIGHT_API_URL` - URL de la API (ej: `https://linksight.es/api`)
   - `LINKSIGHT_EMAIL` - email de usuario Linksight
   - `LINKSIGHT_PASSWORD` - password de usuario Linksight
5. Restart App
6. Verificar: `curl https://mcp.linksight.es/health`

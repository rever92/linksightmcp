<!-- OPENWIKI:START -->

## OpenWiki

This repository has a generated `openwiki/` evidence index. It is optional just-in-time context, not required startup reading.

- Treat source code and tests as authoritative. A brief's unknowns and review items are verification gaps, not automatic requirements.
- Prefer the narrowest quiet validation that proves the changed behavior. Preserve complete failure output.

The scheduled OpenWiki GitHub Actions workflow refreshes the repository wiki. Do not hand-edit generated OpenWiki pages unless explicitly asked; prefer updating source code/docs and letting OpenWiki regenerate.

<!-- OPENWIKI:END -->

## Despliegue

Se despliega con la skill global `/desplegar`. Esta sección es la ficha del proyecto: lo que
la skill no puede saber por sí misma. Si el VPS dice otra cosa, manda el VPS y se corrige
aquí.

| Qué | Valor |
|---|---|
| Patrón | B Passenger |
| Dominio | `mcp.linksight.es` (subdominio de la suscripción `linksight.es`) |
| Repositorio y rama | `rever92/linksightmcp` · `master` |
| Ruta en el VPS | `/var/www/vhosts/linksight.es/mcp.linksight.es` (Application Root = Document Root, startup `app.cjs`, Node 21) |
| Usuario de sistema | `linksight.es_4hzliqmvz2k` (comprobado con `stat -c '%U:%G'`) |
| Repo Plesk Git | `linksightmcp.git` · modo `auto`, pero **sin webhook en GitHub** y sin acciones post-deploy |
| Puerto local | Lo asigna Passenger |
| Servicios que deben estar arriba | App Passenger y la API `https://linksight.es/api` |
| Ruta de salud | `https://mcp.linksight.es/health` → `{"status":"ok","server":"linksight-mcp"}` |
| Señal de versión | `plesk ext git --get-last-commit -domain mcp.linksight.es -name linksightmcp.git` y `tools/list` del MCP con el cambio publicado |
| Operación real de validación | Sesión MCP real (`initialize` → `tools/list` → `tools/call`) con el `MCP_AUTH_TOKEN` leído del `httpd.conf` en el VPS, sin sacarlo |
| Datos y backup | Sin datos propios: proxy de la API de LinkSight |
| Disparo | Manual por SSH: `plesk ext git --fetch` + `--deploy`, después `touch tmp/restart.txt` como el usuario de la suscripción |
| Verificación previa | No hay tests: probar el handler en local con `fetch` simulado |

### Particularidades

- Plesk no reinicia la app: sin `touch tmp/restart.txt`, Passenger sigue sirviendo el código viejo que tiene en memoria.
- Las variables (`LINKSIGHT_*`, `MCP_AUTH_TOKEN`) están en el panel Node.js y aparecen en claro en `httpd.conf`. Ninguna consulta debe imprimir los valores de `SetEnv`.
- Las sesiones MCP viven en memoria: cada reinicio obliga a los clientes a hacer `initialize` otra vez.

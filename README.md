# 🚀 Google Antigravity & Apps Script / AppSheet Workflow

Este proyecto es un entorno de desarrollo centrado en agentes (**Agent-First**) para automatizar procesos en el ecosistema de Google Workspace.

## 🛠️ Stack Tecnológico

- **IDE:** Google Antigravity
- **Lenguaje:** JavaScript (ES6+) / TypeScript
- **Sincronización:** [clasp](https://github.com/google/clasp) (Command Line Apps Script Projects)
- **Plataformas:** Google Sheets & Google AppSheet & Google Gmail & Google Appscript & Google Workspace & Google Cloud & Google Drive

## 📂 Estructura del Proyecto

- `src/`: Contiene el código fuente (`.js` o `.gs`) que se sincroniza con Google Apps Script.
- `.agent/`: Reglas y directrices específicas para que los agentes de Antigravity operen de forma segura.
- `appsscript.json`: Manifiesto de configuración de permisos y servicios de Google.
- `.clasp.json`: Configuración de vinculación con el ID del script remoto.

## 🤖 Instrucciones para el Agente

Al trabajar en este proyecto, el agente debe seguir estas prioridades:

1. **Sincronización:** Después de cualquier cambio en `src/`, ejecutar `npx clasp push` para desplegar el código a la nube.
2. **Seguridad:** Nunca exponer credenciales en el código. Usar variables de entorno si es necesario.
3. **Calidad:** Todo script debe incluir manejo de errores (`try/catch`) y ser optimizado para no exceder las cuotas de ejecución de Google.
4. **AppSheet:** Si se crean tablas en Sheets, asegurar que la columna A sea siempre un `ID` único para evitar conflictos de sincronización.

## 🚀 Comandos Rápidos

- `npx clasp login`: Re-autenticar la cuenta de Google.
- `npx clasp pull`: Traer cambios realizados desde el editor web de Google.
- `npx clasp push`: Subir cambios locales a Google Apps Script.
- `npx clasp open`: Abrir el proyecto actual en el navegador.

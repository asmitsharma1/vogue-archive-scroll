import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import express from "express";

// Hostinger's Node.js hosting expects an Express entry file listening on
// process.env.PORT. This project still builds with TanStack Start/Nitro, but
// the Hostinger build uses Nitro's node-middleware preset so Express can mount
// the generated app directly from .output/server/index.mjs.
//
// server.js is the deployment entry and imports this file. Keep TanStack Start's
// internal SSR entry pinned to src/server.ts in vite.config.ts so the root
// server.js is only used by Hostinger/Node.

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
const nitroEntry = path.join(__dirname, ".output/server/index.mjs");

async function loadNitroEntry() {
  return import(pathToFileURL(nitroEntry).href);
}

// Keep runtime startup cheap. Hostinger shared hosting has strict process
// limits, so builds and installs must happen in the deploy/build step only.
if (!existsSync(nitroEntry)) {
  console.error(
    `❌ Build output missing at ${nitroEntry}. Run "npm run build" during deploy before starting server.js.`,
  );
  console.error(`Current directory: ${__dirname}`);
  console.error(`Looking for: ${nitroEntry}`);
  process.exit(1);
}

console.log(`✓ Found Nitro build at ${nitroEntry}`);
console.log(`✓ Starting server on port ${PORT}`);
console.log(`✓ Node version: ${process.version}`);

const nitro = await loadNitroEntry();
const nitroMiddleware = nitro.middleware;

if (typeof nitroMiddleware !== "function") {
  console.error(
    `❌ Nitro middleware was not exported from ${nitroEntry}. Rebuild with "npm run build" so Nitro uses the node-middleware preset.`,
  );
  process.exit(1);
}

console.log(`✓ Nitro middleware loaded successfully`);

const app = express();

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.get("/healthz", (_req, res) => {
  res.status(200).type("text/plain").send("ok");
});

app.use(nitroMiddleware);

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Express entry listening on :${PORT}, serving TanStack Start via Nitro middleware`);
  console.log(`📍 Health check available at: http://localhost:${PORT}/healthz`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on("error", (error) => {
  console.error("❌ Express server failed to start:", error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
  }
  process.exit(1);
});

if (typeof nitro.handleUpgrade === "function") {
  server.on("upgrade", nitro.handleUpgrade);
}

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

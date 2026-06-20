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

if (!existsSync(nitroEntry)) {
  console.error(
    `Build output not found at ${nitroEntry}.\n` +
      'Run "npm run build:hostinger" before starting (the "start" script does this automatically — ' +
      "if you're invoking this file directly, build first).",
  );
  process.exit(1);
}

const nitro = await import(pathToFileURL(nitroEntry).href);
const nitroMiddleware = nitro.middleware;

if (typeof nitroMiddleware !== "function") {
  console.error(
    `Nitro middleware was not exported from ${nitroEntry}.\n` +
      'Build with "npm run build:hostinger" so Nitro uses the node-middleware preset.',
  );
  process.exit(1);
}

const app = express();

app.use(nitroMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Express entry listening on :${PORT}, serving TanStack Start via Nitro middleware`);
});

if (typeof nitro.handleUpgrade === "function") {
  server.on("upgrade", nitro.handleUpgrade);
}

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

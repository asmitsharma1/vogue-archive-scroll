import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

// Hostinger's Node.js hosting expects an Express entry file listening on
// process.env.PORT. NOTE: this can't be named "server.js" at the project
// root — this TanStack Start project already reserves that exact name for
// its own SSR entry (see vite.config.ts tanstackStart.server.entry, which
// resolves to src/server.ts); a root server.js gets auto-detected instead
// and silently breaks the real build. The actual app is built by Nitro
// (NITRO_PRESET=node-server, see package.json "build:hostinger") into
// .output/server/index.mjs as its own Web-Fetch-based server — Nitro
// doesn't export a reusable request handler we can mount directly in
// Express, so we run it as an internal child process and proxy to it.

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
const INTERNAL_PORT = process.env.INTERNAL_PORT || 3001;
const nitroEntry = path.join(__dirname, ".output/server/index.mjs");

if (!existsSync(nitroEntry)) {
  console.error(
    `Build output not found at ${nitroEntry}.\n` +
      'Run "npm run build:hostinger" before starting (the "start" script does this automatically — ' +
      "if you're invoking this file directly, build first).",
  );
  process.exit(1);
}

const nitro = spawn(process.execPath, [nitroEntry], {
  env: { ...process.env, PORT: String(INTERNAL_PORT) },
  stdio: "inherit",
});

nitro.on("exit", (code) => {
  console.error(`Nitro server exited with code ${code}`);
  process.exit(code ?? 1);
});

const shutdown = () => {
  nitro.kill();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

const app = express();

app.use(
  createProxyMiddleware({
    target: `http://127.0.0.1:${INTERNAL_PORT}`,
    changeOrigin: true,
    ws: true,
    logger: console,
  }),
);

app.listen(PORT, () => {
  console.log(`Express entry listening on :${PORT}, proxying to Nitro on :${INTERNAL_PORT}`);
});

// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Vercel always sets VERCEL=1 in its build containers — use that to pick
// the right Nitro preset automatically, since Hostinger's pipeline just
// runs the plain "npm run build" script with no way to pass NITRO_PRESET.
// NITRO_PRESET still wins if set explicitly (e.g. local `build:hostinger`).
const defaultPreset = process.env.VERCEL ? "vercel" : "node-server";

export default defineConfig({
  nitro: {
    preset: process.env.NITRO_PRESET || defaultPreset,
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});

import path from "node:path";
import { fileURLToPath } from "node:url";

const isDirectEntry =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectEntry) {
  await import("./hostinger-server.js");
}

const ssrEntry = isDirectEntry ? undefined : await import("./src/server.ts").then((m) => m.default);

export default ssrEntry;

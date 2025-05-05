const esbuild = require("esbuild");
const path = require("path");

esbuild
  .build({
    entryPoints: [path.resolve(__dirname, "src/index.js")],
    bundle: true,
    platform: "node",
    target: "node22",
    outfile: path.resolve(__dirname, "dist/index.js"),
    sourcemap: true,
    external: ["@google-cloud/functions-framework"],
  })
  .catch(() => process.exit(1));

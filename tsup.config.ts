import { readFile, writeFile } from "node:fs/promises";
import { defineConfig } from "tsup";

const CLIENT_DIRECTIVE = '"use client";\n';
const OUTPUT_FILES = ["dist/index.js", "dist/index.cjs"];

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  splitting: false,
  // React is a peer dependency and must never be bundled.
  external: ["react", "react-dom", "react/jsx-runtime"],
  // esbuild strips module-level "use client" directives while bundling, so the
  // public entry (which re-exports a client component) is marked afterwards.
  async onSuccess() {
    await Promise.all(
      OUTPUT_FILES.map(async (file) => {
        const contents = await readFile(file, "utf8");
        if (!contents.startsWith('"use client"')) {
          await writeFile(file, CLIENT_DIRECTIVE + contents);
        }
      })
    );
  },
});

import { resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background/main.ts"),
        content: resolve(__dirname, "src/content/main.tsx"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
    outDir: "dist",
    minify: false,
    sourcemap: true,
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || mode),
  },
}));

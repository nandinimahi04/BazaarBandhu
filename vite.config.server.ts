import { defineConfig } from "vite";
import path from "path";

// Server build configuration
export default defineConfig({
  ssr: {
    noExternal: [],
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/node-build.ts"),
      name: "server",
      fileName: "production",
      formats: ["es"],
    },
    outDir: "dist/server",
    target: "node22",
    rollupOptions: {
      external: (id) => {
        // Externalize all modules that are not relative or absolute internal paths
        return !id.startsWith('.') && !id.startsWith('/') && !path.isAbsolute(id);
      },
      output: {
        format: "es",
        entryFileNames: "[name].mjs",
      },
    },
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

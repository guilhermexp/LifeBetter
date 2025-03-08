import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import { splitVendorChunkPlugin } from "vite";
import { compression } from "vite-plugin-compression2";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Enable SWC optimizations
      swcOptions: {
        jsc: {
          transform: {
            react: {
              // Enable runtime optimizations
              runtime: "automatic",
              // Enable development optimizations
              development: mode === "development",
              // Enable refresh
              refresh: mode === "development",
            },
          },
        },
      },
    }),
    // Split vendor chunks for better caching
    splitVendorChunkPlugin(),
    // Compress assets
    compression({
      algorithm: "gzip",
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Visualize bundle size in stats.html
    mode === "production" && visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Component tagger for development
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Generate source maps for production
    sourcemap: mode !== "production",
    // Minify output
    minify: "terser",
    // Terser options
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: mode === "production",
        // Remove debugger statements in production
        drop_debugger: mode === "production",
      },
    },
    // Rollup options
    rollupOptions: {
      output: {
        // Chunk files by type
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react")) {
              return "vendor-react";
            }
            if (id.includes("date-fns")) {
              return "vendor-date-fns";
            }
            if (id.includes("lucide")) {
              return "vendor-lucide";
            }
            return "vendor";
          }
        },
      },
    },
    // Optimize dependencies
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  // Optimize deps
  optimizeDeps: {
    // Include dependencies that should be pre-bundled
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "date-fns",
      "lucide-react",
    ],
    // Force optimization of dependencies
    force: true,
  },
}));

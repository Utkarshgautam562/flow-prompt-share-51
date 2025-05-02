
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add build optimization
  build: {
    target: 'es2015',
    minify: 'terser',
    cssMinify: true,
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Only drop console in production
        drop_debugger: mode === 'production', // Only drop debugger in production
        passes: 2, // Additional optimization passes
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
          ],
          tanstack: ['@tanstack/react-query'],
          // Separate chunk for date utilities
          dateUtils: ['date-fns'],
          // Separate chunk for icons
          icons: ['lucide-react'],
        },
      },
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  // Add pre-bundling optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'sonner',
      'date-fns',
      'lucide-react',
    ],
    esbuildOptions: {
      target: 'es2015',
    }
  },
  // Add CSS optimization
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      less: {
        math: 'always',
      },
    },
  },
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          vendor: ['react', 'react-dom'],
          
          // Routing
          router: ['react-router-dom'],
          
          // UI Components
          'ui-components': [
            '@radix-ui/react-dialog', '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dropdown-menu', '@radix-ui/react-context-menu',
            '@radix-ui/react-checkbox', '@radix-ui/react-radio-group',
            '@radix-ui/react-select', '@radix-ui/react-switch',
            '@radix-ui/react-tabs', '@radix-ui/react-accordion',
            '@radix-ui/react-toast', '@radix-ui/react-progress',
            '@radix-ui/react-tooltip', '@radix-ui/react-avatar',
            '@radix-ui/react-hover-card', '@radix-ui/react-popover'
          ],
          
          // Data & State Management
          supabase: ['@supabase/supabase-js'],
          query: ['@tanstack/react-query', '@tanstack/react-table'],
          
          // Forms & Validation
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Utilities
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority', 'date-fns', 'dompurify'],
          
          // Icons & UI
          icons: ['lucide-react'],
          'ui-misc': ['sonner', 'cmdk', 'vaul', 'input-otp'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // Optimisations supplémentaires
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    // Source maps pour le debug en production
    sourcemap: mode === 'development',
    // Optimisation des assets
    assetsInlineLimit: 4096,
    // Optimisation CSS
    cssCodeSplit: true,
    // Optimisation des chunks
    target: 'esnext',
    modulePreload: {
      polyfill: false
    }
  },
  // Optimisations de développement
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  // Configuration PWA
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  }
}));

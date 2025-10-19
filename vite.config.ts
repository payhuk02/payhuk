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
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
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
              
              // UI Components - Grouped by usage
              'ui-dialogs': ['@radix-ui/react-dialog', '@radix-ui/react-alert-dialog'],
              'ui-menus': ['@radix-ui/react-dropdown-menu', '@radix-ui/react-context-menu', '@radix-ui/react-menubar'],
              'ui-forms': ['@radix-ui/react-checkbox', '@radix-ui/react-radio-group', '@radix-ui/react-select', '@radix-ui/react-switch'],
              'ui-layout': ['@radix-ui/react-tabs', '@radix-ui/react-accordion', '@radix-ui/react-collapsible'],
              'ui-feedback': ['@radix-ui/react-toast', '@radix-ui/react-progress', '@radix-ui/react-tooltip'],
              'ui-navigation': ['@radix-ui/react-navigation-menu', '@radix-ui/react-scroll-area'],
              'ui-display': ['@radix-ui/react-avatar', '@radix-ui/react-aspect-ratio', '@radix-ui/react-separator'],
              'ui-interaction': ['@radix-ui/react-hover-card', '@radix-ui/react-popover', '@radix-ui/react-slider', '@radix-ui/react-toggle'],
              
              // Data & State Management
              supabase: ['@supabase/supabase-js'],
              query: ['@tanstack/react-query', '@tanstack/react-table'],
              
              // Forms & Validation
              forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
              
              // Rich Text Editor
              editor: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-color', '@tiptap/extension-link', '@tiptap/extension-text-align', '@tiptap/extension-text-style', '@tiptap/extension-underline'],
              
              // Charts & Data Visualization
              charts: ['recharts'],
              
              // File Processing
              files: ['file-saver', 'jspdf', 'jspdf-autotable', 'xlsx', 'papaparse'],
              
              // Utilities
              utils: ['clsx', 'tailwind-merge', 'class-variance-authority', 'date-fns', 'dompurify'],
              
              // Icons & UI
              icons: ['lucide-react'],
              'ui-misc': ['sonner', 'cmdk', 'vaul', 'input-otp', 'embla-carousel-react', 'embla-carousel-autoplay'],
              
              // External Services
              services: ['lovable-tagger', 'react-helmet', '@types/react-helmet'],
            }
          }
        },
        chunkSizeWarningLimit: 1000,
        // Optimisations supplémentaires
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
        // Source maps pour le debug en production
        sourcemap: false,
        // Optimisation des assets
        assetsInlineLimit: 4096,
      },
}));

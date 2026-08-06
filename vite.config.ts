import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'app',
  base: '/brotherhood/',
  envDir: projectRoot,
  envPrefix: ['VITE_', 'TONCENTER_'],
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  resolve: {
    alias: {
      '@wrappers': path.resolve(projectRoot, 'wrappers-ts'),
      '@': path.resolve(projectRoot, 'app/src'),
    },
  },
  build: {
    emptyOutDir: true,
    outDir: '../dist',
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/]react(?:-dom)?[\\/]/,
            },
            {
              name: 'ton-sdk',
              test: /node_modules[\\/]@ton[\\/](?:ton|core)[\\/]/,
            },
            {
              name: 'tonconnect',
              test: /node_modules[\\/]@tonconnect[\\/]/,
            },
            {
              name: (id) => {
                if (!id.includes('node_modules')) return null;
                const packages = [
                  { name: 'html5-qrcode', re: /node_modules[\\/]html5-qrcode[\\/]/ },
                  { name: 'react-query', re: /node_modules[\\/]@tanstack[\\/]/ },
                  { name: 'radix-ui', re: /node_modules[\\/]@radix-ui[\\/]/ },
                  { name: 'floating-ui', re: /node_modules[\\/]@floating-ui[\\/]/ },
                ];
                for (const p of packages) if (p.re.test(id)) return p.name;
                return null;
              },
            },
          ],
        },
      },
    },
  },
  server: {
    fs: {
      allow: ['.', path.resolve(projectRoot, 'wrappers-ts')],
    },
    port: 5173,
  },
});

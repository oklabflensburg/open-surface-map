import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rolldownOptions: {
      input: Object.fromEntries(
        ['index', 'impressum', 'lizenz'].map((page) => [
          page, fileURLToPath(new URL(`./${page}.html`, import.meta.url)),
        ]),
      ),
    },
  },
});

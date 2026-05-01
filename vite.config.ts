import { defineConfig, type Plugin } from 'vite';
import path from 'path';

function faviconRedirect(): Plugin {
  return {
    name: 'favicon-redirect',
    configureServer(server) {
      server.middlewares.use('/favicon.ico', (_req, res) => {
        res.writeHead(301, { Location: '/favicon/favicon.ico' });
        res.end();
      });
    },
  };
}

export default defineConfig({
  plugins: [faviconRedirect()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        terms: path.resolve(__dirname, 'terms.html'),
        privacy: path.resolve(__dirname, 'privacy.html'),
      },
    },
  },
});

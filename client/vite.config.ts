import { defineConfig, type Plugin } from 'vite';

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
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '/payment-config': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});

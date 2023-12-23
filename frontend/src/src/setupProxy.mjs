import { createProxyMiddleware } from 'http-proxy-middleware';

export default function setupProxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5241',
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        '^/api/token': '', // Rewrite path as needed
      },
    })
  );
}

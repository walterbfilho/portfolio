// Cloudflare Worker · portfolio (static assets + docs blocking)
// Bloqueia arquivos internos que não devem ser servidos publicamente.
// Referência: SECURITY_AUDIT · MEDIUM-01.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const blocked =
      path.endsWith('.md') ||
      path.endsWith('.toml') ||
      path.startsWith('/SECURITY_AUDIT') ||
      path.startsWith('/src/') ||
      path.startsWith('/functions/');

    if (blocked) {
      return new Response('Not Found', {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};

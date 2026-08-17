// Cloudflare Pages middleware.
// Bloqueia arquivos internos que não devem ser servidos publicamente.
// Referência: SECURITY_AUDIT.md · MEDIUM-01.

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  const blocked =
    path.endsWith('.md') ||
    path.endsWith('.toml') ||
    path.startsWith('/SECURITY_AUDIT') ||
    path.startsWith('/functions/');

  if (blocked) {
    return new Response('Not Found', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  return context.next();
}

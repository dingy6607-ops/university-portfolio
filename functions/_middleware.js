/**
 * Cloudflare Pages Functions 全局中间件
 *
 * 在静态资源之前执行：命中隐藏路径或敏感文件一律返回 403，
 * 响应带 no-store，避免边缘/浏览器把它缓存成 200。
 *
 * 说明：.well-known 必须放行，否则 Let's Encrypt / Search Console 验证会失败。
 */
const HIDDEN = /(^|\/)\.(?!well-known(\/|$))/;
const SENSITIVE = /\.(env|bak|old|orig|save|swp|swo|sql|sqlite|db|pem|key|p12|pfx|crt|log|map)$/i;

function isForbidden(pathname) {
  let p = pathname;
  try { p = decodeURIComponent(pathname); } catch (e) { /* 保持原样 */ }
  p = p.replace(/\\/g, '/');   // 防 Windows 反斜杠绕过
  return HIDDEN.test(p) || SENSITIVE.test(p);
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (isForbidden(url.pathname)) {
    return new Response('403 Forbidden', {
      status: 403,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
        'x-robots-tag': 'noindex, nofollow',
        'x-content-type-options': 'nosniff',
      },
    });
  }

  return context.next();
}

/**
 * ============================================================
 * 丁一铭个人站 · 后端 API（Cloudflare Worker + KV）
 * ------------------------------------------------------------
 * 接口：
 *   POST   /api/login          { password }            -> { token }
 *   GET    /api/data                                   -> { meta }         （公开）
 *   PUT    /api/data           { meta }                -> { ok }           （需登录）
 *   GET    /api/file?id=xxx                            -> 文件内容         （公开）
 *   POST   /api/file           { id, name, type, b64 } -> { ok }           （需登录）
 *   DELETE /api/file?id=xxx                            -> { ok }           （需登录）
 *
 * 控制台需要绑定：
 *   KV 命名空间变量：SITE_DATA
 *   环境变量（Secret）：AUTHOR_PASSWORD
 * ============================================================
 */

const TOKEN_TTL = 7 * 24 * 60 * 60;      // token 有效期：7 天
const META_KEY = 'site-data';
const FILE_PREFIX = 'file:';
const enc = new TextEncoder();

function b64url(buf) {
  let s = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(value)));
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
    'access-control-max-age': '86400'
  };
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(), 'cache-control': 'no-store' }
  });
}

async function makeToken(secret) {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL;
  return exp + '.' + (await sign(String(exp), secret));
}

async function authorized(request, env, url) {
  const auth = request.headers.get('authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  const token = m ? m[1] : (url.searchParams.get('token') || '');
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const exp = Number(parts[0]);
  if (!exp || exp < Math.floor(Date.now() / 1000)) return false;
  return parts[1] === (await sign(String(exp), env.AUTHOR_PASSWORD));
}

async function login(request, env) {
  let body = {};
  try { body = await request.json(); } catch (e) { body = {}; }
  const pwd = String(body.password || '');
  if (!env.AUTHOR_PASSWORD) return json({ ok: false, error: 'server password not set' }, 500);
  if (!pwd || pwd !== env.AUTHOR_PASSWORD) return json({ ok: false, error: 'wrong password' }, 401);
  return json({ ok: true, token: await makeToken(env.AUTHOR_PASSWORD) });
}

async function getData(env) {
  const meta = await env.SITE_DATA.get(META_KEY, { type: 'json' });
  if (!meta) return json({ ok: true, meta: null });
  return json({ ok: true, meta: meta, updatedAt: Date.now() });
}

async function putData(request, env, url) {
  if (!(await authorized(request, env, url))) return json({ ok: false, error: 'unauthorized' }, 401);
  let body = {};
  try { body = await request.json(); } catch (e) { return json({ ok: false, error: 'bad json' }, 400); }
  if (!body.meta) return json({ ok: false, error: 'missing meta' }, 400);
  await env.SITE_DATA.put(META_KEY, JSON.stringify(body.meta));
  return json({ ok: true, at: Date.now() });
}

async function getFile(url, env) {
  const id = url.searchParams.get('id') || '';
  if (!id) return json({ ok: false, error: 'missing id' }, 400);
  const raw = await env.SITE_DATA.get(FILE_PREFIX + id);
  if (!raw) return json({ ok: false, error: 'not found' }, 404);
  let obj = null;
  try { obj = JSON.parse(raw); } catch (e) {
    return new Response(raw, { headers: { 'content-type': 'application/octet-stream', ...corsHeaders() } });
  }
  return json({ ok: true, name: obj.name, type: obj.type, b64: obj.b64 });
}

async function putFile(request, env, url) {
  if (!(await authorized(request, env, url))) return json({ ok: false, error: 'unauthorized' }, 401);
  let body = {};
  try { body = await request.json(); } catch (e) { return json({ ok: false, error: 'bad json' }, 400); }
  if (!body.id || !body.b64) return json({ ok: false, error: 'missing id or b64' }, 400);
  // KV 单值上限 25MB，这里留出余量
  if (String(body.b64).length > 20 * 1024 * 1024) {
    return json({ ok: false, error: 'file too large (max ~15MB)' }, 413);
  }
  await env.SITE_DATA.put(FILE_PREFIX + body.id, JSON.stringify({
    name: body.name || '', type: body.type || '', b64: body.b64, at: Date.now()
  }));
  return json({ ok: true });
}

async function delFile(request, env, url) {
  if (!(await authorized(request, env, url))) return json({ ok: false, error: 'unauthorized' }, 401);
  const id = url.searchParams.get('id') || '';
  if (!id) return json({ ok: false, error: 'missing id' }, 400);
  await env.SITE_DATA.delete(FILE_PREFIX + id);
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
    if (!env.SITE_DATA) return json({ ok: false, error: 'KV namespace SITE_DATA is not bound' }, 500);

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    try {
      if (path === '/api/login' && request.method === 'POST') return await login(request, env);
      if (path === '/api/data' && request.method === 'GET') return await getData(env);
      if (path === '/api/data' && request.method === 'PUT') return await putData(request, env, url);
      if (path === '/api/file' && request.method === 'GET') return await getFile(url, env);
      if (path === '/api/file' && request.method === 'POST') return await putFile(request, env, url);
      if (path === '/api/file' && request.method === 'DELETE') return await delFile(request, env, url);
      if (path === '/api/ping') return json({ ok: true, service: 'timding-site-api' });
    } catch (e) {
      return json({ ok: false, error: String(e && e.message ? e.message : e) }, 500);
    }
    return json({ ok: false, error: 'not found: ' + path }, 404);
  }
};

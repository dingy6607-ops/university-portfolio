#!/usr/bin/env node
/**
 * 白名单构建（零依赖）
 *
 *   node build.mjs         构建 dist/ 并做安全体检
 *   node build.mjs --check 只做检查，不写文件
 *
 * 设计原则：只有 ALLOW 里列出的条目会被发布，其余（.git / .env / 备份 / 脚本）
 * 一律不进入 dist/。构建结束后还会反向扫描 dist/，发现禁止内容直接以退出码 1 失败，
 * 让部署停在构建阶段，而不是把敏感文件带上公网。
 */
import { readdir, stat, mkdir, rm, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'dist');
const CHECK_ONLY = process.argv.includes('--check');

/** 允许公开展示的条目（不存在会自动跳过） */
const ALLOW = [
  'index.html',
  'assets',
  'favicon.ico',
  'favicon.svg',
  'robots.txt',
  'sitemap.xml',
  '_headers',
  // 说明：不要加入 _routes.json —— 未启用 Functions 的项目会报
  // "Pages _routes.json is not supported"，且它只影响路由范围，不影响安全。
];

/** 禁止发布：以点开头、黑名单目录、敏感后缀 */
const NAME_BLOCK = /^\./;
const DIR_BLOCK = /^(\.git|\.svn|\.hg|\.github|node_modules|dist|functions|\.idea|\.vscode|worker)$/i;
const EXT_BLOCK = /\.(env|bak|old|orig|save|swp|swo|tmp|temp|log|sql|sqlite|db|pem|key|p12|pfx|crt|zip|tar|gz|tgz|rar|7z|psd|ai)$/i;

const skipped = [];

async function copyTree(src, dst, rel) {
  const st = await stat(src);
  const base = path.basename(src);

  if (st.isDirectory()) {
    if (DIR_BLOCK.test(base)) { skipped.push([rel, '黑名单目录']); return; }
    await mkdir(dst, { recursive: true });
    for (const entry of await readdir(src)) {
      await copyTree(path.join(src, entry), path.join(dst, entry), rel ? rel + '/' + entry : entry);
    }
    return;
  }

  if (NAME_BLOCK.test(base)) { skipped.push([rel, '隐藏文件']); return; }
  if (EXT_BLOCK.test(base)) { skipped.push([rel, '敏感后缀']); return; }

  await mkdir(path.dirname(dst), { recursive: true });
  await copyFile(src, dst);
}

async function walk(dir, rel = '') {
  const out = [];
  let entries;
  try { entries = await readdir(dir); } catch { return out; }
  for (const name of entries) {
    const full = path.join(dir, name);
    const r = rel ? rel + '/' + name : name;
    const st = await stat(full);
    if (st.isDirectory()) out.push(...(await walk(full, r)));
    else out.push(r);
  }
  return out;
}

/** 反向扫描：产物里出现任何禁止项都视为构建失败 */
async function audit(dir) {
  const bad = [];
  for (const rel of await walk(dir)) {
    const segs = rel.split('/');
    if (segs.some((s) => DIR_BLOCK.test(s))) bad.push([rel, '黑名单目录']);
    else if (segs.some((s) => NAME_BLOCK.test(s))) bad.push([rel, '隐藏文件']);
    else if (EXT_BLOCK.test(rel)) bad.push([rel, '敏感后缀']);
  }
  return bad;
}

async function main() {
  const t0 = Date.now();

  if (!CHECK_ONLY) {
    await rm(OUT, { recursive: true, force: true });
    await mkdir(OUT, { recursive: true });
  }

  const published = [];
  for (const name of ALLOW) {
    const src = path.join(ROOT, name);
    try { await stat(src); } catch { continue; }
    published.push(name);
    if (CHECK_ONLY) continue;
    await copyTree(src, path.join(OUT, name), name);
  }

  const files = CHECK_ONLY ? [] : await walk(OUT);
  const bad = CHECK_ONLY ? [] : await audit(OUT);

  console.log('');
  console.log('  发布白名单  ' + published.join(', '));
  if (!CHECK_ONLY) console.log('  产物文件数  ' + files.length);
  if (skipped.length) {
    console.log('  已排除      ' + skipped.length + ' 项');
    for (const [rel, why] of skipped.slice(0, 15)) console.log('    - ' + rel + '  [' + why + ']');
    if (skipped.length > 15) console.log('    … 其余 ' + (skipped.length - 15) + ' 项');
  }

  if (bad.length) {
    console.error('');
    console.error('  ✗ 发布产物中仍存在禁止内容：');
    for (const [rel, why] of bad) console.error('    - ' + rel + '  [' + why + ']');
    console.error('');
    process.exit(1);
  }

  console.log('');
  console.log('  ✓ 安全检查通过：无隐藏文件、无密钥、无备份包  ' + (Date.now() - t0) + 'ms');
  console.log('');
}

main().catch((err) => {
  console.error('构建失败：' + (err && err.message ? err.message : err));
  process.exit(1);
});

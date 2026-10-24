#!/usr/bin/env node
/**
 * 推送守卫：在 git commit 之前拦截敏感文件
 * 由 推送到GitHub.bat 调用，也可手动执行：node scripts/guard.mjs
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const BLOCK = [
  /(^|\/)\.env($|\.)/i,
  /(^|\/)\.git(\/|$)/i,
  /(^|\/)\.svn(\/|$)/i,
  /(^|\/)\.hg(\/|$)/i,
  /(^|\/)\.idea(\/|$)/i,
  /(^|\/)\.vscode(\/|$)/i,
  /(^|\/)node_modules(\/|$)/i,
  /\.(bak|old|orig|save|swp|swo|sql|sqlite|db|pem|key|p12|pfx)$/i,
];
const ALLOW = [/\.env\.example$/i];

const isBad = (f) => !ALLOW.some((r) => r.test(f)) && BLOCK.some((r) => r.test(f));

function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' })
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

const staged = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']);
const tracked = git(['ls-files']);

const stagedBad = staged.filter(isBad);
const trackedBad = tracked.filter(isBad);

// 已进入暂存区的，直接移出索引（本地文件保留）
if (stagedBad.length) {
  console.log('');
  console.log('  已从暂存区移除（本地文件保留）：');
  for (const f of stagedBad) console.log('    - ' + f);
  try {
    execFileSync('git', ['rm', '--cached', '--quiet', '--', ...stagedBad], { stdio: 'ignore' });
  } catch (e) {
    /* 忽略：某些情况（如文件已被删除）会失败，不影响后续判断 */
  }
}

const problems = [];
for (const f of trackedBad) problems.push(f + '（已被 Git 跟踪，需 git rm --cached）');
if (existsSync('.env')) problems.push('.env（工作区存在，已由 .gitignore 忽略，请确认）');

if (trackedBad.length || existsSync('.env')) {
  console.error('');
  console.error('  ✗ 检测到敏感文件，已中止推送：');
  for (const p of problems) console.error('    - ' + p);
  console.error('');
  console.error('  修复：git rm --cached <文件>  然后重新运行 推送到GitHub.bat');
  console.error('  若密钥曾公网可访问，请立即轮换，而不是只删文件。');
  console.error('');
  process.exit(1);
}

if (stagedBad.length) {
  console.log('');
  console.log('  请确认上述文件已移出后，重新运行推送。');
  process.exit(1);
}

console.log('  ✓ 安全检查通过：暂存区与仓库均无敏感文件');

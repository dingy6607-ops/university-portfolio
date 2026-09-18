/* ============================================================
   App —— 页面逻辑：资料 / 文章 / 作品上传 / 图表 / 导入导出
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const esc = (s) => Markdown.escapeHtml(String(s == null ? '' : s));
  const t = (k, v) => I18N.t(k, v);                 // 取界面文案
  const pick = (zhV, enV) => I18N.pick(zhV, enV);   // 按当前语言取内容字段
  const isEn = () => I18N.lang === 'en';
  const catName = (c) => (c ? I18N.t('cat.' + c) : c);

  /* ---------------- 种子数据 ---------------- */
  const SEED = {
    profile: {
      name: '丁一铭',
      enName: 'Tim Ding',
      role: '人工智能专业 · 大一在读',
      roleEn: 'Artificial Intelligence · Freshman',
      email: 'dym18019215657@outlook.com',
      tagline: '把复杂的东西拆开、弄懂、再重新拼起来',
      taglineEn: 'Take things apart, understand them, and put them back together',
      hero: '喜欢把复杂的东西拆开、弄懂、再重新拼起来。这里存放我的课程作品、学习笔记与数据分析实践。',
      heroEn: 'I like taking complex things apart, understanding them, and rebuilding them. This site keeps my coursework, study notes and data experiments.',
      bio: [
        '你好，我是 **丁一铭**（Tim Ding），目前在一所大学读 **人工智能** 专业大一。',
        '',
        '我对机器学习、数据可视化，以及一切"能让机器变聪明"的东西都充满好奇。课余时间我喜欢：',
        '',
        '- 用 Python 复现课程里的算法：线性回归、KNN、决策树',
        '- 把学到的数学（线性代数 / 概率统计）写成通俗笔记',
        '- 折腾前端，把一个想法做成真正能点开的网页',
        '',
        '> 近期目标：在大一结束前做出一个真正跑得起来的小项目，并且能把它讲清楚。',
        '',
        '欢迎随时交流：dym18019215657@outlook.com'
      ].join('\n'),
      bioEn: [
        "Hi, I'm **Tim Ding** (丁一铭), a freshman majoring in **Artificial Intelligence**.",
        '',
        'I am curious about machine learning, data visualisation, and everything that makes machines a little smarter. In my spare time I like to:',
        '',
        '- Re-implement course algorithms in Python: linear regression, KNN, decision trees',
        '- Rewrite the maths I learn (linear algebra / probability) into plain notes',
        '- Build things for the web and turn ideas into pages you can actually click',
        '',
        '> Goal for this year: finish a small project that really runs — and be able to explain it clearly.',
        '',
        'Always happy to talk: dym18019215657@outlook.com'
      ].join('\n'),
      avatar: null,
      skills: [
        { name: 'Python', nameEn: 'Python', level: 82 },
        { name: '高等数学', nameEn: 'Calculus', level: 75 },
        { name: '线性代数', nameEn: 'Linear Algebra', level: 70 },
        { name: 'Web 前端 (HTML/CSS/JS)', nameEn: 'Web Front-end', level: 66 },
        { name: 'PyTorch', nameEn: 'PyTorch', level: 55 },
        { name: 'C / C++', nameEn: 'C / C++', level: 58 },
        { name: 'LaTeX', nameEn: 'LaTeX', level: 50 },
        { name: '英语阅读', nameEn: 'English Reading', level: 72 }
      ],
      timeline: [
        { time: '2026.09', title: '入学 · 人工智能专业', desc: '开始系统学习编程与数学基础，加入实验室兴趣小组' },
        { time: '2026.08', title: '搭建个人作品集网站', desc: '用原生 HTML / CSS / JavaScript 从零写下这个页面' },
        { time: '2026.07', title: '完成第一个 ML 小项目', desc: '用 NumPy 手写线性回归与梯度下降并可视化' },
        { time: '2026.06', title: '高中毕业', desc: '决定把兴趣变成专业，第一志愿填报人工智能' }
      ],
      timelineEn: [
        { time: '2026.09', title: 'University · AI major', desc: 'Started systematic study of programming and maths, joined a lab interest group' },
        { time: '2026.08', title: 'Built this portfolio site', desc: 'Written from scratch with plain HTML / CSS / JavaScript' },
        { time: '2026.07', title: 'First ML mini project', desc: 'Hand-wrote linear regression and gradient descent with NumPy' },
        { time: '2026.06', title: 'High school graduation', desc: 'Decided to turn my hobby into a major' }
      ],
      socials: [
        { label: 'GitHub', url: 'https://github.com/' },
        { label: 'CSDN', url: 'https://www.csdn.net/' },
        { label: '邮箱', url: 'mailto:dym18019215657@outlook.com' }
      ]
    },
    posts: [
      {
        id: 'post-seed-1',
        title: '从零开始的 AI 之旅：我的大一开局',
        date: '2026-09-10',
        tags: ['随笔', '机器学习'],
        summary: '为什么选择人工智能？这学期在学什么？以及我对于"把基础打牢"这件事的一点想法。',
        body: [
          '# 从零开始的 AI 之旅',
          '',
          '选专业时很多人问我为什么选人工智能，我的答案很简单：**因为它同时需要数学、编程和对世界的好奇心**。',
          '',
          '## 这学期在学什么',
          '',
          '1. 高等数学 —— 极限、导数、积分',
          '2. 线性代数 —— 矩阵、特征值、向量空间',
          '3. Python 程序设计 —— 从语法到小项目',
          '',
          '## 一个让我顿悟的比喻',
          '',
          '学梯度下降时，我一开始不理解为什么要"沿着梯度的反方向"走。后来把它想象成**在雾天里下山**：',
          '你看不见路，只能靠脚下最陡的方向判断，于是每一步都朝下坡走 —— 这就是梯度下降。',
          '',
          '```python',
          'for step in range(epochs):',
          '    grad = 2 * X.T @ (X @ w - y) / len(y)',
          '    w = w - lr * grad',
          '```',
          '',
          '## 给同样大一的自己',
          '',
          '- [x] 每天写一点代码，哪怕只有 20 行',
          '- [ ] 把每一章数学都推导一遍',
          '- [ ] 读完《机器学习》（西瓜书）前五章',
          '',
          '> 慢一点没关系，但要一直在走。'
        ].join('\n'),
        titleEn: 'Starting AI From Zero: My First Semester',
        summaryEn: 'Why artificial intelligence? What am I studying? And a few thoughts on building a solid foundation.',
        bodyEn: [
          '# Starting AI From Zero',
          '',
          'People often ask why I chose artificial intelligence. My answer is simple: **it needs maths, code and curiosity at the same time**.',
          '',
          '## What I am taking this term',
          '',
          '1. Calculus — limits, derivatives, integrals',
          '2. Linear algebra — matrices, eigenvalues, vector spaces',
          '3. Python programming — from syntax to small projects',
          '',
          '## The analogy that made it click',
          '',
          'Gradient descent confused me until I imagined **walking down a mountain in thick fog**: you cannot see the path, you only feel the steepest slope under your feet, so every step goes downhill.',
          '',
          '```python',
          'w = w - lr * grad',
          '```',
          '',
          '## Notes to my freshman self',
          '',
          '- [x] Write some code every day, even 20 lines',
          '- [ ] Derive every chapter of maths by hand',
          '- [ ] Finish the first five chapters of a ML textbook',
          '',
          '> Slow is fine — just keep walking.'
        ].join('\n')
      },
      {
        id: 'post-seed-2',
        title: '线性回归手记：用 NumPy 手写梯度下降',
        date: '2026-08-22',
        tags: ['机器学习', 'Python', '课程笔记'],
        summary: '不调用 sklearn，只用 NumPy 实现一遍线性回归，把损失曲面画出来看看它到底在干什么。',
        body: [
          '## 问题定义',
          '',
          '给定数据集 `(X, y)`，我们想找到一组参数 `w`，使得预测值 `Xw` 与真实值 `y` 的均方误差最小：',
          '',
          '| 符号 | 含义 | 形状 |',
          '| --- | --- | --- |',
          '| X | 特征矩阵 | (n, d) |',
          '| y | 标签向量 | (n, 1) |',
          '| w | 待学参数 | (d, 1) |',
          '',
          '## 核心代码',
          '',
          '```python',
          'import numpy as np',
          '',
          'def fit(X, y, lr=0.05, epochs=500):',
          '    n, d = X.shape',
          '    w = np.zeros((d, 1))',
          '    for _ in range(epochs):',
          '        grad = 2 * X.T @ (X @ w - y) / n',
          '        w -= lr * grad',
          '    return w',
          '```',
          '',
          '## 踩过的坑',
          '',
          '- **学习率太大**会直接发散，损失变成 `nan`',
          '- 忘记给 `X` 拼一列 `1`，模型就过不了原点以外的点',
          '- 特征量纲差太多时，梯度下降会走"之"字，需要先做标准化',
          '',
          '把损失随迭代次数的曲线画出来之后，我才真正相信"它在收敛"。'
        ].join('\n'),
        titleEn: 'Notes on Linear Regression: Gradient Descent in NumPy',
        summaryEn: 'No sklearn — just NumPy. Implement linear regression by hand and plot the loss surface to see what is really happening.',
        bodyEn: [
          '## Problem',
          '',
          'Given `(X, y)`, find `w` that minimises the mean squared error between `Xw` and `y`:',
          '',
          '| Symbol | Meaning | Shape |',
          '| --- | --- | --- |',
          '| X | feature matrix | (n, d) |',
          '| y | target vector | (n, 1) |',
          '| w | parameters | (d, 1) |',
          '',
          '## Core code',
          '',
          '```python',
          'import numpy as np',
          '',
          'def fit(X, y, lr=0.05, epochs=500):',
          '    n, d = X.shape',
          '    w = np.zeros((d, 1))',
          '    for _ in range(epochs):',
          '        grad = 2 * X.T @ (X @ w - y) / n',
          '        w -= lr * grad',
          '    return w',
          '```',
          '',
          '## Mistakes I made',
          '',
          '- **Too large a learning rate** diverges — the loss becomes `nan`',
          '- Forgetting the column of `1`s means the model cannot leave the origin',
          '- Unscaled features make gradient descent zig-zag — normalise first',
          '',
          'Plotting the loss curve is what finally convinced me it converges.'
        ].join('\n')
      },
      {
        id: 'post-seed-3',
        title: '读书报告：Attention Is All You Need（上）',
        date: '2026-08-05',
        tags: ['论文阅读', '深度学习'],
        summary: '第一次啃 Transformer 原始论文。先放下公式，搞懂它想解决什么问题。',
        body: [
          '## 它想解决什么',
          '',
          '在 Transformer 之前，序列模型主要靠 RNN：必须**一个词一个词按顺序算**，没法并行，长距离依赖也容易丢失。',
          '',
          ' Transformer 的想法很直接：**既然都是词，为什么不让它们互相"看一眼"呢？**',
          '',
          '## 三个关键组件',
          '',
          '1. **Q / K / V**：把每个词投影成"我要找什么 / 我是什么 / 我能提供什么"',
          '2. **缩放点积注意力**：`softmax(QKᵀ / √d) V`',
          '3. **多头注意力**：在不同子空间里同时做多次注意力，再拼起来',
          '',
          '## 目前还没完全搞懂的地方',
          '',
          '- 位置编码为什么用 sin / cos，而不是直接学一个向量',
          '- 残差连接在这里到底起了多大作用',
          '',
          '下一篇准备自己用 PyTorch 实现一个迷你版，把维度全部打印出来看看。'
        ].join('\n'),
        titleEn: 'Reading Report: Attention Is All You Need (Part 1)',
        summaryEn: 'My first pass at the original Transformer paper — setting the formulas aside to understand the problem it solves.',
        bodyEn: [
          '## What problem does it solve',
          '',
          'Before Transformers, sequence models relied on RNNs: they had to run **word by word**, so no parallelism, and long-range dependencies were easily lost.',
          '',
          'The Transformer idea is simple: **if they are all just words, why not let them look at each other?**',
          '',
          '## Three key pieces',
          '',
          '1. **Q / K / V**: project each word into "what I am looking for / what I am / what I can offer"',
          '2. **Scaled dot-product attention**: `softmax(QKᵀ / √d) V`',
          '3. **Multi-head attention**: run attention several times in different subspaces, then concat',
          '',
          '## Still unclear to me',
          '',
          '- Why positional encoding uses sin / cos instead of a learned vector',
          '- How much residual connections actually contribute here',
          '',
          'Next: build a mini version in PyTorch and print every shape along the way.'
        ].join('\n')
      }
    ],
    works: [],
    charts: [
      {
        id: 'chart-seed-1',
        name: '开学以来每周学习时长',
        type: 'bar',
        note: '统计口径：课外自学时间，不含上课',
        noteEn: 'Self-study time only, class hours excluded',
        nameEn: 'Weekly study hours since the semester started',
        csv: '周次,编程,数学,英语\nW1,5,4,2\nW2,7,5,3\nW3,6,7,2\nW4,9,6,4\nW5,8,8,3\nW6,11,7,5',
        createdAt: '2026-09-12'
      },
      {
        id: 'chart-seed-2',
        name: 'Python 每日刷题数量（近两周）',
        type: 'line',
        note: '目标：稳定在每天 3 题以上',
        noteEn: 'Goal: stay above 3 problems a day',
        nameEn: 'Daily Python problems solved (last two weeks)',
        csv: '日期,题数\n9/1,1\n9/2,2\n9/3,2\n9/4,3\n9/5,1\n9/6,4\n9/7,3\n9/8,3\n9/9,5\n9/10,4\n9/11,2\n9/12,5\n9/13,6\n9/14,4',
        createdAt: '2026-09-14'
      }
    ]
  };

  /* ---------------- 小工具 ---------------- */
  function toast(msg, isErr) {
    const wrap = $('#toastWrap');
    const el = document.createElement('div');
    el.className = 'toast' + (isErr ? ' err' : '');
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s, transform .3s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      setTimeout(() => el.remove(), 320);
    }, 2400);
  }

  function fmtSize(b) {
    if (b == null) return '-';
    const u = ['B', 'KB', 'MB', 'GB'];
    let i = 0, n = Number(b) || 0;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return (i === 0 ? n : n.toFixed(1)) + ' ' + u[i];
  }

  function fmtDate(d) {
    if (!d) return '';
    const s = String(d).slice(0, 10);
    return s;
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function extOf(name) {
    const m = String(name || '').match(/\.([a-zA-Z0-9]+)$/);
    return m ? m[1].toLowerCase() : '';
  }

  function guessCategory(name) {
    const e = extOf(name);
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].indexOf(e) >= 0) return '图片';
    if (['ppt', 'pptx', 'key'].indexOf(e) >= 0) return 'PPT';
    if (['pdf', 'doc', 'docx', 'md', 'txt', 'rtf'].indexOf(e) >= 0) return '文档';
    if (['csv', 'xls', 'xlsx', 'tsv', 'json'].indexOf(e) >= 0) return '数据表';
    if (['zip', 'rar', '7z', 'py', 'js', 'cpp', 'c', 'java', 'ipynb'].indexOf(e) >= 0) return '代码';
    return '其他';
  }

  function defaultAvatar(name) {
    const ch = (name || '丁').trim().slice(0, 1);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#5ee7f5"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs>' +
      '<rect width="140" height="140" fill="url(#g)"/>' +
      '<text x="70" y="70" font-size="60" font-weight="700" fill="#05121a" text-anchor="middle" ' +
      'dominant-baseline="central" font-family="sans-serif">' + esc(ch) + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /** 把图片文件压缩成 dataURL */
  function shrinkImage(file, maxW) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxW / img.width);
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          const ctx = cv.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          try { resolve(cv.toDataURL('image/jpeg', 0.82)); } catch (e) { reject(e); }
        };
        img.onerror = reject;
        img.src = String(fr.result);
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  function readText(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => reject(fr.error);
      fr.readAsText(file);
    });
  }

  function download(name, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function persist() {
    const ok = Store.save();
    if (!ok) toast(t('toast.storageFull'), true);
    return ok;
  }

  /* ---------------- 模态 ---------------- */
  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    const m = typeof id === 'string' ? document.getElementById(id) : id;
    if (!m) return;
    if (m.id === 'workViewModal') releaseUrl();
    m.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList && e.target.classList.contains('modal')) closeModal(e.target.id);
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) {
      const m = e.target.closest('.modal');
      if (m) closeModal(m.id);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    // 全屏层优先：Esc 先退出阅读器 / 查看器
    if ($('#readerOverlay') && !$('#readerOverlay').hidden) { closeReader(); return; }
    if ($('#viewerOverlay') && !$('#viewerOverlay').hidden) { closeViewer(); return; }
    $$('.modal.open').forEach((m) => closeModal(m.id));
  });

  /* ---------------- 背景粒子 ---------------- */
  function initParticles() {
    const cvs = $('#bgCanvas');
    const ctx = cvs.getContext('2d');
    let W = 0, H = 0, parts = [];
    const mouse = { x: -9999, y: -9999 };

    function parseColor(c) {
      c = (c || '').trim();
      if (c.charAt(0) === '#') {
        let h = c.slice(1);
        if (h.length === 3) h = h.split('').map((x) => x + x).join('');
        const n = parseInt(h, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      }
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (m) return m[1].split(',').slice(0, 3).map((v) => parseInt(v, 10) || 0);
      return [94, 231, 245];
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cvs.width = W * dpr; cvs.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(120, Math.round((W * H) / 17000));
      parts = [];
      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.26, vy: (Math.random() - 0.5) * 0.26,
          r: Math.random() * 1.7 + 0.6
        });
      }
    }

    function tick() {
      const rgb = parseColor(getComputedStyle(document.documentElement).getPropertyValue('--accent'));
      const base = rgb.join(',');
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 16000) {
          const f = (1 - Math.sqrt(d2) / 126) * 0.02;
          p.x += dx * f; p.y += dy * f;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + base + ',.55)';
        ctx.fill();

        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const ax = p.x - q.x, ay = p.y - q.y;
          const dist = Math.sqrt(ax * ax + ay * ay);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(' + base + ',' + (0.16 * (1 - dist / 130)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    resize();
    requestAnimationFrame(tick);
  }

  /* ---------------- 打字机 ---------------- */
  let typeTimer = null;
  function initTypewriter() {
    const el = $('#typewriter');
    if (!el) return;
    clearTimeout(typeTimer);
    el.textContent = '';
    const words = I18N.t('words').split('|').filter(Boolean);
    let wi = 0, ci = 0, del = false;
    function step() {
      const w = words[wi] || '';
      if (!del) {
        ci++;
        el.textContent = w.slice(0, ci);
        if (ci >= w.length) { del = true; typeTimer = setTimeout(step, 1600); return; }
      } else {
        ci--;
        el.textContent = w.slice(0, ci);
        if (ci <= 0) { del = false; wi = (wi + 1) % words.length; typeTimer = setTimeout(step, 320); return; }
      }
      typeTimer = setTimeout(step, del ? 45 : 95);
    }
    typeTimer = setTimeout(step, 600);
  }

  /* ---------------- 语言切换动画 ---------------- */
  let langSwitching = false;
  function switchLang() {
    if (langSwitching) return;
    const btn = $('#langBtn');
    btn.classList.remove('flip');
    void btn.offsetWidth;          // 重置动画
    btn.classList.add('flip');

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { I18N.toggle(); return; }

    langSwitching = true;
    const veil = $('#langVeil');
    $('#langVeilWord').textContent = I18N.lang === 'zh' ? 'EN' : '中';
    document.body.classList.add('lang-switching');
    veil.classList.remove('go');
    void veil.offsetWidth;
    veil.classList.add('go');

    // 幕布盖住屏幕的瞬间切换文案，随后内容重新入场
    setTimeout(() => { I18N.toggle(); }, 270);
    setTimeout(() => {
      veil.classList.remove('go');
      document.body.classList.remove('lang-switching');
      langSwitching = false;
    }, 860);
  }

  /* ---------------- 主题 / 导航 / 揭示 ---------------- */
  function initChrome() {
    const saved = localStorage.getItem('timding.theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    const btn = $('#themeBtn');
    const sync = () => {
      btn.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '🌞' : '🌙';
    };
    sync();
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('timding.theme', next);
      sync();
      renderCharts();
    });

    // 滚动进度 + 导航态 + 高亮
    const nav = $('#nav');
    const bar = $('#progressBar');
    const links = $$('.nav-link');
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
      nav.classList.toggle('scrolled', window.scrollY > 12);
      let cur = 'home';
      ['home', 'about', 'blog', 'works', 'charts', 'contact'].forEach((id) => {
        const s = document.getElementById(id);
        if (s && s.getBoundingClientRect().top <= 140) cur = id;
      });
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    $('#navToggle').addEventListener('click', () => $('#navLinks').classList.toggle('open'));
    links.forEach((a) => a.addEventListener('click', () => $('#navLinks').classList.remove('open')));

    // 揭示动画
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((el) => io.observe(el));

    // 语言切换（带过场动画）
    $('#langBtn').addEventListener('click', switchLang);
    const syncLang = () => {
      document.documentElement.setAttribute('lang', I18N.lang === 'zh' ? 'zh-CN' : 'en');
    };
    syncLang();
    I18N.onChange(() => { syncLang(); initTypewriter(); renderAll(); syncFsBtn(); });

    $('#footerLine1').textContent = t('footer.line1', { year: new Date().getFullYear() });
  }

  /* ---------------- 渲染：个人资料 ---------------- */
  function renderProfile() {
    const p = Store.meta.profile;
    const avatar = p.avatar || defaultAvatar(p.name);

    document.title = p.name + ' ' + p.enName + ' · ' + (isEn() ? 'Blog & Portfolio' : '个人博客 & 作品集');
    $('#brandName').textContent = isEn() ? (p.enName || p.name) : p.name;
    $('#brandEn').textContent = isEn() ? p.name : p.enName;
    const ba = $('#brandAvatar');
    if (p.avatar) ba.innerHTML = '<img src="' + p.avatar + '" alt="" />';
    else ba.textContent = p.name.slice(0, 1);

    $('#profileAvatar').src = avatar;
    $('#aboutName').textContent = isEn() ? (p.enName || p.name) : (p.name + ' · ' + p.enName);
    $('#aboutRole').textContent = pick(p.role, p.roleEn);
    $('#aboutTagline').textContent = pick(p.tagline, p.taglineEn);
    $('#bioBody').innerHTML = Markdown.render(pick(p.bio, p.bioEn));
    $('#heroDesc').textContent = pick(p.hero, p.heroEn);
    $('#heroEyebrow').textContent = t('hero.eyebrow', { role: pick(p.role, p.roleEn) });
    const ml = $('#mailLink');
    ml.textContent = p.email;
    ml.href = 'mailto:' + p.email;

    // 同步页面描述与弹窗标题语言
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', isEn()
        ? 'Personal blog & portfolio of ' + p.enName + ' (' + p.name + '): ' + pick(p.role, p.roleEn) +
          '. Course notes, projects, data charts and timeline.'
        : p.name + '（' + p.enName + '）的个人博客与作品集：' + pick(p.role, p.roleEn) +
          '，记录学习文章、课程作品、数据图表与成长轨迹。');
    }
    $('#postModalTitle').textContent = t('post.new');
    $('#chartModalTitle').textContent = t('chart.new');

    // 技能
    const sk = $('#skillsList');
    sk.innerHTML = '';
    p.skills.forEach((s) => {
      const li = document.createElement('li');
      li.innerHTML = '<span><b></b><b>' + s.level + '%</b></span><div class="bar"><i></i></div>';
      li.querySelector('span b').textContent = pick(s.name, s.nameEn);
      sk.appendChild(li);
      requestAnimationFrame(() => { li.querySelector('.bar > i').style.width = s.level + '%'; });
    });

    // 时间线（英文版优先使用 timelineEn）
    const tlData = (isEn() && p.timelineEn && p.timelineEn.length) ? p.timelineEn : p.timeline;
    $('#timeline').innerHTML = tlData.map((x) =>
      '<li><time>' + esc(x.time) + '</time><strong>' + esc(x.title) + '</strong><p>' + esc(x.desc) + '</p></li>'
    ).join('');

    // 链接
    const labelEn = { '邮箱': 'Email', '邮件': 'Email', '博客': 'Blog', '个人主页': 'Homepage' };
    const socialLabel = (lb) => (isEn() ? (labelEn[lb] || lb) : lb);
    const chips = (p.socials || []).map((s) =>
      '<a class="chip" href="' + esc(s.url) + '" target="_blank" rel="noopener">🔗 ' + esc(socialLabel(s.label)) + '</a>'
    ).join('') + '<a class="chip" href="mailto:' + esc(p.email) + '">✉ ' + esc(p.email) + '</a>';
    $('#aboutChips').innerHTML = chips;
    $('#socialLinks').innerHTML = chips;
  }

  function animateCount(el, target) {
    const start = performance.now(), dur = 900;
    function step(t) {
      const p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function renderStats() {
    const m = Store.meta;
    const items = [
      [t('stat.posts'), m.posts.length],
      [t('stat.works'), m.works.length],
      [t('stat.charts'), m.charts.length],
      [t('stat.skills'), m.profile.skills.length]
    ];
    const wrap = $('#stats');
    wrap.innerHTML = items.map((it) =>
      '<div class="stat"><b data-n="' + it[1] + '">0</b><span>' + it[0] + '</span></div>'
    ).join('');
    $$('#stats b').forEach((b) => animateCount(b, Number(b.dataset.n)));
  }

  /* ---------------- 渲染：文章 ---------------- */
  let postFilter = { kw: '', tag: '' };

  function renderPosts() {
    const m = Store.meta;
    const tags = {};
    m.posts.forEach((p) => (p.tags || []).forEach((t) => { tags[t] = (tags[t] || 0) + 1; }));

    $('#postTagFilter').innerHTML =
      '<button class="chip' + (postFilter.tag ? '' : ' active') + '" data-tag="">' + esc(t('blog.all')) + '</button>' +
      Object.keys(tags).map((tg) =>
        '<button class="chip' + (postFilter.tag === tg ? ' active' : '') + '" data-tag="' + esc(tg) + '">' +
        esc(tg) + '<span class="cnt">' + tags[tg] + '</span></button>'
      ).join('');

    const kw = postFilter.kw.trim().toLowerCase();
    const list = m.posts.filter((p) => {
      if (postFilter.tag && (p.tags || []).indexOf(postFilter.tag) < 0) return false;
      if (!kw) return true;
      const hay = pick(p.title, p.titleEn) + ' ' + (p.tags || []).join(' ') + ' ' +
        pick(p.summary, p.summaryEn) + ' ' + postPlain(p);
      return hay.toLowerCase().indexOf(kw) >= 0;
    }).sort((a, b) => String(b.date).localeCompare(String(a.date)));

    const grid = $('#postGrid');
    grid.innerHTML = list.map((p, i) => {
      const plain = postPlain(p);
      const min = Math.max(1, Math.round(plain.length / 350));
      return '<article class="item" data-id="' + p.id + '" style="animation-delay:' + (i * 45) + 'ms">' +
        '<h4>' + esc(pick(p.title, p.titleEn)) + '</h4>' +
        '<p>' + esc(pick(p.summary, p.summaryEn) || plain.slice(0, 110)) + '</p>' +
        '<div class="tag-row">' + (p.tags || []).map((tg) => '<span class="tag">#' + esc(tg) + '</span>').join('') + '</div>' +
        '<div class="meta"><span>' + fmtDate(p.date) + '</span><span>·</span><span>' + esc(t('blog.minutes', { n: min })) + '</span></div>' +
        '</article>';
    }).join('');

    const empty = $('#postEmpty');
    if (!m.posts.length) { empty.hidden = false; empty.textContent = t('blog.empty'); }
    else if (!list.length) { empty.hidden = false; empty.textContent = t('blog.emptyFiltered'); }
    else empty.hidden = true;
  }

  /* ---------------- 渲染：作品 ---------------- */
  let workFilter = { kw: '', cat: '' };

  function renderWorks() {
    const m = Store.meta;
    const cats = {};
    m.works.forEach((w) => { cats[w.category] = (cats[w.category] || 0) + 1; });

    $('#workCats').innerHTML =
      '<button class="chip' + (workFilter.cat ? '' : ' active') + '" data-cat="">' + esc(t('blog.all')) + '</button>' +
      Object.keys(cats).map((c) =>
        '<button class="chip' + (workFilter.cat === c ? ' active' : '') + '" data-cat="' + esc(c) + '">' +
        esc(catName(c)) + '<span class="cnt">' + cats[c] + '</span></button>'
      ).join('');

    const kw = workFilter.kw.trim().toLowerCase();
    const list = m.works.filter((w) => {
      if (workFilter.cat && w.category !== workFilter.cat) return false;
      if (!kw) return true;
      const hay = pick(w.title, w.titleEn) + ' ' + (w.tags || []).join(' ') + ' ' + w.fileName + ' ' +
        pick(w.desc, w.descEn) + ' ' + catName(w.category);
      return hay.toLowerCase().indexOf(kw) >= 0;
    }).sort((a, b) => String(b.date).localeCompare(String(a.date)));

    const grid = $('#workGrid');
    grid.innerHTML = list.map((w, i) => {
      const thumb = w.thumb
        ? '<div class="thumb"><img src="' + w.thumb + '" alt="" /></div>'
        : '<div class="thumb"><span class="ext">' + esc((w.ext || 'FILE').toUpperCase()) + '</span></div>';
      return '<article class="item" data-id="' + w.id + '" style="animation-delay:' + (i * 45) + 'ms">' +
        thumb +
        '<span class="cat-badge">' + esc(catName(w.category)) + '</span>' +
        '<h4>' + esc(pick(w.title, w.titleEn)) + '</h4>' +
        '<p>' + esc(pick(w.desc, w.descEn) || w.fileName) + '</p>' +
        '<div class="tag-row">' + (w.tags || []).map((tg) => '<span class="tag">#' + esc(tg) + '</span>').join('') + '</div>' +
        '<div class="meta"><span>' + esc(w.fileName) + '</span><span>·</span><span>' + fmtSize(w.size) + '</span><span>·</span><span>' + fmtDate(w.date) + '</span></div>' +
        '</article>';
    }).join('');

    const empty = $('#workEmpty');
    if (!m.works.length) { empty.hidden = false; empty.textContent = t('works.empty'); }
    else if (!list.length) { empty.hidden = false; empty.textContent = t('works.emptyFiltered'); }
    else empty.hidden = true;
  }

  /* ---------------- 渲染：图表 ---------------- */
  function renderCharts() {
    const m = Store.meta;
    const grid = $('#chartGrid');
    grid.innerHTML = m.charts.map((c, i) =>
      '<article class="item chart-card" data-id="' + c.id + '" style="animation-delay:' + (i * 60) + 'ms">' +
      '<div class="card-head"><h4>' + esc(pick(c.name, c.nameEn)) + '</h4><span class="muted small">' +
      esc(I18N.t('type.' + c.type)) + ' · ' + fmtDate(c.createdAt) + '</span></div>' +
      '<div class="canvas-wrap"><canvas data-cid="' + c.id + '"></canvas><div class="chart-tip" hidden></div></div>' +
      '<p class="muted small">' + esc(pick(c.note, c.noteEn)) + '</p>' +
      '<div class="chart-legend">' + Charts.legend(c) + '</div>' +
      '<div class="tag-row"><button class="btn small" data-act="edit">' + esc(t('btn.edit')) + '</button>' +
      '<button class="btn small btn-danger" data-act="del">' + esc(t('btn.delete')) + '</button></div>' +
      '</article>'
    ).join('');

    $('#chartEmpty').hidden = m.charts.length > 0;

    requestAnimationFrame(() => {
      $$('#chartGrid canvas').forEach((cv) => {
        const c = m.charts.filter((x) => x.id === cv.dataset.cid)[0];
        if (!c) return;
        Charts.draw(cv, c);
        const tip = cv.parentNode.querySelector('.chart-tip');
        if (tip) Charts.bindTooltip(cv, tip);
      });
    });
  }

  /* ---------------- 资料编辑 ---------------- */
  function openProfileModal() {
    const p = Store.meta.profile;
    $('#pName').value = p.name;
    $('#pEnName').value = p.enName;
    $('#pRole').value = isEn() ? (p.roleEn || '') : p.role;
    $('#pEmail').value = p.email;
    $('#pTagline').value = isEn() ? (p.taglineEn || '') : p.tagline;
    $('#pHero').value = isEn() ? (p.heroEn || '') : p.hero;
    $('#pBio').value = isEn() ? (p.bioEn || '') : p.bio;
    $('#pAvatarPreview').src = p.avatar || defaultAvatar(p.name);
    $('#pSkills').value = p.skills.map((s) => pick(s.name, s.nameEn) + ',' + s.level).join('\n');
    const tlData = (isEn() && p.timelineEn && p.timelineEn.length) ? p.timelineEn : p.timeline;
    $('#pTimeline').value = tlData.map((x) => x.time + ' | ' + x.title + ' | ' + x.desc).join('\n');
    $('#pSocials').value = (p.socials || []).map((s) => s.label + ' | ' + s.url).join('\n');
    $('#profileLangHint').textContent = t(isEn() ? 'post.enHint' : 'post.zhHint');
    openModal('profileModal');
  }

  function initProfileEvents() {
    $('#editProfileBtn').addEventListener('click', openProfileModal);
    $('#editProfileBtn2').addEventListener('click', openProfileModal);

    $('#pAvatarBtn').addEventListener('click', () => $('#pAvatar').click());
    $('#pAvatar').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (!f) return;
      shrinkImage(f, 320).then((url) => {
        $('#pAvatarPreview').src = url;
      }).catch(() => toast(t('toast.avatarFail'), true));
    });

    $('#saveProfileBtn').addEventListener('click', () => {
      const p = Store.meta.profile;
      p.name = $('#pName').value.trim() || p.name;
      p.enName = $('#pEnName').value.trim();
      p.email = $('#pEmail').value.trim();
      if (isEn()) {
        p.roleEn = $('#pRole').value.trim();
        p.taglineEn = $('#pTagline').value.trim();
        p.heroEn = $('#pHero').value.trim();
        p.bioEn = $('#pBio').value;
      } else {
        p.role = $('#pRole').value.trim();
        p.tagline = $('#pTagline').value.trim();
        p.hero = $('#pHero').value.trim();
        p.bio = $('#pBio').value;
      }

      const prev = $('#pAvatarPreview').src;
      if (prev && prev.indexOf('data:') === 0) p.avatar = prev;

      const prevSkills = p.skills || [];
      const skParsed = $('#pSkills').value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const parts = l.split(',');
        const lv = parseInt(parts.pop(), 10);
        return { name: parts.join(',').trim(), level: isNaN(lv) ? 60 : Math.max(0, Math.min(100, lv)) };
      });
      p.skills = skParsed.map((s, i) => {
        const old = prevSkills[i] || {};
        return isEn()
          ? { name: old.name || s.name, nameEn: s.name, level: s.level }
          : { name: s.name, nameEn: old.nameEn || s.name, level: s.level };
      });
      const tlParsed = $('#pTimeline').value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const parts = l.split('|').map((x) => x.trim());
        return { time: parts[0] || '', title: parts[1] || '', desc: parts[2] || '' };
      });
      if (isEn()) p.timelineEn = tlParsed; else p.timeline = tlParsed;
      p.socials = $('#pSocials').value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const parts = l.split('|').map((x) => x.trim());
        return { label: parts[0] || '链接', url: parts[1] || '#' };
      });

      persist();
      renderProfile();
      renderStats();
      closeModal('profileModal');
      toast(t('toast.profileSaved'));
    });
  }

  /* ---------------- 文章编辑 ---------------- */
  let editingPostId = null;
  let viewingPostId = null;

  /* 站内图片：把 data-asset="文件ID" 的占位图换成真实文件 */
  const assetUrls = [];
  function hydrateAssets(root) {
    $$('img.md-asset', root).forEach((img) => {
      const id = img.dataset.asset;
      if (!id || img.dataset.hydrated) return;
      img.dataset.hydrated = '1';
      Store.getFile(id).then((f) => {
        if (!f) {
          img.classList.add('missing');
          if (!img.alt) img.alt = t('editor.imgMissing');
          return;
        }
        const url = URL.createObjectURL(f.blob);
        assetUrls.push(url);
        while (assetUrls.length > 40) URL.revokeObjectURL(assetUrls.shift());
        img.onload = () => { img.dataset.loaded = '1'; };
        img.src = url;
      });
    });
  }

  /** 收集文章里引用的图片文件 ID */
  function postAssetIds(p) {
    const ids = [];
    const re = /asset:([A-Za-z0-9_-]+)/g;
    [p.body, p.bodyEn].forEach((b) => {
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(b || '')) !== null) ids.push(m[1]);
    });
    return ids;
  }

  function openPostModal(post) {
    editingPostId = post ? post.id : null;
    $('#postModalTitle').textContent = post ? t('post.edit') : t('post.new');
    $('#postTitle').value = post ? (isEn() ? (post.titleEn || '') : post.title) : '';
    $('#postDate').value = post ? String(post.date).slice(0, 10) : today();
    $('#postTags').value = post ? (post.tags || []).join(', ') : '';
    $('#postSummary').value = post ? (isEn() ? (post.summaryEn || '') : (post.summary || '')) : '';

    // 正文：富文本（旧 Markdown 文章自动转换）
    const ed = $('#postEditor');
    const hint = $('#postFormatHint');
    hint.hidden = true;
    let html = '<p><br></p>';
    if (post) {
      const raw = isEn() ? (post.bodyEn || '') : post.body;
      if (post.format === 'html') html = raw || '<p><br></p>';
      else if (raw) { html = Markdown.render(raw); hint.hidden = false; }
    }
    ed.innerHTML = sanitizeHtml(html);
    ed.setAttribute('data-placeholder', t('editor.placeholder'));
    hint.textContent = t('editor.mdConverted');
    hydrateAssets(ed);
    hydrateCharts(ed);
    updateWordCount();

    $('#deletePostBtn').hidden = !post;
    $('#postLangHint').textContent = t(isEn() ? 'post.enHint' : 'post.zhHint');
    $('#tablePanel').hidden = true;
    openModal('postModal');
    setTimeout(() => { try { ed.focus(); } catch (e) {} }, 80);
  }

  /* HTML 清洗：保留富文本标签，去掉脚本与事件属性 */
  function sanitizeHtml(html) {
    const doc = new DOMParser().parseFromString('<div id="san">' + (html || '') + '</div>', 'text/html');
    const root = doc.getElementById('san');
    if (!root) return '';
    const kill = root.querySelectorAll('script,style,iframe,object,embed,link,meta,form,input,button,select,textarea');
    Array.prototype.forEach.call(kill, (n) => n.remove());
    Array.prototype.forEach.call(root.querySelectorAll('*'), (n) => {
      Array.prototype.slice.call(n.attributes).forEach((a) => {
        const name = String(a.name || '').toLowerCase();
        const val = String(a.value || '').replace(/[\s -]/g, '').toLowerCase();
        if (name.indexOf('on') === 0) n.removeAttribute(a.name);
        else if ((name === 'href' || name === 'src') && val.indexOf('javascript:') === 0) n.removeAttribute(a.name);
      });
    });
    return root.innerHTML;
  }

  /** 去掉 HTML 标签取纯文本 */
  function stripTags(html) {
    const doc = new DOMParser().parseFromString('<div id="stx">' + (html || '') + '</div>', 'text/html');
    const el = doc.getElementById('stx');
    return ((el && el.textContent) || '').replace(/\s+/g, ' ').trim();
  }

  /** 文章纯文本（用于摘要、搜索、字数） */
  function postPlain(p) {
    const raw = pick(p.body, p.bodyEn);
    return p.format === 'html' ? stripTags(raw) : Markdown.plain(raw);
  }

  /** 把文章内容渲染到容器（富文本 HTML 或旧版 Markdown） */
  function renderBody(post, el) {
    const raw = pick(post.body, post.bodyEn);
    el.innerHTML = post.format === 'html' ? sanitizeHtml(raw) : Markdown.render(raw);
    hydrateAssets(el);
    hydrateCharts(el);
  }

  /** 把文章中嵌入的图表占位渲染成真实 Canvas */
  function hydrateCharts(root) {
    $$('.md-chart', root).forEach((el) => {
      if (el.dataset.drawn === '1') return;
      el.dataset.drawn = '1';
      el.innerHTML = '';
      const cv = document.createElement('canvas');
      const tip = document.createElement('div');
      tip.className = 'chart-tip';
      tip.hidden = true;
      el.appendChild(cv);
      el.appendChild(tip);
      let csv = '';
      try { csv = decodeURIComponent(el.dataset.csv || ''); } catch (e) { csv = el.dataset.csv || ''; }
      Charts.draw(cv, { type: el.dataset.type || 'line', csv: csv });
      Charts.bindTooltip(cv, tip);
      if (el.dataset.name) {
        const cap = document.createElement('div');
        cap.className = 'chart-cap';
        cap.textContent = el.dataset.name;
        el.appendChild(cap);
      }
    });
  }

  /* 富文本编辑：工具栏命令 */
  function execCmd(cmd, val) {
    const ed = $('#postEditor');
    ed.focus();
    try { document.execCommand(cmd, false, val || null); } catch (e) {}
    updateWordCount();
  }

  function updateWordCount() {
    const ed = $('#postEditor');
    if (!ed) return;
    const n = (ed.textContent || '').replace(/\s+/g, '').length;
    $('#postWordCount').textContent = t('editor.words', { n: n });
  }

  function insertRichHtml(html) {
    const ed = $('#postEditor');
    ed.focus();
    let ok = false;
    try { ok = document.execCommand('insertHTML', false, html); } catch (e) { ok = false; }
    if (!ok) ed.innerHTML += html;
    updateWordCount();
  }

  function richInsertImages(files) {
    const imgs = Array.prototype.slice.call(files || []).filter((f) => /^image\//.test(f.type));
    if (!imgs.length) return;
    let done = 0;
    imgs.forEach((f) => {
      const fileId = uid();
      Store.putFile(fileId, f).then(() => {
        const alt = f.name.replace(/\.[^.]+$/, '');
        insertRichHtml('<img class="md-asset" data-asset="' + fileId + '" alt="' + esc(alt) + '" /><p><br></p>');
        hydrateAssets($('#postEditor'));
        done++;
        toast(t('editor.imgInserted', { n: done }));
      }).catch(() => toast(t('editor.imgFail'), true));
    });
  }

  function richInsertTable(cols, rows) {
    const c = Math.max(1, Math.min(10, cols || 3));
    const r = Math.max(1, Math.min(30, rows || 3));
    const word = isEn() ? 'Col ' : '列';
    const head = '<tr>' + Array.from({ length: c }, (_, i) => '<th>' + word + (i + 1) + '</th>').join('') + '</tr>';
    const body = Array.from({ length: r }, () =>
      '<tr>' + Array.from({ length: c }, () => '<td><br></td>').join('') + '</tr>'
    ).join('');
    insertRichHtml('<table><thead>' + head + '</thead><tbody>' + body + '</tbody></table><p><br></p>');
  }

  function initPostEvents() {
    $('#newPostBtn').addEventListener('click', () => openPostModal(null));

    // 富文本工具条：格式命令 / 段落格式 / 链接与分割线
    $$('#postModal .tool[data-cmd]').forEach((b) => b.addEventListener('click', () => execCmd(b.dataset.cmd)));
    $$('#postModal .tool[data-block]').forEach((b) => b.addEventListener('click', () => execCmd('formatBlock', '<' + b.dataset.block + '>')));
    $$('#postModal .tool[data-md]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.md === 'link') {
        const url = prompt(isEn() ? 'Link URL' : '链接地址', 'https://');
        if (url) execCmd('createLink', url);
      } else if (b.dataset.md === 'hr') {
        insertRichHtml('<hr /><p><br></p>');
      }
    }));

    $('#mdImageBtn').addEventListener('click', () => $('#mdImageInput').click());
    $('#mdImageInput').addEventListener('change', (e) => { richInsertImages(e.target.files); e.target.value = ''; });
    $('#mdTableBtn').addEventListener('click', () => { const p = $('#tablePanel'); p.hidden = !p.hidden; });
    $('#tblInsertBtn').addEventListener('click', () => {
      richInsertTable(parseInt($('#tblCols').value, 10), parseInt($('#tblRows').value, 10));
      $('#tablePanel').hidden = true;
    });
    $('#mdChartBtn').addEventListener('click', () => { chartInsertMode = true; openChartModal(null); });

    const ed = $('#postEditor');
    ed.addEventListener('input', updateWordCount);
    ed.addEventListener('keyup', updateWordCount);
    ed.addEventListener('paste', (e) => {
      const fs = (e.clipboardData && e.clipboardData.files) || [];
      if (fs.length) { e.preventDefault(); richInsertImages(fs); }
    });
    ed.addEventListener('drop', (e) => {
      const fs = (e.dataTransfer && e.dataTransfer.files) || [];
      if (fs.length) { e.preventDefault(); richInsertImages(fs); }
    });

    $('#postModalFile').addEventListener('change', (e) => {
      const files = Array.prototype.slice.call(e.target.files || []);
      files.forEach((f) => {
        readText(f).then((txt) => {
          const head = txt.match(/^#\s+(.+)$/m);
          if (!$('#postTitle').value.trim()) {
            $('#postTitle').value = head ? head[1].trim() : f.name.replace(/\.(md|markdown|txt|html)$/i, '');
          }
          const isHtml = /^(<html|<!doctype|<[a-z]+[\s>])/i.test(txt.trim());
          insertRichHtml(isHtml ? sanitizeHtml(txt) : Markdown.render(txt));
          updateWordCount();
          toast(t('toast.importPost', { name: f.name }));
        }).catch(() => toast(t('toast.readFail', { name: f.name }), true));
      });
      e.target.value = '';
    });

    $('#savePostBtn').addEventListener('click', () => {
      const title = $('#postTitle').value.trim();
      if (!title) return toast(t('toast.noTitle'), true);
      const summary = $('#postSummary').value.trim();
      const body = sanitizeHtml($('#postEditor').innerHTML);
      const data = {
        format: 'html',
        date: $('#postDate').value || today(),
        tags: $('#postTags').value.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
      };
      if (isEn()) {
        data.titleEn = title; data.summaryEn = summary; data.bodyEn = body;
        if (!editingPostId) { data.title = title; data.summary = summary; data.body = body; }
      } else {
        data.title = title; data.summary = summary; data.body = body;
        if (!editingPostId) { data.titleEn = title; data.summaryEn = summary; data.bodyEn = body; }
      }
      if (editingPostId) {
        const p = Store.meta.posts.filter((x) => x.id === editingPostId)[0];
        if (p) Object.assign(p, data);
      } else {
        data.id = uid();
        data.createdAt = today();
        Store.meta.posts.push(data);
      }
      persist();
      renderPosts();
      renderStats();
      closeModal('postModal');
      toast(t('toast.postSaved'));
    });

    $('#deletePostBtn').addEventListener('click', () => {
      if (!editingPostId) return;
      if (!confirm(t('confirm.post'))) return;
      const post = Store.meta.posts.filter((x) => x.id === editingPostId)[0];
      if (post) postAssetIds(post).forEach((fid) => Store.deleteFile(fid));
      Store.meta.posts = Store.meta.posts.filter((p) => p.id !== editingPostId);
      persist();
      renderPosts();
      renderStats();
      closeModal('postModal');
      toast(t('toast.deleted'));
    });

    $('#postFileInput').addEventListener('change', (e) => {
      const files = Array.prototype.slice.call(e.target.files || []);
      let n = 0;
      files.forEach((f) => {
        readText(f).then((txt) => {
          const head = txt.match(/^#\s+(.+)$/m);
          Store.meta.posts.push({
            id: uid(),
            format: 'md',
            title: head ? head[1].trim() : f.name.replace(/\.(md|markdown|txt)$/i, ''),
            date: today(),
            tags: [isEn() ? 'imported' : '导入'],
            summary: Markdown.plain(txt, 90),
            body: txt,
            titleEn: head ? head[1].trim() : f.name.replace(/\.(md|markdown|txt)$/i, ''),
            summaryEn: Markdown.plain(txt, 90),
            bodyEn: txt,
            createdAt: today()
          });
          n++;
          persist();
          renderPosts();
          renderStats();
          toast(t('toast.imported', { n: n }));
        }).catch(() => toast(t('toast.readFail', { name: f.name }), true));
      });
      e.target.value = '';
    });

    $('#postSearch').addEventListener('input', (e) => { postFilter.kw = e.target.value; renderPosts(); });
    $('#postTagFilter').addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      postFilter.tag = b.dataset.tag || '';
      renderPosts();
    });

    $('#postGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.item');
      if (!card) return;
      const p = Store.meta.posts.filter((x) => x.id === card.dataset.id)[0];
      if (!p) return;
      viewingPostId = p.id;
      $('#pvTitle').textContent = p.title;
      $('#pvMeta').innerHTML = '<span>' + fmtDate(p.date) + '</span>' +
        (p.tags || []).map((t) => '<span class="tag">#' + esc(t) + '</span>').join('');
      renderBody(p, $('#pvBody'));
      openModal('postViewModal');
    });

    $('#pvEditBtn').addEventListener('click', () => {
      const p = Store.meta.posts.filter((x) => x.id === viewingPostId)[0];
      closeModal('postViewModal');
      openPostModal(p);
    });
  }

  /* ---------------- 作品上传 / 预览 ---------------- */
  let pendingFiles = [];
  let currentObjectUrl = null;
  let viewingWorkId = null;

  function openUploadModal(files) {
    pendingFiles = files || [];
    if (!pendingFiles.length) return;
    const list = $('#upFilesList');
    list.innerHTML = pendingFiles.map((f, i) =>
      '<div class="up-item" data-i="' + i + '">' +
      '<div class="up-name"><b>' + esc(f.name) + '</b><span>' + fmtSize(f.size) + ' · ' + esc(catName(guessCategory(f.name))) + '</span></div>' +
      '<input class="input up-title" placeholder="' + esc(t('up.titlePh')) + '" value="' + esc(f.name.replace(/\.[^.]+$/, '')) + '" />' +
      '<input class="input up-desc" placeholder="' + esc(t('up.descPh')) + '" />' +
      '</div>'
    ).join('');
    $('#upCategory').value = guessCategory(pendingFiles[0].name);
    openModal('uploadModal');
  }

  function initWorkEvents() {
    const dz = $('#dropzone');
    const input = $('#workFileInput');

    dz.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => {
      openUploadModal(Array.prototype.slice.call(e.target.files || []));
      e.target.value = '';
    });
    ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => {
      e.preventDefault(); dz.classList.add('drag');
    }));
    ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => {
      e.preventDefault(); dz.classList.remove('drag');
    }));
    dz.addEventListener('drop', (e) => {
      const files = Array.prototype.slice.call((e.dataTransfer && e.dataTransfer.files) || []);
      if (files.length) openUploadModal(files);
    });
    $('#uploadBtn').addEventListener('click', () => input.click());
    $('#uploadBtn2').addEventListener('click', () => input.click());

    $('#saveWorksBtn').addEventListener('click', () => {
      if (!pendingFiles.length) return;
      const cat = $('#upCategory').value;
      const commonTags = $('#upTags').value.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
      const rows = $$('#upFilesList .up-item');
      let big = 0;

      Promise.all(pendingFiles.map((f, i) => {
        const row = rows[i];
        const title = (row && row.querySelector('.up-title').value.trim()) || f.name.replace(/\.[^.]+$/, '');
        const desc = (row && row.querySelector('.up-desc').value.trim()) || '';
        const fileId = uid();
        const baseName = f.name.replace(/\.[^.]+$/, '');
        const work = {
          id: uid(),
          fileId: fileId,
          title: isEn() ? baseName : title,
          titleEn: isEn() ? title : '',
          desc: isEn() ? '' : desc,
          descEn: isEn() ? desc : '',
          category: cat,
          tags: commonTags,
          fileName: f.name,
          size: f.size,
          type: f.type || '',
          ext: extOf(f.name),
          date: today(),
          thumb: null
        };
        if (f.size > 60 * 1024 * 1024) big++;
        const thumbJob = /^image\//.test(f.type)
          ? shrinkImage(f, 420).then((u) => { work.thumb = u; }).catch(() => {})
          : Promise.resolve();
        return thumbJob
          .then(() => Store.putFile(fileId, f))
          .then((where) => {
            work.storage = where;
            Store.meta.works.push(work);
          })
          .catch(() => toast(t('toast.saveFail', { name: f.name }), true));
      })).then(() => {
        persist();
        renderWorks();
        renderStats();
        closeModal('uploadModal');
        pendingFiles = [];
        toast(t('toast.worksSaved', { n: Store.meta.works.length, tip: big ? t('toast.bigFile') : '' }));
      });
    });

    $('#workSearch').addEventListener('input', (e) => { workFilter.kw = e.target.value; renderWorks(); });
    $('#workCats').addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      workFilter.cat = b.dataset.cat || '';
      renderWorks();
    });

    // 作品详情
    $('#workGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.item');
      if (!card) return;
      openWorkView(card.dataset.id);
    });

    $('#wvEditBtn').addEventListener('click', () => {
      const f = $('#wvEditForm');
      f.hidden = !f.hidden;
      const w = currentWork();
      if (w && !f.hidden) {
        $('#wvEditTitle').value = pick(w.title, w.titleEn);
        $('#wvEditCat').value = w.category;
        $('#wvEditTags').value = (w.tags || []).join(', ');
        $('#wvEditDesc').value = pick(w.desc, w.descEn) || '';
      }
    });

    $('#wvSaveEditBtn').addEventListener('click', () => {
      const w = currentWork();
      if (!w) return;
      const newTitle = $('#wvEditTitle').value.trim();
      const newDesc = $('#wvEditDesc').value.trim();
      if (isEn()) { w.titleEn = newTitle || w.titleEn; w.descEn = newDesc; }
      else { w.title = newTitle || w.title; w.desc = newDesc; }
      w.category = $('#wvEditCat').value.trim() || w.category;
      w.tags = $('#wvEditTags').value.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
      persist();
      renderWorks();
      $('#wvTitle').textContent = pick(w.title, w.titleEn);
      $('#wvEditForm').hidden = true;
      toast(t('toast.updated'));
    });

    $('#wvDeleteBtn').addEventListener('click', () => {
      const w = currentWork();
      if (!w || !confirm(t('confirm.work', { name: pick(w.title, w.titleEn) }))) return;
      Store.deleteFile(w.fileId);
      Store.meta.works = Store.meta.works.filter((x) => x.id !== w.id);
      persist();
      renderWorks();
      renderStats();
      closeModal('workViewModal');
      toast(t('toast.deleted'));
    });
  }

  function currentWork() {
    return Store.meta.works.filter((w) => w.id === viewingWorkId)[0] || null;
  }

  function releaseUrl() {
    if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; }
  }

  function openWorkView(id) {
    const w = Store.meta.works.filter((x) => x.id === id)[0];
    if (!w) return;
    viewingWorkId = id;
    releaseUrl();

    $('#wvTitle').textContent = pick(w.title, w.titleEn);
    $('#wvMeta').innerHTML = '<span class="tag">' + esc(catName(w.category)) + '</span>' +
      '<span>' + esc(w.fileName) + '</span><span>' + fmtSize(w.size) + '</span><span>' + fmtDate(w.date) + '</span>' +
      (w.tags || []).map((tg) => '<span class="tag">#' + esc(tg) + '</span>').join('');
    $('#wvDesc').innerHTML = Markdown.render(pick(w.desc, w.descEn) || '');
    $('#wvEditForm').hidden = true;
    const area = $('#wvPreview');
    area.innerHTML = '<div class="no-preview">' + esc(t('works.reading')) + '</div>';

    Store.getFile(w.fileId).then((f) => {
      if (!f) {
        area.innerHTML = '<div class="no-preview"><span class="ext">' + esc((w.ext || 'FILE').toUpperCase()) +
          '</span>' + esc(t('works.fileLost')) + '</div>';
        $('#wvDownload').style.display = 'none';
        return;
      }
      const url = URL.createObjectURL(f.blob);
      currentObjectUrl = url;
      const dl = $('#wvDownload');
      dl.style.display = '';
      dl.href = url;
      dl.setAttribute('download', w.fileName);

      const ext = w.ext || extOf(f.name);
      if (/^image\//.test(f.type) || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].indexOf(ext) >= 0) {
        area.innerHTML = '<img src="' + url + '" alt="' + esc(w.title) + '" />';
      } else if (f.type === 'application/pdf' || ext === 'pdf') {
        area.innerHTML = '<iframe src="' + url + '" title="' + esc(w.title) + '"></iframe>';
      } else if (/^text\//.test(f.type) || ['md', 'txt', 'json', 'js', 'py', 'java', 'c', 'cpp', 'html', 'css'].indexOf(ext) >= 0) {
        readText(f.blob).then((txt) => {
          area.innerHTML = '<div class="preview-scroll">' + (
            ext === 'md' ? '<div class="markdown-body" style="padding:16px">' + Markdown.render(txt) + '</div>'
              : '<pre>' + esc(txt) + '</pre>'
          ) + '</div>';
        });
      } else if (['csv', 'tsv'].indexOf(ext) >= 0) {
        readText(f.blob).then((txt) => {
          const d = Charts.parseCSV(txt);
          const head = d.headers.map((h) => '<th>' + esc(h) + '</th>').join('');
          const body = d.labels.map((lb, i) =>
            '<tr><td>' + esc(lb) + '</td>' + d.series.map((s) => '<td>' + esc(s.values[i]) + '</td>').join('') + '</tr>'
          ).join('');
          area.innerHTML = '<div class="preview-scroll"><table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
        });
      } else {
        area.innerHTML = '<div class="no-preview"><span class="ext">' + esc((ext || 'FILE').toUpperCase()) +
          '</span>' + esc(t('works.noPreview')) + '</div>';
      }
    });

    openModal('workViewModal');
  }

  /* ---------------- 图表 ---------------- */
  let editingChartId = null;
  let chartInsertMode = false;
  let gridData = [];
  let gridTimer = null;

  function cellText(v) {
    const s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function matrixToCsv(m) {
    return (m || []).map((row) => row.map(cellText).join(',')).join('\n');
  }

  function csvToMatrix(csv) {
    const d = Charts.parseCSV(csv || '');
    if (!d.headers || !d.headers.length) return [];
    const rows = d.labels.map((lb, i) => [lb].concat(d.series.map((s) => {
      const v = s.values[i];
      return isNaN(v) ? '' : v;
    })));
    return [d.headers].concat(rows);
  }

  function defaultMatrix() {
    return isEn()
      ? [['Week', 'Hours', 'Problems'], ['W1', 6, 3], ['W2', 8, 5], ['W3', 7, 4]]
      : [['周次', '学习时长', '刷题数'], ['W1', 6, 3], ['W2', 8, 5], ['W3', 7, 4]];
  }

  function renderGrid() {
    const tbl = $('#chGrid');
    if (!gridData.length) return;
    const head = gridData[0];
    const thead = '<thead><tr><th class="row-head">#</th>' +
      head.map((h, c) => '<th><span contenteditable="true" data-r="0" data-c="' + c + '">' + esc(h) + '</span></th>').join('') +
      '</tr></thead>';
    const tbody = '<tbody>' + gridData.slice(1).map((row, ri) =>
      '<tr><td class="row-head">' + (ri + 1) + '</td>' +
      row.map((cell, c) => '<td><span contenteditable="true" data-r="' + (ri + 1) + '" data-c="' + c + '">' + esc(cell) + '</span></td>').join('') +
      '</tr>'
    ).join('') + '</tbody>';
    tbl.innerHTML = thead + tbody;
  }

  function syncGridFromCsv(csv) {
    const m = csvToMatrix(csv);
    gridData = m.length ? m : defaultMatrix();
    renderGrid();
  }

  function gridChanged() {
    const csv = matrixToCsv(gridData);
    $('#chCsv').value = csv;
    drawChartPreview();
  }

  function openChartModal(chart) {
    editingChartId = chart ? chart.id : null;
    $('#chartModalTitle').textContent = chartInsertMode
      ? t('editor.chart')
      : (chart ? t('chart.edit') : t('chart.new'));
    $('#chName').value = chart ? pick(chart.name, chart.nameEn) : '';
    $('#chType').value = chart ? chart.type : 'line';
    const csv = chart ? chart.csv : (chartInsertMode ? '' : matrixToCsv(defaultMatrix()));
    $('#chCsv').value = csv || matrixToCsv(defaultMatrix());
    $('#chNote').value = chart ? pick(chart.note, chart.noteEn) : '';
    $('#deleteChartBtn').hidden = !chart;
    $('#saveChartBtn').textContent = chartInsertMode ? t('editor.insertChart') : t('chart.save');
    $('#chCsvWrap').hidden = true;
    syncGridFromCsv($('#chCsv').value);
    openModal('chartModal');
    requestAnimationFrame(drawChartPreview);
  }

  function drawChartPreview() {
    const csv = gridData.length ? matrixToCsv(gridData) : $('#chCsv').value;
    const spec = { type: $('#chType').value, csv: csv };
    Charts.draw($('#chPreviewCanvas'), spec);
    const d = Charts.parseCSV(csv);
    $('#chInfo').textContent = d.labels.length
      ? t('chart.parsed', { n: d.labels.length, m: d.series.length })
      : t('chart.noData');
    Charts.bindTooltip($('#chPreviewCanvas'), $('#chTip'));
  }

  function initChartEvents() {
    $('#newChartBtn').addEventListener('click', () => { chartInsertMode = false; openChartModal(null); });
    $('#chType').addEventListener('change', drawChartPreview);
    $('#chCsv').addEventListener('input', () => { syncGridFromCsv($('#chCsv').value); drawChartPreview(); });

    // 可视化数据网格：直接点单元格编辑
    $('#chGrid').addEventListener('input', (e) => {
      const cell = e.target.closest('[contenteditable]');
      if (!cell) return;
      const r = parseInt(cell.dataset.r, 10);
      const c = parseInt(cell.dataset.c, 10);
      if (isNaN(r) || isNaN(c) || !gridData[r]) return;
      gridData[r][c] = cell.textContent.trim();
      clearTimeout(gridTimer);
      gridTimer = setTimeout(gridChanged, 150);
    });
    $('#chGrid').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });

    $('#chAddRow').addEventListener('click', () => {
      gridData.push(Array.from({ length: gridData[0].length }, () => ''));
      renderGrid(); gridChanged();
    });
    $('#chAddCol').addEventListener('click', () => {
      const label = (isEn() ? 'Series ' : '系列') + gridData[0].length;
      gridData.forEach((row, i) => row.push(i === 0 ? label : ''));
      renderGrid(); gridChanged();
    });
    $('#chDelRow').addEventListener('click', () => {
      if (gridData.length > 2) { gridData.pop(); renderGrid(); gridChanged(); }
    });
    $('#chDelCol').addEventListener('click', () => {
      if (gridData[0].length > 2) { gridData.forEach((row) => row.pop()); renderGrid(); gridChanged(); }
    });
    $('#chToggleCsv').addEventListener('click', () => {
      const w = $('#chCsvWrap');
      w.hidden = !w.hidden;
      if (!w.hidden) $('#chCsv').value = matrixToCsv(gridData);
    });

    $('#chFile').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (!f) return;
      readText(f).then((txt) => {
        $('#chCsv').value = txt;
        if (!$('#chName').value.trim()) $('#chName').value = f.name.replace(/\.[^.]+$/, '');
        syncGridFromCsv(txt);
        drawChartPreview();
        toast(t('toast.importCsv'));
      });
      e.target.value = '';
    });

    $('#saveChartBtn').addEventListener('click', () => {
      const name = $('#chName').value.trim();
      if (!name) return toast(t('toast.noName'), true);
      const note = $('#chNote').value.trim();
      const csv = gridData.length ? matrixToCsv(gridData) : $('#chCsv').value;

      // 文章编辑里调用：直接插入正文
      if (chartInsertMode) {
        const html = '<div class="md-chart" data-type="' + esc($('#chType').value) + '" data-csv="' +
          encodeURIComponent(csv) + '" data-name="' + esc(name) + '"></div><p><br></p>';
        insertRichHtml(html);
        hydrateCharts($('#postEditor'));
        chartInsertMode = false;
        $('#saveChartBtn').textContent = t('chart.save');
        $('#deleteChartBtn').hidden = true;
        closeModal('chartModal');
        toast(t('chart.inserted'));
        return;
      }

      const data = {
        type: $('#chType').value,
        csv: csv,
        createdAt: today()
      };
      if (isEn()) { data.nameEn = name; data.noteEn = note; if (!editingChartId) { data.name = name; data.note = note; } }
      else { data.name = name; data.note = note; if (!editingChartId) { data.nameEn = name; data.noteEn = note; } }
      if (editingChartId) {
        const c = Store.meta.charts.filter((x) => x.id === editingChartId)[0];
        if (c) Object.assign(c, data);
      } else {
        data.id = uid();
        Store.meta.charts.unshift(data);
      }
      persist();
      renderCharts();
      renderStats();
      closeModal('chartModal');
      toast(t('toast.chartSaved'));
    });

    $('#deleteChartBtn').addEventListener('click', () => {
      if (!editingChartId) return;
      const ch = Store.meta.charts.filter((x) => x.id === editingChartId)[0];
      if (!confirm(t('confirm.chart', { name: ch ? pick(ch.name, ch.nameEn) : '' }))) return;
      Store.meta.charts = Store.meta.charts.filter((c) => c.id !== editingChartId);
      persist();
      renderCharts();
      renderStats();
      closeModal('chartModal');
      toast(t('toast.deleted'));
    });

    $('#chartGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const card = btn.closest('.item');
      const c = Store.meta.charts.filter((x) => x.id === card.dataset.id)[0];
      if (!c) return;
      if (btn.dataset.act === 'edit') openChartModal(c);
      else if (confirm(t('confirm.chart', { name: pick(c.name, c.nameEn) }))) {
        Store.meta.charts = Store.meta.charts.filter((x) => x.id !== c.id);
        persist();
        renderCharts();
        renderStats();
        toast(t('toast.deleted'));
      }
    });
  }

  /* ---------------- 导入 / 导出 ---------------- */
  function initDataEvents() {
    $('#exportBtn').addEventListener('click', () => {
      Store.exportAll().then((json) => {
        download('timding-portfolio-backup-' + today() + '.json', new Blob([json], { type: 'application/json' }));
        toast(t('toast.exported'));
      }).catch(() => toast(t('toast.exportFail'), true));
    });

    $('#importInput').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (!f) return;
      readText(f).then((txt) => {
        return Store.importAll(txt).then(() => {
          renderAll();
          toast(t('toast.restored'));
        });
      }).catch((err) => toast(t('toast.importFail', { msg: (err && err.message) || 'bad format' }), true));
      e.target.value = '';
    });

    $('#copyMailBtn').addEventListener('click', () => {
      const mail = Store.meta.profile.email;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mail).then(() => toast(t('toast.copied'))).catch(() => toast(t('toast.copyFail'), true));
      } else {
        const ta = document.createElement('textarea');
        ta.value = mail; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); toast(t('toast.copied')); } catch (err) { toast(t('toast.copyFail'), true); }
        ta.remove();
      }
    });

    // 窗口尺寸变化时重绘图表
    let t = null;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(renderCharts, 220);
    });
  }

  /* ---------------- 卡片鼠标光效 ---------------- */
  function initCardFx() {
    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest && e.target.closest('.item');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  /* ---------------- 全屏阅读 / 全屏查看 ---------------- */
  function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement || null; }

  function requestFs(el) {
    try {
      const fn = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!fn) return Promise.reject(new Error('nofs'));
      const r = fn.call(el);
      return (r && r.catch) ? r : Promise.resolve();
    } catch (e) { return Promise.reject(e); }
  }

  function exitFs() {
    const fn = document.exitFullscreen || document.webkitExitFullscreen;
    if (fn && fsEl()) {
      try { const r = fn.call(document); return (r && r.catch) ? r : Promise.resolve(); } catch (e) {}
    }
    return Promise.resolve();
  }

  function updateReaderBar() {
    const sc = $('#readerScroll');
    const h = sc.scrollHeight - sc.clientHeight;
    $('#readerBar').style.width = (h > 0 ? (sc.scrollTop / h) * 100 : 0) + '%';
  }

  function syncFsBtn() {
    $('#readerFsBtn').textContent = fsEl() ? t('reader.exit') : t('reader.fullscreen');
  }

  function openReader(id) {
    const p = Store.meta.posts.filter((x) => x.id === id)[0];
    if (!p) return;
    $('#readerTitle').textContent = pick(p.title, p.titleEn);
    const bodyEl = $('#readerBody');
    renderBody(p, bodyEl);

    // 生成目录
    const heads = $$('#readerBody h1, #readerBody h2, #readerBody h3');
    heads.forEach((h, i) => { h.id = 'rh-' + i; });
    $('#readerToc').innerHTML = heads.length
      ? heads.map((h) => {
          const lv = parseInt(h.tagName.slice(1), 10) - 1;
          return '<a href="#" data-h="' + h.id + '" style="padding-left:' + (lv * 12) + 'px">' + esc(h.textContent) + '</a>';
        }).join('')
      : '<span class="muted small">' + esc(t('reader.emptyToc')) + '</span>';
    $('#readerToc').classList.toggle('hidden', window.innerWidth <= 900);

    const savedFont = localStorage.getItem('timding.readerFont');
    bodyEl.style.setProperty('--reader-font', (savedFont || 16.5) + 'px');

    $('#readerOverlay').hidden = false;
    $('#readerScroll').scrollTop = 0;
    updateReaderBar();

    requestFs($('#readerOverlay')).catch(() => {});
    setTimeout(syncFsBtn, 80);
  }

  function closeReader() {
    if ($('#readerOverlay').hidden) return;
    $('#readerOverlay').hidden = true;
    if (fsEl()) exitFs();
    syncFsBtn();
  }

  function toggleReaderFs() {
    if (fsEl()) exitFs();
    else requestFs($('#readerOverlay')).catch(() => {});
    setTimeout(syncFsBtn, 80);
  }

  function openViewer() {
    const w = currentWork();
    if (!w) return;
    $('#viewerName').textContent = pick(w.title, w.titleEn) + ' · ' + w.fileName;
    $('#viewerStage').innerHTML = $('#wvPreview').innerHTML;
    $('#viewerOverlay').hidden = false;
    requestFs($('#viewerOverlay')).catch(() => {});
  }

  function closeViewer() {
    if ($('#viewerOverlay').hidden) return;
    $('#viewerOverlay').hidden = true;
    $('#viewerStage').innerHTML = '';
    if (fsEl()) exitFs();
  }

  function initFullscreen() {
    $('#pvFullBtn').addEventListener('click', () => openReader(viewingPostId));
    $('#wvFullBtn').addEventListener('click', openViewer);
    $('#readerBack').addEventListener('click', closeReader);
    $('#viewerExitBtn').addEventListener('click', closeViewer);
    $('#readerTocBtn').addEventListener('click', () => $('#readerToc').classList.toggle('hidden'));
    $('#readerFsBtn').addEventListener('click', toggleReaderFs);

    const setFont = (delta) => {
      const cur = parseFloat(getComputedStyle($('#readerBody')).fontSize) || 16.5;
      const next = Math.min(28, Math.max(13, cur + delta));
      $('#readerBody').style.setProperty('--reader-font', next + 'px');
      try { localStorage.setItem('timding.readerFont', String(next)); } catch (e) {}
    };
    $('#readerFontDown').addEventListener('click', () => setFont(-1.5));
    $('#readerFontUp').addEventListener('click', () => setFont(1.5));

    $('#readerToc').addEventListener('click', (e) => {
      const a = e.target.closest('a[data-h]');
      if (!a) return;
      e.preventDefault();
      const h = document.getElementById(a.dataset.h);
      if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.innerWidth <= 900) $('#readerToc').classList.add('hidden');
    });

    $('#readerScroll').addEventListener('scroll', updateReaderBar, { passive: true });

    const onFsChange = () => {
      if (!fsEl()) {
        if (!$('#readerOverlay').hidden) $('#readerOverlay').hidden = true;
        if (!$('#viewerOverlay').hidden) { $('#viewerOverlay').hidden = true; $('#viewerStage').innerHTML = ''; }
      }
      syncFsBtn();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
  }

  /* ---------------- 启动 ---------------- */
  function renderAll() {
    renderProfile();
    renderStats();
    renderPosts();
    renderWorks();
    renderCharts();
    $('#footerLine1').textContent = t('footer.line1', { year: new Date().getFullYear() });
  }

  function init() {
    Store.load(SEED);
    I18N.init();
    I18N.apply();
    // 兼容旧备份：把 timeline / skills 从 meta 顶层合并进 profile
    initChrome();
    initParticles();
    initTypewriter();
    initProfileEvents();
    initPostEvents();
    initWorkEvents();
    initChartEvents();
    initDataEvents();
    initFullscreen();
    initCardFx();
    renderAll();

    // 首次打开（本地无任何数据）时，自动载入 assets/data/seed.json 的预设内容
    Store.loadSeedIfEmpty().then((ok) => {
      if (ok) { renderAll(); toast(t('toast.seedLoaded')); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

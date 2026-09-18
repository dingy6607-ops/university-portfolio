# 丁一铭 Tim Ding · 个人博客 & 作品集
# Tim Ding (丁一铭) · Personal Blog & Portfolio

> **中**：一个用原生 HTML / CSS / JavaScript 从零手写的个人静态站 —— 博客 + 作品集 + 数据可视化。零框架、零第三方库、零后端。
> **EN**: A personal static site — blog + portfolio + data visualisation — hand-written with plain HTML / CSS / JavaScript. No frameworks, no libraries, no backend.

---

> ⚠️ **重要提示 / Important**
>
> **中**：如果您直接解压压缩包，请双击 **`启动本地服务器.bat`** 以查看预设数据，避免因为浏览器跨域（CORS）限制导致 JSON 文件加载失败。
> **EN**: If you simply unzip the archive, please double-click **`启动本地服务器.bat`** to view the preset data — opening `index.html` directly may fail to load the JSON because of the browser's CORS restriction.

---

## 一、快速开始 / Getting Started

| 方式 / Method | 操作 / How | 说明 / Notes |
| --- | --- | --- |
| 推荐 / Recommended | 双击 `启动本地服务器.bat` / Double-click `启动本地服务器.bat` | 打开 http://localhost:8000，可正常加载预设数据 / Opens http://localhost:8000 and loads preset data correctly |
| 直接 / Quick | 双击 `index.html` / Double-click `index.html` | 可打开，但 `file://` 下浏览器会拦截 `seed.json`（CORS），看不到预设内容 / Opens fine, but under `file://` the browser blocks `seed.json`, so preset content is missing |
| 英文版 / English site | 打开 `index.html?lang=en` / Open `index.html?lang=en` | 或点右上角 `EN / 中` / Or click `EN / 中` in the top-right corner |

---

## 二、打包成课程作业：生成预设数据 seed.json
## Packaging as coursework: generating seed.json

> **中**：站点的数据保存在浏览器本地，换一台电脑打开默认是空的。若要把它作为进度性作业提交，需要把当前内容导出为 `assets/data/seed.json`，老师首次打开时会自动载入。
> **EN**: Data lives in the browser's local storage, so another machine shows an empty site by default. For submission, export your content to `assets/data/seed.json`; it is loaded automatically on first open.

### 步骤 1：导出你当前的数据 / Step 1 — export your data

**方法 A（最简单 / easiest）**：打开站点 → 点右上角 **「导出 / Export」** → 得到 `timding-portfolio-backup-日期.json` → 重命名为 **`seed.json`**。

**方法 B（控制台 / console）**：在站点页面按 `F12` → Console，粘贴并回车：

```js
(async () => {
  const json = await Store.exportAll();
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'seed.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
})();
```

### 步骤 2：放进项目 / Step 2 — place the file

把 `seed.json` 覆盖到：

```
TimDing-Portfolio/assets/data/seed.json
```

### 步骤 3：验证 / Step 3 — verify

- **中**：换一个浏览器（或清除站点数据）后重新打开，应能看到你的文章、作品、图表与图片，并弹出「已载入课程预设数据」提示。
- **EN**: Open the site in another browser (or after clearing site data) — your posts, works, charts and images should appear, with a "Preset course data loaded" toast.

### 文件说明 / File format

```json
{
  "version": 1,
  "generatedAt": "2026-09-18",
  "meta": { "profile": { }, "posts": [ ], "works": [ ], "charts": [ ] },
  "files": { "文件ID": { "name": "a.png", "type": "image/png", "size": 12345, "b64": "..." } }
}
```

- **中**：`meta` 是全部文本数据（资料、文章、作品信息、图表配置）；`files` 是上传的图片与作品文件（base64）。
- **EN**: `meta` holds all text data (profile, posts, work metadata, chart configs); `files` holds uploaded images and work files (base64).

### 载入规则 / Loading rules

- **中**：仅当浏览器**本地完全没有数据**时才载入 `seed.json`；载入后数据写入本地，此后老师的编辑不会再次被覆盖。
- **EN**: `seed.json` is loaded **only when the browser has no local data at all**. After that it is written locally, so later edits are never overwritten.

### 注意事项 / Notes

- **中**：图片以 base64 存进 JSON，建议把单个文件控制在几十 MB 内（`seed.json` 最好 < 30MB），否则首次加载会变慢。
- **EN**: Images are stored as base64; keep `seed.json` ideally under 30 MB, otherwise the first load becomes slow.
- **中**：如果 `seed.json` 缺失或是占位文件，站点会回退到内置示例内容，不会报错。
- **EN**: If `seed.json` is missing or only a placeholder, the site falls back to its built-in sample content without errors.

---

## 三、功能一览 / Features

### 首页 / Home
- **中**：粒子星空背景（鼠标互动）、渐变标题、打字机自述、四项数据统计
- **EN**: Interactive particle starfield, gradient title, typewriter intro, four live counters

### 关于我 / About Me
- **中**：头像、自我介绍、技能条、时间线、社交链接，均可直接在页面编辑，中英内容分开保存
- **EN**: Avatar, bio, skill bars, timeline, social links — editable in place; Chinese and English kept separately

### 文章 / Blog
- **中**：Word 式富文本编辑器（标题、加粗斜体下划线、列表、引用、代码块、对齐、链接、清除格式、撤销重做）
- **EN**: Word-like rich text editor (headings, bold/italic/underline, lists, quotes, code blocks, alignment, links, clear formatting, undo/redo)
- **中**：插入图片（选择 / 粘贴 / 拖拽）、表格、图表；标签筛选与搜索；全屏阅读（目录、字号、进度条）
- **EN**: Insert images (picker / paste / drag), tables and charts; tag filter & search; full-screen reading (contents, font size, progress)

### 作品集 / Portfolio
- **中**：拖拽上传任意文件（图片 / PDF / PPT / Excel / CSV / 压缩包），在线预览、下载、全屏查看
- **EN**: Drag & drop any file (images / PDF / PPT / Excel / CSV / archives), preview, download, full-screen view

### 数据图表 / Data Charts
- **中**：可视化数据网格，填表即出图；折线 / 柱状 / 饼图 / 散点，带动画与悬浮提示；可插入文章
- **EN**: Visual data grid — type and the chart redraws; line / bar / pie / scatter with animation and tooltips; insertable into posts

### 其他 / Extras
- **中**：中英切换（幕布动画）、深浅色主题、导出 / 导入备份、邮箱一键复制
- **EN**: CN ⇄ EN switch (curtain animation), dark / light theme, export / import backup, copy email

---

## 四、目录结构 / Project Structure

```
TimDing-Portfolio/
├─ index.html                 页面骨架 / Page skeleton
├─ 启动本地服务器.bat           一键本地服务 / Local server launcher
├─ README.md                  本说明 / This file
└─ assets/
   ├─ data/
   │   └─ seed.json           作业预设数据 / Preset data for submission
   ├─ css/
   │   └─ style.css           样式与动画 / Styles & animations
   └─ js/
       ├─ store.js            存储层（IndexedDB → localStorage → 内存）/ Storage layer
       ├─ i18n.js             中英语言包 / CN / EN language pack
       ├─ markdown.js         Markdown 解析器 / Markdown parser
       ├─ charts.js           Canvas 图表引擎 / Canvas chart engine
       └─ app.js              业务逻辑 / Business logic
```

---

## 五、技术实现 / Under the Hood

| 模块 / Module | 做法 / Approach |
| --- | --- |
| 存储 / Storage | 元数据写 localStorage；文件优先 IndexedDB，回退 localStorage(base64)，再回退内存 / Metadata in localStorage; files to IndexedDB, fallback base64, then memory |
| 预设数据 / Preset | 首次打开且本地为空时 `fetch('assets/data/seed.json')` 自动载入 / On first open with no local data, `fetch('assets/data/seed.json')` loads automatically |
| 图表 / Charts | 自研 Canvas 引擎：CSV 解析、刻度算法、高 DPI、缓动动画、Tooltip / Custom Canvas engine with CSV parsing, ticks, HiDPI, easing, tooltip |
| 双语 / i18n | `data-i18n` 系列属性 + `I18N.t()`，语言持久化 / Attribute-based translation plus `I18N.t()`; persisted |
| 富文本 / Rich text | `contenteditable` + `execCommand`，保存前清洗 / `contenteditable` + `execCommand`, sanitised before saving |

---

## 六、数据安全 / Data & Privacy

- **中**：全程无网络请求，数据只在本机；建议定期「导出」备份。
- **EN**: No network requests; everything is local. Export a backup regularly.

---

## 七、个人信息 / About the Author

- 姓名 / Name：丁一铭 / Tim Ding
- 专业 / Major：人工智能 · 大一在读 / Artificial Intelligence · Freshman
- 邮箱 / Email：dym18019215657@outlook.com

---

© 2026 丁一铭 Tim Ding · 用 HTML / CSS / JavaScript 手工搭建 / Hand-built with HTML / CSS / JavaScript

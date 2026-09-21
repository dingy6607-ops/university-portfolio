/* ============================================================
   I18N —— 中 / 英 双语支持
   用法：元素上加 data-i18n="key" / data-i18n-html / data-i18n-ph / data-i18n-title
        脚本中用 I18N.t('key', {name:'…'})、I18N.pick(zhValue, enValue)
   ============================================================ */
(function (global) {
  'use strict';

  var KEY = 'timding.lang';

  var zh = {
    'nav.home': '首页', 'nav.about': '关于', 'nav.blog': '文章', 'nav.works': '作品',
    'nav.charts': '数据', 'nav.contact': '联系',
    'btn.theme': '切换深浅色', 'btn.lang': 'EN', 'btn.export': '导出', 'btn.import': '导入',
    'btn.upload': '上传作品', 'btn.cancel': '取消', 'btn.save': '保存', 'btn.delete': '删除',
    'btn.edit': '编辑', 'btn.download': '下载文件', 'btn.close': '关闭', 'btn.chooseImage': '选择图片',

    'hero.eyebrow': '{role} · 正在探索机器学习的世界',
    'hero.type': '我是一名',
    'hero.viewWorks': '浏览作品集', 'hero.readPosts': '读我的文章', 'hero.editProfile': '✎ 编辑资料',
    'stat.posts': '文章', 'stat.works': '作品', 'stat.charts': '图表', 'stat.skills': '技能',
    'hero.scroll': '向下滚动',

    'about.title': '关于我',
    'about.skills': '技能图谱', 'about.skillsHint': '进度可自行调整',
    'about.timeline': '成长时间线', 'about.timelineHint': '按时间倒序',

    'blog.title': '文章',
    'blog.sub': '课程笔记、读书报告与技术复盘，支持 Markdown 写作与 .md / .txt 导入。',
    'blog.new': '写文章', 'blog.import': '导入 .md / .txt',
    'blog.search': '搜索标题 / 标签 / 正文…', 'blog.all': '全部',
    'blog.minutes': '约 {n} 分钟',
    'blog.empty': '还没有文章，点击「写文章」或导入 Markdown 文件开始吧。',
    'blog.emptyFiltered': '没有匹配的文章，换个关键词试试。',
    'blog.editThis': '编辑这篇文章',

    'works.title': '作品集',
    'works.sub': '上传图片、PDF、PPT、Excel、CSV、代码压缩包等任意文件，本地保存并可直接预览。',
    'works.upload': '上传作品',
    'works.dragTitle': '把文件拖到这里',
    'works.dragSub': '或点击选择文件 —— 支持图片 / PDF / PPT / Excel / CSV / 压缩包，可多选',
    'works.search': '搜索作品 / 标签 / 文件名…',
    'works.empty': '作品库还是空的，上传第一个作品吧。',
    'works.emptyFiltered': '没有匹配的作品，换个关键词试试。',
    'works.noPreview': '该类型暂不支持在线预览，可点击「下载文件」在本地打开（PPT / Excel 推荐用 Office 或 WPS 打开）。',
    'works.fileLost': '文件数据不可用（可能来自其他浏览器），仅保留信息记录。',
    'works.reading': '正在读取文件…',
    'works.editInfo': '编辑信息',

    'charts.title': '数据图表',
    'charts.sub': '上传 CSV 或手动录入数据，自动生成折线图、柱状图、饼图与散点图。',
    'charts.new': '新建图表',
    'charts.empty': '还没有图表，点击「新建图表」或上传 CSV 数据试试。',
    'charts.note': '备注',
    'type.line': '折线图', 'type.bar': '柱状图', 'type.pie': '饼图', 'type.scatter': '散点图',

    'contact.title': '联系我',
    'contact.sub': '无论是课程合作、技术交流，还是只想聊聊 AI，都欢迎给我发邮件。',
    'contact.copy': '复制邮箱',

    'footer.line1': '© {year} 丁一铭 Tim Ding · 域名由 DigitalPlat Domain 注册，DNS & CDN 托管于 Cloudflare',

    'cat.图片': '图片', 'cat.PPT': 'PPT / 演示', 'cat.文档': '文档 / PDF',
    'cat.数据表': '数据表 / CSV', 'cat.代码': '代码 / 压缩包', 'cat.其他': '其他',

    'profile.title': '编辑个人资料',
    'profile.name': '中文名', 'profile.enName': '英文名',
    'profile.role': '专业 / 年级', 'profile.email': '邮箱',
    'profile.tagline': '首页一句话标签', 'profile.hero': '首页简介',
    'profile.avatar': '头像', 'profile.bio': '自我介绍（支持 Markdown）',
    'profile.skills': '技能（每行一条：名称,分值）',
    'profile.timeline': '时间线（每行一条：时间 | 标题 | 描述）',
    'profile.socials': '社交链接（每行一条：名称 | 网址）',
    'profile.save': '保存资料',

    'post.new': '写文章', 'post.edit': '编辑文章',
    'post.title': '标题', 'post.titlePh': '例如：线性回归手记',
    'post.date': '日期', 'post.tags': '标签（逗号分隔）', 'post.tagsPh': '机器学习, 课程笔记',
    'post.summary': '摘要', 'post.summaryPh': '一句话概括这篇文章',
    'post.tabEdit': '编辑（Markdown）', 'post.tabPreview': '预览',
    'post.import': '导入文件', 'post.save': '保存文章',
    'post.bodyPh': '# 标题\n\n正文支持 Markdown：**加粗**、`代码`、列表、表格、> 引用',
    'post.enHint': '（当前为英文版：此处编辑的内容将显示在英文站）',
    'post.zhHint': '（当前为中文版：此处编辑的内容将显示在中文站）',

    'up.title': '上传作品',
    'up.category': '分类', 'up.tags': '标签（逗号分隔，统一）', 'up.tagsPh': '课程作业, Python',
    'up.titlePh': '作品标题', 'up.descPh': '一句话描述（可选）',
    'up.hint': '提示：大文件建议控制在几十 MB 内；数据会保存在本机浏览器中。',
    'up.save': '保存到作品集',

    'chart.new': '新建图表', 'chart.edit': '编辑图表',
    'chart.name': '图表名称', 'chart.namePh': '每周学习时长',
    'chart.type': '类型',
    'chart.csv': '数据（CSV 格式：第一行为表头，第一列是横轴标签）',
    'chart.csvPh': '周次,学习时长,刷题数\nW1,6,3\nW2,8,5',
    'chart.uploadCsv': '上传 CSV', 'chart.notePh': '备注（可选）',
    'chart.save': '保存图表', 'chart.parsed': '已解析 {n} 行 · {m} 组数据',
    'chart.noData': '暂无有效数据', 'chart.placeholder': '暂无数据，请输入或上传 CSV',

    'toast.saved': '已保存', 'toast.postSaved': '文章已保存', 'toast.chartSaved': '图表已保存',
    'toast.seedLoaded': '已载入课程预设数据',
    'toast.cloudLoaded': '已从云端载入最新内容',
    'toast.remoteUpdated': '已更新到云端最新内容',
    'toast.cloudSaved': '已同步到云端',
    'toast.cloudFail': '云端同步失败',
    'toast.deleted': '已删除', 'toast.updated': '已更新', 'toast.profileSaved': '资料已更新',
    'toast.imported': '已导入 {n} 篇文章', 'toast.importPost': '已导入 {name}',
    'toast.importCsv': '已导入 CSV', 'toast.exported': '备份已导出',
    'toast.copied': '邮箱已复制', 'toast.copyFail': '复制失败',
    'toast.noTitle': '请填写标题', 'toast.noName': '请填写图表名称',
    'toast.storageFull': '本地存储空间不足，部分内容可能未能保存',
    'toast.readFail': '读取失败：{name}', 'toast.saveFail': '保存失败：{name}',
    'toast.avatarFail': '头像读取失败', 'toast.importFail': '导入失败：{msg}',
    'toast.exportFail': '导出失败', 'toast.restored': '数据已恢复',
    'toast.worksSaved': '已保存 {n} 个作品{tip}',
    'toast.bigFile': '（有超大文件，建议压缩后再传）',
    'confirm.post': '确定删除这篇文章？',
    'confirm.work': '确定删除作品「{name}」？此操作会同时删除已保存的文件。',
    'confirm.chart': '确定删除图表「{name}」？',

    'editor.h2': '二级标题', 'editor.bold': '加粗', 'editor.italic': '斜体',
    'editor.code': '行内代码', 'editor.codeblock': '代码块', 'editor.quote': '引用',
    'editor.list': '无序列表', 'editor.link': '链接', 'editor.hr': '分割线',
    'editor.image': '插入图片', 'editor.table': '插入表格',
    'editor.cols': '列数', 'editor.rows': '行数', 'editor.insert': '插入',
    'editor.tip': '支持直接粘贴或拖拽图片到编辑区',
    'editor.underline': '下划线', 'editor.strike': '删除线', 'editor.h3': '三级标题',
    'editor.body': '正文', 'editor.ordered': '有序列表',
    'editor.alignLeft': '左对齐', 'editor.alignCenter': '居中', 'editor.alignRight': '右对齐',
    'editor.clear': '清除格式', 'editor.undo': '撤销', 'editor.redo': '重做',
    'editor.chart': '插入图表', 'editor.insertChart': '插入到文章',
    'editor.words': '{n} 字',
    'editor.placeholder': '在此输入正文…支持直接粘贴 Word / 网页内容，图片可拖拽或粘贴',
    'editor.mdConverted': '这篇旧文章是 Markdown 格式，已自动转成富文本，保存后生效',
    'chart.dataGrid': '数据表（可直接点击单元格编辑）',
    'chart.addRow': '＋ 行', 'chart.addCol': '＋ 列',
    'chart.delRow': '－ 行', 'chart.delCol': '－ 列',
    'chart.toggleCsv': 'CSV 源码',
    'chart.inserted': '图表已插入文章',
    'editor.imgInserted': '已插入 {n} 张图片', 'editor.imgFail': '图片插入失败',
    'editor.imgMissing': '图片已丢失',
    'notice.link': '使用须知', 'notice.title': '使用须知',
    'notice.about': '关于本站',
    'notice.aboutText': '这里是丁一铭（Tim Ding）的个人博客与作品集，用于记录学习过程、展示课程作品与数据分析实践，同时作为课程作业提交。',
    'notice.browse': '浏览与编辑',
    'notice.browseText': '站点默认为访客只读模式：编辑资料、写文章、上传作品、新建图表、导出与导入等功能仅作者可见。访客可以浏览文章、全屏阅读、预览与下载作品文件，不能修改任何内容。',
    'notice.data': '数据与隐私',
    'notice.dataText': '本站是纯静态站点，不收集、不上传任何个人信息；文章内容与上传的文件只保存在访问者自己的浏览器本地，不会传输到任何服务器。清除浏览器站点数据即可删除全部本地内容。',
    'notice.copy': '内容与版权',
    'notice.copyText': '站内文章、图表与作品（引用已注明出处的除外）均为作者原创，版权归作者所有。转载、引用或用于其他用途，请先联系作者获得授权。',
    'notice.tech': '技术说明',
    'notice.techText': '本站由原生 HTML / CSS / JavaScript 手工编写，未使用第三方框架；域名由 DigitalPlat Domain 注册，DNS 与 CDN 托管于 Cloudflare。',
    'notice.contact': '联系作者',
    'notice.contactText': '邮箱：dym18019215657@outlook.com。欢迎交流课程合作、技术问题或任何想法，也欢迎指出站点的不足之处。',
    'gate.title': '请确认你是真人',
    'gate.desc': '进入前需要完成一次人机验证，通过后 24 小时内无需再次验证。',
    'gate.descEn': 'Human check required before entering. Valid for 24 hours.',
    'gate.entering': '验证通过，正在进入…',
    'gate.err': '验证未完成，请重试',
    'gate.fail': '验证组件加载失败，已直接放行',
    'author.readonly': '只读模式（访客）', 'author.editable': '作者模式（可编辑）',
    'author.title': '作者解锁',
    'author.pwd': '编辑密码', 'author.pwdPh': '请输入编辑密码',
    'author.unlockBtn': '解锁编辑', 'author.lockBtn': '锁定为只读',
    'author.newPwd': '修改密码（留空则不改）',
    'author.tip': '当前是访客只读模式，页面内容不可修改；作者输入密码后可编辑。',
    'author.tipOn': '作者模式已开启，所有编辑功能可用；离开时记得点「锁定为只读」。',
    'author.wrongPwd': '密码不正确',
    'sync.title': '云端同步（GitHub）',
    'sync.token': 'GitHub Token（PAT）', 'sync.tokenPh': 'github_pat_xxx / ghp_xxx',
    'sync.owner': '仓库所有者', 'sync.repo': '仓库名', 'sync.branch': '分支', 'sync.path': '文件路径',
    'sync.tip': 'Token 只保存在你本机浏览器，不会写入代码、也不会随数据导出；建议使用仅含 Contents 读写权限的 Fine-grained Token。',
    'sync.saveCfg': '保存配置', 'sync.cfgSaved': '配置已保存（仅存本机）',
    'sync.now': '一键同步到 GitHub', 'sync.syncing': '同步中…',
    'sync.ok': '数据已成功同步至 GitHub！CDN 节点将在 1~3 分钟内更新。',
    'sync.fail': '同步失败', 'sync.noToken': '请先填写 GitHub Token 并保存',
    'sync.fallback': '仍可用「导出」手动上传 seed.json',
    'sync.localSync': '（本地 index.html 与 seed.json 已同步更新）',
    'sync.localWrite': '写入本地 seed.json', 'sync.localOk': '本地 seed.json 已更新',
    'sync.localFail': '写入失败，请检查文件夹授权', 'sync.localNeedBind': '请先点右上角 🔄 绑定项目文件夹',
    'author.unlocked': '已进入作者模式，可以编辑了',
    'author.cloudUnlocked': '登录成功，云端同步已开启',
    'author.locked': '已锁定，访客只能浏览',
    'author.pwdSaved': '密码已更新',
    'toast.locked': '访客只读模式，无法修改',
    'seed.title': '自动同步 seed.json',
    'seed.bind': '绑定项目文件夹', 'seed.unbind': '已取消绑定',
    'seed.bound': '已绑定：以后保存内容会自动写入 seed.json',
    'seed.synced': 'seed.json 已自动更新',
    'seed.noSupport': '当前浏览器不支持自动写入文件，请用 Chrome / Edge 并通过本地服务器打开',
    'seed.denied': '未获得写入授权，未启用自动同步',
    'seed.askUnbind': '已绑定项目文件夹，要取消绑定吗？',
    'seed.tip': '选择 TimDing-Portfolio 文件夹并允许写入后，每次保存文章 / 上传作品都会自动更新 assets/data/seed.json',
    'btn.back': '返回',
    'reader.fullscreen': '全屏阅读', 'reader.exit': '退出全屏', 'reader.toc': '目录',
    'reader.fontDown': '缩小字号', 'reader.fontUp': '放大字号',
    'reader.emptyToc': '本文还没有小标题',
    'viewer.fullscreen': '全屏查看', 'viewer.exit': '退出全屏',
    'viewer.unsupported': '浏览器不支持全屏接口，已使用页面内全屏查看',

    'words': '人工智能专业的大一学生|喜欢动手复现算法的人|正在苦练数学与代码的菜鸟|想把数据讲成故事的人'
  };

  var en = {
    'nav.home': 'Home', 'nav.about': 'About', 'nav.blog': 'Blog', 'nav.works': 'Works',
    'nav.charts': 'Data', 'nav.contact': 'Contact',
    'btn.theme': 'Toggle dark / light', 'btn.lang': '中', 'btn.export': 'Export', 'btn.import': 'Import',
    'btn.upload': 'Upload', 'btn.cancel': 'Cancel', 'btn.save': 'Save', 'btn.delete': 'Delete',
    'btn.edit': 'Edit', 'btn.download': 'Download', 'btn.close': 'Close', 'btn.chooseImage': 'Choose image',

    'hero.eyebrow': '{role} · Exploring the world of machine learning',
    'hero.type': 'I am',
    'hero.viewWorks': 'View My Work', 'hero.readPosts': 'Read My Blog', 'hero.editProfile': '✎ Edit Profile',
    'stat.posts': 'Posts', 'stat.works': 'Works', 'stat.charts': 'Charts', 'stat.skills': 'Skills',
    'hero.scroll': 'Scroll down',

    'about.title': 'About Me',
    'about.skills': 'Skills', 'about.skillsHint': 'Levels can be adjusted anytime',
    'about.timeline': 'Timeline', 'about.timelineHint': 'Newest first',

    'blog.title': 'Blog',
    'blog.sub': 'Course notes, reading reports and technical retrospectives — Markdown friendly.',
    'blog.new': 'New Post', 'blog.import': 'Import .md / .txt',
    'blog.search': 'Search title / tag / content…', 'blog.all': 'All',
    'blog.minutes': '{n} min read',
    'blog.empty': 'No posts yet — click "New Post" or import a Markdown file.',
    'blog.emptyFiltered': 'Nothing matched. Try another keyword.',
    'blog.editThis': 'Edit this post',

    'works.title': 'Portfolio',
    'works.sub': 'Upload images, PDFs, slides, spreadsheets, CSVs, code archives — saved locally and previewable.',
    'works.upload': 'Upload',
    'works.dragTitle': 'Drop your files here',
    'works.dragSub': 'or click to select — images / PDF / PPT / Excel / CSV / archives, multiple allowed',
    'works.search': 'Search work / tag / file name…',
    'works.empty': 'Nothing here yet — upload your first piece of work.',
    'works.emptyFiltered': 'Nothing matched. Try another keyword.',
    'works.noPreview': 'Online preview is not available for this file type — use "Download" and open it locally (PPT / Excel: Office or WPS).',
    'works.fileLost': 'File data is unavailable (it may come from another browser). Only the record is kept.',
    'works.reading': 'Loading file…',
    'works.editInfo': 'Edit Info',

    'charts.title': 'Data Charts',
    'charts.sub': 'Upload a CSV or type data manually to render line, bar, pie and scatter charts.',
    'charts.new': 'New Chart',
    'charts.empty': 'No charts yet — click "New Chart" or upload a CSV.',
    'charts.note': 'Note',
    'type.line': 'Line', 'type.bar': 'Bar', 'type.pie': 'Pie', 'type.scatter': 'Scatter',

    'contact.title': 'Get in Touch',
    'contact.sub': 'Course collaboration, tech talks, or just chatting about AI — my inbox is open.',
    'contact.copy': 'Copy Email',

    'footer.line1': '© {year} Tim Ding (丁一铭) · Domain registered by DigitalPlat Domain; DNS & CDN hosted on Cloudflare',

    'cat.图片': 'Image', 'cat.PPT': 'Slides / PPT', 'cat.文档': 'Docs / PDF',
    'cat.数据表': 'Data / CSV', 'cat.代码': 'Code / Archive', 'cat.其他': 'Other',

    'profile.title': 'Edit Profile',
    'profile.name': 'Name (Chinese)', 'profile.enName': 'Name (English)',
    'profile.role': 'Major / Year', 'profile.email': 'Email',
    'profile.tagline': 'One-line tagline', 'profile.hero': 'Hero introduction',
    'profile.avatar': 'Avatar', 'profile.bio': 'About me (Markdown supported)',
    'profile.skills': 'Skills (one per line: name,level)',
    'profile.timeline': 'Timeline (one per line: date | title | description)',
    'profile.socials': 'Links (one per line: label | url)',
    'profile.save': 'Save Profile',

    'post.new': 'New Post', 'post.edit': 'Edit Post',
    'post.title': 'Title', 'post.titlePh': 'e.g. Notes on Linear Regression',
    'post.date': 'Date', 'post.tags': 'Tags (comma separated)', 'post.tagsPh': 'machine learning, notes',
    'post.summary': 'Summary', 'post.summaryPh': 'One sentence about this post',
    'post.tabEdit': 'Edit (Markdown)', 'post.tabPreview': 'Preview',
    'post.import': 'Import file', 'post.save': 'Save Post',
    'post.bodyPh': '# Title\n\nMarkdown supported: **bold**, `code`, lists, tables, > quotes',
    'post.enHint': '(English site: what you edit here shows on the English version)',
    'post.zhHint': '(Chinese site: what you edit here shows on the Chinese version)',

    'up.title': 'Upload Work',
    'up.category': 'Category', 'up.tags': 'Tags (comma separated, shared)', 'up.tagsPh': 'coursework, Python',
    'up.titlePh': 'Title', 'up.descPh': 'One-line description (optional)',
    'up.hint': 'Tip: keep single files within a few dozen MB; data stays in your own browser.',
    'up.save': 'Save to Portfolio',

    'chart.new': 'New Chart', 'chart.edit': 'Edit Chart',
    'chart.name': 'Chart name', 'chart.namePh': 'Weekly study hours',
    'chart.type': 'Type',
    'chart.csv': 'Data (CSV: first row is the header, first column is the x label)',
    'chart.csvPh': 'week,hours,problems\nW1,6,3\nW2,8,5',
    'chart.uploadCsv': 'Upload CSV', 'chart.notePh': 'Note (optional)',
    'chart.save': 'Save Chart', 'chart.parsed': '{n} rows · {m} series parsed',
    'chart.noData': 'No valid data yet', 'chart.placeholder': 'No data yet — type or upload a CSV',

    'toast.saved': 'Saved', 'toast.postSaved': 'Post saved', 'toast.chartSaved': 'Chart saved',
    'toast.seedLoaded': 'Preset course data loaded',
    'toast.cloudLoaded': 'Loaded latest content from the cloud',
    'toast.remoteUpdated': 'Updated to the latest cloud content',
    'toast.cloudSaved': 'Synced to the cloud',
    'toast.cloudFail': 'Cloud sync failed',
    'toast.deleted': 'Deleted', 'toast.updated': 'Updated', 'toast.profileSaved': 'Profile updated',
    'toast.imported': '{n} post(s) imported', 'toast.importPost': 'Imported {name}',
    'toast.importCsv': 'CSV imported', 'toast.exported': 'Backup exported',
    'toast.copied': 'Email copied', 'toast.copyFail': 'Copy failed',
    'toast.noTitle': 'Please enter a title', 'toast.noName': 'Please enter a chart name',
    'toast.storageFull': 'Local storage is full — something may not have been saved',
    'toast.readFail': 'Failed to read: {name}', 'toast.saveFail': 'Failed to save: {name}',
    'toast.avatarFail': 'Could not read the avatar', 'toast.importFail': 'Import failed: {msg}',
    'toast.exportFail': 'Export failed', 'toast.restored': 'Data restored',
    'toast.worksSaved': '{n} work(s) saved{tip}',
    'toast.bigFile': ' (some files are very large, compress them first)',
    'confirm.post': 'Delete this post?',
    'confirm.work': 'Delete "{name}"? The stored file will be removed as well.',
    'confirm.chart': 'Delete chart "{name}"?',

    'editor.h2': 'Heading', 'editor.bold': 'Bold', 'editor.italic': 'Italic',
    'editor.code': 'Inline code', 'editor.codeblock': 'Code block', 'editor.quote': 'Quote',
    'editor.list': 'Bullet list', 'editor.link': 'Link', 'editor.hr': 'Divider',
    'editor.image': 'Insert Image', 'editor.table': 'Insert Table',
    'editor.cols': 'Columns', 'editor.rows': 'Rows', 'editor.insert': 'Insert',
    'editor.tip': 'You can also paste or drag images into the editor',
    'editor.underline': 'Underline', 'editor.strike': 'Strikethrough', 'editor.h3': 'Heading 3',
    'editor.body': 'Body text', 'editor.ordered': 'Numbered list',
    'editor.alignLeft': 'Align left', 'editor.alignCenter': 'Center', 'editor.alignRight': 'Align right',
    'editor.clear': 'Clear formatting', 'editor.undo': 'Undo', 'editor.redo': 'Redo',
    'editor.chart': 'Insert Chart', 'editor.insertChart': 'Insert into post',
    'editor.words': '{n} characters',
    'editor.placeholder': 'Start writing… paste from Word or web pages, drag or paste images',
    'editor.mdConverted': 'This legacy post was Markdown — auto-converted to rich text, save to apply',
    'chart.dataGrid': 'Data table (click any cell to edit)',
    'chart.addRow': '＋ row', 'chart.addCol': '＋ col',
    'chart.delRow': '－ row', 'chart.delCol': '－ col',
    'chart.toggleCsv': 'CSV source',
    'chart.inserted': 'Chart inserted into the post',
    'editor.imgInserted': '{n} image(s) inserted', 'editor.imgFail': 'Failed to insert image',
    'editor.imgMissing': 'Image missing',
    'notice.link': 'Terms of Use', 'notice.title': 'Terms of Use',
    'notice.about': 'About this site',
    'notice.aboutText': 'This is the personal blog and portfolio of Tim Ding (丁一铭), built to document my learning, showcase coursework and data-analysis practice, and submitted as a course project.',
    'notice.browse': 'Browsing & editing',
    'notice.browseText': 'The site is read-only for visitors by default: editing the profile, writing posts, uploading works, creating charts, and import/export are visible to the author only. Visitors can read posts, use full-screen reading, preview and download files — but cannot modify anything.',
    'notice.data': 'Data & privacy',
    'notice.dataText': 'This is a purely static site. It collects and uploads nothing. Posts and uploaded files stay in the visitor\'s own browser and are never sent to any server. Clearing the browser site data removes all local content.',
    'notice.copy': 'Content & copyright',
    'notice.copyText': 'All posts, charts and works on this site are original and belong to the author, except where sources are credited. Please contact the author before reprinting, quoting or using them elsewhere.',
    'notice.tech': 'Technical notes',
    'notice.techText': 'Hand-written with plain HTML / CSS / JavaScript — no third-party frameworks. The domain is registered via DigitalPlat Domain; DNS and CDN are hosted on Cloudflare.',
    'notice.contact': 'Contact the author',
    'notice.contactText': 'Email: dym18019215657@outlook.com. Feel free to reach out about coursework, technical topics, or any feedback on this site.',
    'gate.title': 'Verify you are human',
    'gate.desc': 'A quick human check before entering.',
    'gate.descEn': 'Valid for 24 hours once verified.',
    'gate.entering': 'Verified — entering…',
    'gate.err': 'Verification incomplete, please retry',
    'gate.fail': 'Verification unavailable — entering directly',
    'author.readonly': 'Read-only (visitor)', 'author.editable': 'Author mode (editable)',
    'author.title': 'Author Unlock',
    'author.pwd': 'Edit password', 'author.pwdPh': 'Enter the edit password',
    'author.unlockBtn': 'Unlock editing', 'author.lockBtn': 'Lock to read-only',
    'author.newPwd': 'Change password (leave blank to keep)',
    'author.tip': 'Read-only mode: visitors cannot modify anything. The author can unlock with a password.',
    'author.tipOn': 'Author mode is on — all editing tools are available. Remember to lock before you leave.',
    'author.wrongPwd': 'Incorrect password',
    'sync.title': 'Cloud sync (GitHub)',
    'sync.token': 'GitHub token (PAT)', 'sync.tokenPh': 'github_pat_xxx / ghp_xxx',
    'sync.owner': 'Owner', 'sync.repo': 'Repo', 'sync.branch': 'Branch', 'sync.path': 'File path',
    'sync.tip': 'The token is stored only in your own browser — never in the code and never exported. Use a fine-grained token with Contents read/write only.',
    'sync.saveCfg': 'Save config', 'sync.cfgSaved': 'Config saved (local only)',
    'sync.now': 'Sync to GitHub', 'sync.syncing': 'Syncing…',
    'sync.ok': 'Synced to GitHub! The CDN refreshes in 1–3 minutes.',
    'sync.fail': 'Sync failed', 'sync.noToken': 'Enter and save your GitHub token first',
    'sync.fallback': 'You can still export seed.json and upload it manually',
    'sync.localSync': ' (local index.html & seed.json updated too)',
    'sync.localWrite': 'Write local seed.json', 'sync.localOk': 'Local seed.json updated',
    'sync.localFail': 'Failed to write — check the folder permission', 'sync.localNeedBind': 'Bind the project folder with 🔄 first',
    'author.unlocked': 'Author mode enabled — you can edit now',
    'author.cloudUnlocked': 'Signed in — cloud sync is on',
    'author.locked': 'Locked — visitors can only browse',
    'author.pwdSaved': 'Password updated',
    'toast.locked': 'Read-only mode — changes are not allowed',
    'seed.title': 'Auto-sync seed.json',
    'seed.bind': 'Bind project folder', 'seed.unbind': 'Unbound',
    'seed.bound': 'Bound — content changes will auto-write seed.json',
    'seed.synced': 'seed.json updated automatically',
    'seed.noSupport': 'Auto-write is unsupported here; use Chrome / Edge over the local server',
    'seed.denied': 'Write permission denied — auto-sync disabled',
    'seed.askUnbind': 'Already bound. Unbind this folder?',
    'seed.tip': 'Pick the TimDing-Portfolio folder and allow writing; then every save auto-updates assets/data/seed.json',
    'btn.back': 'Back',
    'reader.fullscreen': 'Full-screen Reading', 'reader.exit': 'Exit Full Screen', 'reader.toc': 'Contents',
    'reader.fontDown': 'Smaller text', 'reader.fontUp': 'Larger text',
    'reader.emptyToc': 'No headings in this post',
    'viewer.fullscreen': 'View Full Screen', 'viewer.exit': 'Exit Full Screen',
    'viewer.unsupported': 'Full-screen API is unavailable — using the in-page viewer instead',

    'words': 'an AI freshman|someone who rebuilds algorithms by hand|a rookie grinding math and code|a person who turns data into stories'
  };

  var dict = { zh: zh, en: en };

  var I18N = {
    lang: 'zh',
    listeners: [],

    init: function () {
      var saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) {}
      this.lang = (saved === 'en' || saved === 'zh') ? saved : 'zh';
      // 支持 ?lang=en / ?lang=zh 直接打开指定语言版本
      var q = null;
      try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
      if (q === 'en' || q === 'zh') {
        this.lang = q;
        try { localStorage.setItem(KEY, q); } catch (e) {}
      }
      document.documentElement.setAttribute('data-lang', this.lang);
      return this.lang;
    },

    set: function (lang) {
      if (lang !== 'zh' && lang !== 'en') return;
      this.lang = lang;
      try { localStorage.setItem(KEY, lang); } catch (e) {}
      document.documentElement.setAttribute('data-lang', lang);
      this.apply();
      this.listeners.forEach(function (fn) { fn(lang); });
    },

    toggle: function () { this.set(this.lang === 'zh' ? 'en' : 'zh'); },

    /** 取文案，支持 {name} 占位符 */
    t: function (key, vars) {
      var s = (dict[this.lang] && dict[this.lang][key]);
      if (s == null) s = (dict.zh[key] != null ? dict.zh[key] : key);
      if (vars) {
        Object.keys(vars).forEach(function (k) {
          s = s.split('{' + k + '}').join(vars[k]);
        });
      }
      return s;
    },

    /** 按当前语言取内容字段（英文缺失时回退中文） */
    pick: function (zhValue, enValue) {
      if (this.lang === 'en') {
        if (enValue !== undefined && enValue !== null && enValue !== '') return enValue;
        return zhValue;
      }
      return zhValue;
    },

    onChange: function (fn) { this.listeners.push(fn); },

    /** 把 data-i18n 应用到页面 */
    apply: function (root) {
      var scope = root || document;
      var self = this;
      var list = scope.querySelectorAll('[data-i18n]');
      Array.prototype.forEach.call(list, function (el) { el.textContent = self.t(el.getAttribute('data-i18n')); });
      var list2 = scope.querySelectorAll('[data-i18n-html]');
      Array.prototype.forEach.call(list2, function (el) { el.innerHTML = self.t(el.getAttribute('data-i18n-html')); });
      var list3 = scope.querySelectorAll('[data-i18n-ph]');
      Array.prototype.forEach.call(list3, function (el) { el.placeholder = self.t(el.getAttribute('data-i18n-ph')); });
      var list4 = scope.querySelectorAll('[data-i18n-title]');
      Array.prototype.forEach.call(list4, function (el) { el.title = self.t(el.getAttribute('data-i18n-title')); });
    }
  };

  global.I18N = I18N;
})(window);

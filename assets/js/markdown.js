/* ============================================================
   轻量 Markdown 解析器（无外部依赖）
   支持：标题 / 段落 / 粗体斜体删除线 / 行内代码 / 代码块 / 列表 /
        引用 / 分割线 / 链接 / 图片 / 表格 / 任务列表
   ============================================================ */
(function (global) {
  'use strict';

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function safeUrl(u) {
    var s = String(u || '').trim();
    return /^(https?:|mailto:|#|\/|\.\/|data:image\/)/i.test(s) ? s : '#';
  }

  var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  function inline(text) {
    var s = escapeHtml(text);

    // 行内代码
    s = s.replace(/`([^`]+)`/g, function (_, c) { return '<code>' + c + '</code>'; });
    // 图片（asset:文件ID 为站内上传的图片，渲染后再异步填充真实地址）
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, function (_, alt, url) {
      if (String(url).indexOf('asset:') === 0) {
        var id = String(url).slice(6).replace(/[^a-zA-Z0-9_-]/g, '');
        return '<img class="md-asset" data-asset="' + id + '" alt="' + alt + '" src="' + BLANK + '" />';
      }
      return '<img src="' + safeUrl(url) + '" alt="' + alt + '" loading="lazy" />';
    });
    // 链接
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, t, url) {
      return '<a href="' + safeUrl(url) + '" target="_blank" rel="noopener">' + t + '</a>';
    });
    // 粗体 / 斜体 / 删除线
    s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    return s;
  }

  function isTableLine(l) { return /^\s*\|.*\|\s*$/.test(l); }

  function splitRow(l) {
    return l.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); });
  }

  function isTableSep(l) { return /^\s*\|?[\s:-]*-[\s|:-]*\|?\s*$/.test(l) && l.indexOf('-') >= 0; }

  function render(src) {
    if (!src) return '';
    var lines = String(src).replace(/\r\n?/g, '\n').split('\n');
    var out = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      // 空行
      if (!line.trim()) { i++; continue; }

      // 代码块
      var fence = line.match(/^\s*```(\w*)\s*$/);
      if (fence) {
        i++;
        var buf = [];
        while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++; // 跳过结束围栏
        out.push('<pre><code>' + escapeHtml(buf.join('\n')) + '</code></pre>');
        continue;
      }

      // 分割线
      if (/^\s*([-*_])\1{2,}\s*$/.test(line)) { out.push('<hr />'); i++; continue; }

      // 标题
      var h = line.match(/^\s*(#{1,6})\s+(.*)$/);
      if (h) {
        var lv = h[1].length;
        out.push('<h' + lv + '>' + inline(h[2].trim()) + '</h' + lv + '>');
        i++; continue;
      }

      // 表格
      if (isTableLine(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        var head = splitRow(line);
        i += 2;
        var rows = [];
        while (i < lines.length && isTableLine(lines[i]) && lines[i].trim()) { rows.push(splitRow(lines[i])); i++; }
        var th = head.map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('');
        var tb = rows.map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>';
        }).join('');
        out.push('<table><thead><tr>' + th + '</tr></thead><tbody>' + tb + '</tbody></table>');
        continue;
      }

      // 引用
      if (/^\s*>\s?/.test(line)) {
        var q = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        out.push('<blockquote>' + render(q.join('\n')) + '</blockquote>');
        continue;
      }

      // 列表（含任务列表）
      if (/^\s*(?:[-*+]|\d+\.)\s+/.test(line)) {
        var ordered = /^\s*\d+\.\s+/.test(line);
        var items = [];
        var indent = line.match(/^\s*/)[0].length;
        while (i < lines.length) {
          var cur = lines[i];
          var m = cur.match(/^\s*(?:[-*+]|\d+\.)\s+(.*)$/);
          if (!m) {
            // 续行（缩进更深且非空）
            if (items.length && /^\s+\S/.test(cur) && cur.match(/^\s*/)[0].length > indent) {
              items[items.length - 1] += '\n' + cur.trim();
              i++; continue;
            }
            break;
          }
          var curIndent = cur.match(/^\s*/)[0].length;
          if (curIndent < indent && items.length) break;
          items.push(m[1]);
          i++;
        }
        var li = items.map(function (t) {
          var task = t.match(/^\[( |x|X)\]\s+([\s\S]*)$/);
          if (task) {
            var checked = task[1].toLowerCase() === 'x';
            return '<li>' + (checked ? '✅ ' : '⬜ ') + inline(task[2]) + '</li>';
          }
          return '<li>' + inline(t.replace(/\n/g, '<br />')) + '</li>';
        }).join('');
        out.push(ordered ? '<ol>' + li + '</ol>' : '<ul>' + li + '</ul>');
        continue;
      }

      // 段落
      var p = [];
      while (i < lines.length && lines[i].trim() &&
             !/^\s*(?:```|#{1,6}\s|>|\s*(?:[-*+]|\d+\.)\s+|([-*_])\1{2,}\s*$)/.test(lines[i])) {
        p.push(lines[i]);
        i++;
      }
      if (p.length) out.push('<p>' + inline(p.join('\n')).replace(/\n/g, '<br />') + '</p>');
      else i++;
    }

    return out.join('\n');
  }

  /** 去掉 Markdown 标记，用于生成纯文本摘要 */
  function plain(src, limit) {
    var t = String(src || '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[#>*_`~|-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return limit && t.length > limit ? t.slice(0, limit) + '…' : t;
  }

  global.Markdown = { render: render, plain: plain, escapeHtml: escapeHtml };
})(window);

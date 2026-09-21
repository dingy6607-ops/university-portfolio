/* ============================================================
   Charts —— 零依赖 Canvas 图表引擎
   支持：折线图 / 柱状图 / 饼图 / 散点图，带入场动画与悬浮提示
   ============================================================ */
(function (global) {
  'use strict';

  var PALETTE = ['#5ee7f5', '#a78bfa', '#fb7dbb', '#7bed9f', '#ffd479', '#8ab4ff', '#ff9f7a', '#c3f584'];

  function css(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }

  function parseCSV(text) {
    var lines = String(text || '').replace(/\r\n?/g, '\n').split('\n')
      .filter(function (l) { return l.trim() !== ''; });
    if (!lines.length) return { headers: [], labels: [], series: [] };
    var sep = (lines[0].split('\t').length > lines[0].split(',').length) ? '\t' : ',';
    var rows = lines.map(function (l) { return l.split(sep).map(function (c) { return c.trim(); }); });
    var headers = rows[0].slice();
    var body = rows.slice(1).map(function (r) {
      var arr = r.slice();
      while (arr.length < headers.length) arr.push('');
      return arr.slice(0, headers.length);
    });
    var labels = body.map(function (r) { return r[0]; });
    var series = headers.slice(1).map(function (h, idx) {
      return {
        name: h,
        values: body.map(function (r) { return toNum(r[idx + 1]); })
      };
    });
    return { headers: headers, labels: labels, series: series };
  }

  function toNum(v) {
    if (v === null || v === undefined) return NaN;
    var s = String(v).replace(/[,%\s]/g, '');
    if (s === '' || s === '-') return NaN;
    var n = parseFloat(s);
    return isNaN(n) ? NaN : n;
  }

  function setupCanvas(canvas) {
    var dpr = global.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(240, rect.width || canvas.parentNode.clientWidth || 600);
    var h = Math.max(180, rect.height || 240);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function niceTicks(min, max, count) {
    if (!isFinite(min) || !isFinite(max)) return { min: 0, max: 1, ticks: [0, 1] };
    if (min === max) { min = min - 1; max = max + 1; }
    var span = max - min;
    var step = Math.pow(10, Math.floor(Math.log(span / count) / Math.LN10));
    var err = (span / count) / step;
    if (err >= 7.5) step *= 10; else if (err >= 3.5) step *= 5; else if (err >= 1.5) step *= 2;
    var lo = Math.floor(min / step) * step;
    var hi = Math.ceil(max / step) * step;
    var ticks = [];
    for (var v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return { min: lo, max: hi, ticks: ticks };
  }

  function fmt(n) {
    if (!isFinite(n)) return '-';
    return Math.abs(n) >= 1000 ? (n / 1000).toFixed(1) + 'k' : (Math.round(n * 100) / 100).toString();
  }

  /** 绘制坐标轴类图表（折线 / 柱状 / 散点） */
  function drawCartesian(ctx, w, h, data, type, progress, colors, styles) {
    var pad = { l: 48, r: 16, t: 18, b: 34 };
    var iw = w - pad.l - pad.r;
    var ih = h - pad.t - pad.b;
    var labels = data.labels;
    var series = data.series;

    var all = [];
    series.forEach(function (s) { s.values.forEach(function (v) { if (isFinite(v)) all.push(v); }); });
    var min = all.length ? Math.min.apply(null, all) : 0;
    var max = all.length ? Math.max.apply(null, all) : 1;
    if (min > 0) min = 0;
    var t = niceTicks(min, max, 5);

    var xFor = function (i) { return pad.l + (labels.length <= 1 ? iw / 2 : (i * iw) / (labels.length - 1)); };
    var yFor = function (v) { return pad.t + ih - ((v - t.min) / (t.max - t.min || 1)) * ih; };

    // 网格 + 纵轴刻度
    ctx.font = '11px ' + styles.font;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    t.ticks.forEach(function (v) {
      var y = yFor(v);
      ctx.strokeStyle = styles.grid;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillStyle = styles.muted;
      ctx.fillText(fmt(v), pad.l - 8, y);
    });

    // 横轴标签
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var step = Math.ceil(labels.length / 8);
    labels.forEach(function (lb, i) {
      if (i % step !== 0 && i !== labels.length - 1) return;
      ctx.fillStyle = styles.muted;
      ctx.fillText(String(lb), xFor(i), h - pad.b + 8);
    });

    // 轴线
    ctx.strokeStyle = styles.axis;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ih); ctx.lineTo(w - pad.r, pad.t + ih);
    ctx.stroke();

    if (type === 'bar') {
      var n = series.length;
      var groupW = (iw / Math.max(labels.length, 1)) * 0.72;
      var barW = groupW / n;
      series.forEach(function (s, si) {
        ctx.fillStyle = colors[si % colors.length];
        s.values.forEach(function (v, i) {
          if (!isFinite(v)) return;
          var cx = xFor(i) - groupW / 2 + si * barW;
          var y0 = yFor(Math.max(v, 0));
          var y1 = yFor(Math.min(v, 0));
          var hh = Math.max(1, Math.abs(y1 - y0)) * progress;
          var top = v >= 0 ? yFor(0) - hh : yFor(0);
          roundRect(ctx, cx + 1, top, Math.max(2, barW - 2), hh, 3);
          ctx.fill();
        });
      });
    } else if (type === 'line') {
      series.forEach(function (s, si) {
        ctx.strokeStyle = colors[si % colors.length];
        ctx.lineWidth = 2.2;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        var started = false;
        s.values.forEach(function (v, i) {
          if (!isFinite(v)) { started = false; return; }
          var x = xFor(i), y = yFor(v);
          var yAnim = yFor(t.min) + (y - yFor(t.min)) * progress;
          if (!started) { ctx.moveTo(x, yAnim); started = true; } else { ctx.lineTo(x, yAnim); }
        });
        ctx.stroke();

        // 渐变填充（仅第一条系列）
        if (si === 0) {
          var grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ih);
          grad.addColorStop(0, hexA(colors[0], .28));
          grad.addColorStop(1, hexA(colors[0], 0));
          ctx.beginPath();
          var first = true;
          s.values.forEach(function (v, i) {
            if (!isFinite(v)) return;
            var x = xFor(i), y = yFor(v);
            var yAnim = yFor(t.min) + (y - yFor(t.min)) * progress;
            if (first) { ctx.moveTo(x, yAnim); first = false; } else { ctx.lineTo(x, yAnim); }
          });
          ctx.lineTo(xFor(s.values.length - 1), pad.t + ih);
          ctx.lineTo(xFor(0), pad.t + ih);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // 数据点
        ctx.fillStyle = styles.bg;
        s.values.forEach(function (v, i) {
          if (!isFinite(v)) return;
          var x = xFor(i), y = yFor(t.min) + (yFor(v) - yFor(t.min)) * progress;
          ctx.beginPath(); ctx.arc(x, y, 3.6, 0, Math.PI * 2);
          ctx.fillStyle = colors[si % colors.length]; ctx.fill();
          ctx.lineWidth = 1.6; ctx.strokeStyle = styles.bg; ctx.stroke();
        });
      });
    } else if (type === 'scatter') {
      series.forEach(function (s, si) {
        ctx.fillStyle = hexA(colors[si % colors.length], .8);
        s.values.forEach(function (v, i) {
          if (!isFinite(v)) return;
          var x = xFor(i);
          var y = yFor(t.min) + (yFor(v) - yFor(t.min)) * progress;
          ctx.beginPath(); ctx.arc(x, y, 5 * progress, 0, Math.PI * 2); ctx.fill();
        });
      });
    }

    return { pad: pad, iw: iw, ih: ih, xFor: xFor, yFor: yFor, ticks: t };
  }

  function drawPie(ctx, w, h, data, progress, colors, styles) {
    var s = data.series[0];
    if (!s) return { hit: [] };
    var vals = s.values.map(function (v) { return isFinite(v) ? Math.abs(v) : 0; });
    var total = vals.reduce(function (a, b) { return a + b; }, 0) || 1;
    var cx = w / 2, cy = h / 2;
    var r = Math.min(w, h) / 2 - 42;
    var start = -Math.PI / 2;
    var hit = [];
    vals.forEach(function (v, i) {
      var ang = (v / total) * Math.PI * 2 * progress;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + ang);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = styles.bg; ctx.lineWidth = 2; ctx.stroke();
      var mid = start + ang / 2;
      if (ang > .3 && progress > .85) {
        var pr = r * .62;
        ctx.fillStyle = '#03121b';
        ctx.font = '600 11px ' + styles.font;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(Math.round((v / total) * 100) + '%', cx + Math.cos(mid) * pr, cy + Math.sin(mid) * pr);
      }
      hit.push({ from: start, to: start + ang, label: data.labels[i], value: s.values[i], color: colors[i % colors.length] });
      start += ang;
    });
    // 图例
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    var items = data.labels.slice(0, 6);
    var ly = h - 16;
    items.forEach(function (lb, i) {
      var x = 12 + i * Math.min(110, (w - 24) / items.length);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(x, ly - 4, 9, 9);
      ctx.fillStyle = styles.muted;
      ctx.font = '11px ' + styles.font;
      ctx.fillText(cut(String(lb), 10), x + 14, ly);
    });
    return { hit: hit, cx: cx, cy: cy, r: r };
  }

  function cut(s, n) { return s.length > n ? s.slice(0, n) + '…' : s; }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function hexA(hex, a) {
    var m = String(hex).replace('#', '');
    if (m.length === 3) m = m.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(m, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  /**
   * 绘制图表
   * @param {HTMLCanvasElement} canvas
   * @param {Object} spec {type, csv}
   */
  function draw(canvas, spec) {
    if (!canvas) return;
    var data = parseCSV(spec.csv);
    if (!data.series.length) {
      var c = setupCanvas(canvas);
      c.ctx.fillStyle = css('--muted', '#888');
      c.ctx.font = '13px sans-serif';
      c.ctx.textAlign = 'center';
      var msg = (global.I18N && global.I18N.t) ? global.I18N.t('chart.placeholder') : 'No data yet';
      c.ctx.fillText(msg, c.w / 2, c.h / 2);
      return;
    }
    var type = spec.type || 'line';
    var styles = {
      muted: css('--muted', '#93a1bd'),
      grid: css('--grid-line', 'rgba(255,255,255,.08)'),
      axis: css('--line', 'rgba(255,255,255,.12)'),
      bg: css('--bg2', '#0a1120'),
      font: '"PingFang SC","Microsoft YaHei",system-ui,sans-serif'
    };

    var animate = spec.animate !== false;
    var startTs = 0;
    var geo = null;

    function frame(ts) {
      if (!startTs) startTs = ts;
      var p = animate ? Math.min(1, (ts - startTs) / 850) : 1;
      var s = setupCanvas(canvas);
      if (type === 'pie') geo = drawPie(s.ctx, s.w, s.h, data, ease(p), PALETTE, styles);
      else geo = drawCartesian(s.ctx, s.w, s.h, data, type, ease(p), PALETTE, styles);
      canvas.__geo = geo;
      canvas.__data = data;
      canvas.__type = type;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /** 生成图例 HTML */
  function legend(spec) {
    var d = parseCSV(spec.csv);
    return d.series.map(function (s, i) {
      return '<span><i style="background:' + PALETTE[i % PALETTE.length] + '"></i>' +
        Markdown.escapeHtml(s.name) + '</span>';
    }).join('');
  }

  /** 绑定悬浮提示（容器需 position:relative） */
  function bindTooltip(canvas, tipEl) {
    if (!canvas || canvas.__tipBound) return;
    canvas.__tipBound = true;
    canvas.addEventListener('mousemove', function (e) {
      var geo = canvas.__geo, data = canvas.__data, type = canvas.__type;
      if (!geo || !data) return;
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      var html = '';

      if (type === 'pie' && geo.hit) {
        var dx = x - geo.cx, dy = y - geo.cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= geo.r) {
          var ang = Math.atan2(dy, dx);
          var norm = ang < -Math.PI / 2 ? ang + Math.PI * 2 : ang;
          var found = geo.hit.filter(function (h) { return norm >= h.from && norm <= h.to; })[0];
          if (found) html = '<b>' + Markdown.escapeHtml(found.label) + '</b>：' + fmt(found.value);
        }
      } else if (geo.xFor && data.labels.length) {
        var idx = Math.round(((x - geo.pad.l) / (geo.iw || 1)) * (data.labels.length - 1));
        idx = Math.max(0, Math.min(data.labels.length - 1, idx));
        html = '<b>' + Markdown.escapeHtml(String(data.labels[idx])) + '</b><br />' +
          data.series.map(function (s, i) {
            var v = s.values[idx];
            return '<span style="color:' + PALETTE[i % PALETTE.length] + '">●</span> ' +
              Markdown.escapeHtml(s.name) + '：' + (isFinite(v) ? fmt(v) : '-');
          }).join('<br />');
      }

      if (html) {
        tipEl.innerHTML = html;
        tipEl.hidden = false;
        tipEl.style.left = x + 'px';
        tipEl.style.top = (type === 'pie' ? y : y) + 'px';
      } else {
        tipEl.hidden = true;
      }
    });
    canvas.addEventListener('mouseleave', function () { tipEl.hidden = true; });
  }

  global.Charts = {
    draw: draw,
    legend: legend,
    parseCSV: parseCSV,
    bindTooltip: bindTooltip,
    palette: PALETTE
  };
})(window);

/* ============================================================
   GitHubSync —— 作者模式下把站点数据直接提交到 GitHub 仓库
   ------------------------------------------------------------
   · 配置（owner / repo / branch / path / token）只存在作者本机 localStorage
   · Token 绝不写入代码，也绝不会随页面数据导出
   · 流程：GET contents 取 sha → PUT contents 提交（UTF-8 安全的 Base64）
   ============================================================ */
(function (global) {
  'use strict';

  var CFG_KEY = 'timding.githubSync';
  var API = 'https://api.github.com/repos';

  var GitHubSync = {
    DEFAULTS: {
      owner: 'dingy6607-ops',
      repo: 'site-data',
      branch: 'main',
      path: 'seed.json',
      token: ''
    },
    cfg: null,

    /** 读取本机配置（没有则用默认值，token 为空） */
    load: function () {
      var c = {};
      try { c = JSON.parse(localStorage.getItem(CFG_KEY) || '{}') || {}; } catch (e) { c = {}; }
      this.cfg = {
        owner: c.owner || this.DEFAULTS.owner,
        repo: c.repo || this.DEFAULTS.repo,
        branch: c.branch || this.DEFAULTS.branch,
        path: c.path || this.DEFAULTS.path,
        token: c.token || ''
      };
      return this.cfg;
    },

    save: function (patch) {
      var base = this.cfg || this.load();
      this.cfg = {
        owner: (patch && patch.owner) || base.owner || this.DEFAULTS.owner,
        repo: (patch && patch.repo) || base.repo || this.DEFAULTS.repo,
        branch: (patch && patch.branch) || base.branch || this.DEFAULTS.branch,
        path: (patch && patch.path) || base.path || this.DEFAULTS.path,
        token: (patch && patch.token !== undefined) ? patch.token : (base.token || '')
      };
      try { localStorage.setItem(CFG_KEY, JSON.stringify(this.cfg)); } catch (e) {}
      return this.cfg;
    },

    clearToken: function () {
      if (!this.cfg) this.load();
      this.cfg.token = '';
      try { localStorage.setItem(CFG_KEY, JSON.stringify(this.cfg)); } catch (e) {}
    },

    isConfigured: function () {
      return !!(this.cfg && this.cfg.token);
    },

    /** UTF-8 安全的 Base64（兼容中文） */
    base64: function (str) {
      var bytes, bin = '', i;
      if (global.TextEncoder) {
        bytes = new TextEncoder().encode(str);
        for (i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      } else {
        bin = unescape(encodeURIComponent(str));
      }
      return btoa(bin);
    },

    apiUrl: function () {
      var self = this;
      var path = String(this.cfg.path || 'seed.json').split('/').map(function (s) { return encodeURIComponent(s); }).join('/');
      return API + '/' + encodeURIComponent(this.cfg.owner) + '/' + encodeURIComponent(this.cfg.repo) + '/contents/' + path;
    },

    headers: function () {
      return {
        'Authorization': 'Bearer ' + this.cfg.token,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      };
    },

    /** 取远程文件 sha；文件不存在返回 null（表示新建） */
    getSha: function () {
      var self = this;
      return fetch(this.apiUrl() + '?ref=' + encodeURIComponent(this.cfg.branch), {
        headers: this.headers(),
        cache: 'no-store'
      }).then(function (r) {
        if (r.status === 404) return null;
        return r.json().then(function (d) {
          if (!r.ok) {
            var e = new Error((d && d.message) || ('HTTP ' + r.status));
            e.status = r.status;
            throw e;
          }
          return d;
        });
      }).then(function (d) { return d ? d.sha : null; });
    },

    /**
     * 提交内容到 GitHub
     * @param {string} jsonText 要写入的文件内容（JSON 字符串）
     * @param {string} message  提交信息
     * @returns Promise<{ok:true, data}|{ok:false, error}>
     */
    commit: function (jsonText, message) {
      var self = this;
      if (!this.cfg) this.load();
      if (!this.cfg.token) {
        return Promise.resolve({ ok: false, error: 'NO_TOKEN' });
      }

      return this.getSha().then(function (sha) {
        var body = {
          message: message || 'auto: update site data via Author Mode UI',
          content: self.base64(jsonText),
          branch: self.cfg.branch
        };
        if (sha) body.sha = sha;

        return fetch(self.apiUrl(), {
          method: 'PUT',
          headers: self.headers(),
          body: JSON.stringify(body)
        }).then(function (r) {
          return r.json().then(function (d) {
            if (!r.ok) {
              var raw = (d && d.message) ? String(d.message) : ('HTTP ' + r.status);
              var msg = raw;
              if (r.status === 401) msg = 'Token 无效或已过期 (401)：' + raw;
              if (r.status === 403) {
                msg = '权限不足或限流 (403)：' + raw;
                if (/not accessible by personal access token/i.test(raw)) {
                  msg += ' → 请确认 Token 授权了该仓库且含 Contents 写权限；组织仓库还需组织允许 PAT（或改用勾选 repo 的 Classic Token）';
                }
              }
              if (r.status === 404) msg = '仓库或路径不存在 (404)：' + raw;
              if (r.status === 409) msg = '远程文件已变更，请重试 (409)：' + raw;
              if (d && d.documentation_url) msg += ' [docs:' + d.documentation_url + ']';
              // 原始信息打到控制台，方便排查
              try { console.error('[GitHubSync]', r.status, raw, d || {}); } catch (e) {}
              return { ok: false, error: msg, raw: raw, status: r.status };
            }
            return { ok: true, data: d };
          });
        });
      }).catch(function (e) {
        return { ok: false, error: (e && e.message) ? e.message : String(e) };
      });
    }
  };

  global.GitHubSync = GitHubSync;
})(window);

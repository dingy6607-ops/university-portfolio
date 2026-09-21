/* ============================================================
   Store —— 本地持久化层
   元数据（资料 / 文章 / 作品 / 图表）存 localStorage
   文件内容优先存 IndexedDB，失败回退 localStorage(base64)，再失败存内存
   ============================================================ */
(function (global) {
  'use strict';

  var META_KEY = 'timding.meta.v1';
  var FILE_PREFIX = 'timding.file.';
  var DB_NAME = 'timding-portfolio';
  var DB_VERSION = 2;
  var STORE_NAME = 'files';
  var KV_STORE = 'kv';

  var dbPromise = null;
  var memoryFiles = Object.create(null); // 兜底：{ id: {blob,name,type,size} }

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve) {
      var req;
      try {
        if (!global.indexedDB) return resolve(null);
        req = global.indexedDB.open(DB_NAME, DB_VERSION);
      } catch (e) { return resolve(null); }
      var settled = false;
      var done = function (v) { if (!settled) { settled = true; resolve(v); } };
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(KV_STORE)) db.createObjectStore(KV_STORE, { keyPath: 'id' });
      };
      req.onsuccess = function () { done(req.result); };
      req.onerror = function () { done(null); };
      req.onblocked = function () { done(null); };
      setTimeout(function () { done(null); }, 3000); // file:// 下可能永久挂起
    });
    return dbPromise;
  }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(String(fr.result).split(',')[1] || ''); };
      fr.onerror = function () { reject(fr.error); };
      fr.readAsDataURL(blob);
    });
  }

  function base64ToBlob(b64, type) {
    var bin = atob(b64);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: type || 'application/octet-stream' });
  }

  var Store = {
    meta: null,

    /** 读取元数据；没有则使用传入的种子数据 */
    load: function (seed) {
      var raw = null;
      try { raw = localStorage.getItem(META_KEY); } catch (e) { raw = null; }
      this.fresh = !raw;   // true = 这台浏览器第一次打开，本地还没有任何数据
      if (raw) {
        try {
          this.meta = JSON.parse(raw);
        } catch (e) { this.meta = JSON.parse(JSON.stringify(seed)); }
      } else {
        this.meta = JSON.parse(JSON.stringify(seed));
        this.save();
      }
      // 字段兜底，兼容旧版本 / 不完整的数据
      var m = this.meta;
      var sp = seed.profile;
      if (!m.profile || typeof m.profile !== 'object') m.profile = JSON.parse(JSON.stringify(sp));
      var p = m.profile;
      Object.keys(sp).forEach(function (k) {
        if (p[k] === undefined || p[k] === null) p[k] = JSON.parse(JSON.stringify(sp[k]));
      });
      ['skills', 'timeline', 'socials'].forEach(function (k) {
        if (!Array.isArray(p[k])) p[k] = JSON.parse(JSON.stringify(sp[k]));
      });
      ['posts', 'works', 'charts'].forEach(function (k) {
        if (!Array.isArray(m[k])) m[k] = Array.isArray(seed[k]) ? JSON.parse(JSON.stringify(seed[k])) : [];
      });
      return this.meta;
    },

    save: function () {
      try {
        localStorage.setItem(META_KEY, JSON.stringify(this.meta));
        localStorage.setItem('timding.localAt', String(Date.now()));   // 本地最后改动时间
        return true;
      } catch (e) {
        return false;
      }
    },

    /** 保存文件内容，返回存储位置 'idb' | 'local' | 'memory' */
    putFile: function (id, file) {
      var self = this;
      return openDB().then(function (db) {
        if (!db) return null;
        return new Promise(function (resolve) {
          var tx;
          try { tx = db.transaction(STORE_NAME, 'readwrite'); } catch (e) { return resolve(null); }
          tx.objectStore(STORE_NAME).put({
            id: id, name: file.name, type: file.type || '', size: file.size, blob: file, at: Date.now()
          });
          tx.oncomplete = function () { resolve('idb'); };
          tx.onerror = function () { resolve(null); };
          tx.onabort = function () { resolve(null); };
        });
      }).then(function (where) {
        if (where) return where;
        return blobToBase64(file).then(function (b64) {
          try {
            localStorage.setItem(FILE_PREFIX + id, JSON.stringify({ name: file.name, type: file.type || '', size: file.size, b64: b64 }));
            return 'local';
          } catch (e) {
            memoryFiles[id] = { blob: file, name: file.name, type: file.type || '', size: file.size };
            return 'memory';
          }
        }).catch(function () {
          memoryFiles[id] = { blob: file, name: file.name, type: file.type || '', size: file.size };
          return 'memory';
        });
      });
    },

    /** 读取文件，返回 {blob,name,type,size} 或 null */
    getFile: function (id) {
      if (memoryFiles[id]) return Promise.resolve(memoryFiles[id]);
      return openDB().then(function (db) {
        if (!db) return null;
        return new Promise(function (resolve) {
          var tx;
          try { tx = db.transaction(STORE_NAME, 'readonly'); } catch (e) { return resolve(null); }
          var rq = tx.objectStore(STORE_NAME).get(id);
          rq.onsuccess = function () { resolve(rq.result || null); };
          rq.onerror = function () { resolve(null); };
        });
      }).then(function (rec) {
        if (rec && rec.blob) return { blob: rec.blob, name: rec.name, type: rec.type, size: rec.size };
        var raw = null;
        try { raw = localStorage.getItem(FILE_PREFIX + id); } catch (e) { raw = null; }
        if (raw) {
          try {
            var o = JSON.parse(raw);
            return { blob: base64ToBlob(o.b64, o.type), name: o.name, type: o.type, size: o.size };
          } catch (e) { return null; }
        }
        return null;
      });
    },

    deleteFile: function (id) {
      delete memoryFiles[id];
      try { localStorage.removeItem(FILE_PREFIX + id); } catch (e) {}
      return openDB().then(function (db) {
        if (!db) return;
        return new Promise(function (resolve) {
          var tx;
          try { tx = db.transaction(STORE_NAME, 'readwrite'); } catch (e) { return resolve(); }
          tx.objectStore(STORE_NAME).delete(id);
          tx.oncomplete = function () { resolve(); };
          tx.onerror = function () { resolve(); };
        });
      });
    },

    /** 导出全部（含文件的 base64） */
    exportAll: function () {
      var self = this;
      var out = { version: 1, exportedAt: new Date().toISOString(), meta: this.meta, files: {} };
      var ids = this.meta.works.map(function (w) { return w.fileId; }).filter(Boolean);
      // 文章正文里插入的图片（asset:文件ID）
      var re = /asset:([A-Za-z0-9_-]+)/g;
      (this.meta.posts || []).forEach(function (p) {
        [p.body, p.bodyEn].forEach(function (b) {
          var m;
          re.lastIndex = 0;
          while ((m = re.exec(b || '')) !== null) ids.push(m[1]);
        });
      });
      ids = ids.filter(function (v, i) { return ids.indexOf(v) === i; });
      return Promise.all(ids.map(function (id) {
        return self.getFile(id).then(function (f) {
          if (!f) return null;
          return blobToBase64(f.blob).then(function (b64) {
            out.files[id] = { name: f.name, type: f.type, size: f.size, b64: b64 };
          }).catch(function () { return null; });
        });
      })).then(function () { return JSON.stringify(out); });
    },

    /** 导入备份 JSON */
    importAll: function (json) {
      var self = this;
      var data = JSON.parse(json);
      if (!data || !data.meta) throw new Error('备份文件格式不正确');
      this.meta = data.meta;
      if (!Array.isArray(this.meta.works)) this.meta.works = [];
      if (!Array.isArray(this.meta.posts)) this.meta.posts = [];
      if (!Array.isArray(this.meta.charts)) this.meta.charts = [];
      this.save();
      var files = data.files || {};
      return Promise.all(Object.keys(files).map(function (id) {
        var f = files[id];
        var blob = base64ToBlob(f.b64, f.type);
        return self.putFile(id, new File([blob], f.name, { type: f.type }));
      }));
    },

    /** 存一个任意值（如文件夹句柄），key 唯一 */
    putKV: function (key, value) {
      return openDB().then(function (db) {
        if (!db) return false;
        return new Promise(function (resolve) {
          var tx;
          try { tx = db.transaction(KV_STORE, 'readwrite'); } catch (e) { return resolve(false); }
          tx.objectStore(KV_STORE).put({ id: key, value: value });
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { resolve(false); };
        });
      });
    },

    getKV: function (key) {
      return openDB().then(function (db) {
        if (!db) return null;
        return new Promise(function (resolve) {
          var tx;
          try { tx = db.transaction(KV_STORE, 'readonly'); } catch (e) { return resolve(null); }
          var rq = tx.objectStore(KV_STORE).get(key);
          rq.onsuccess = function () { resolve(rq.result ? rq.result.value : null); };
          rq.onerror = function () { resolve(null); };
        });
      });
    },

    delKV: function (key) {
      return openDB().then(function (db) {
        if (!db) return false;
        return new Promise(function (resolve) {
          var tx;
          try { tx = db.transaction(KV_STORE, 'readwrite'); } catch (e) { return resolve(false); }
          tx.objectStore(KV_STORE).delete(key);
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { resolve(false); };
        });
      });
    },

    /**
     * 首次打开（本地完全没有数据）时，从 ./assets/data/seed.json 载入预设内容
     * 成功返回 true，无预设 / 加载失败（如 file:// 下的 CORS）返回 false
     */
    loadSeedIfEmpty: function () {
      var self = this;
      if (!this.fresh || !global.fetch) return Promise.resolve(false);

      return fetch('assets/data/seed.json', { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      }).then(function (txt) {
        var data = null;
        try { data = JSON.parse(txt); } catch (e) { return false; }
        // 空文件或占位文件：忽略，继续使用内置示例数据
        if (!data || !data.meta || !data.meta.profile) return false;
        return self.importAll(txt).then(function () {
          self.fresh = false;
          return true;
        });
      }).catch(function () { return false; });
    },

    /* ---------------- 云端同步（Cloudflare Worker + KV） ---------------- */
    cloudToken: null,

    initCloud: function () {
      try { this.cloudToken = localStorage.getItem('timding.cloudToken') || null; } catch (e) { this.cloudToken = null; }
      return this.cloudToken;
    },

    setCloudToken: function (token) {
      this.cloudToken = token || null;
      try {
        if (token) localStorage.setItem('timding.cloudToken', token);
        else localStorage.removeItem('timding.cloudToken');
      } catch (e) {}
    },

    cloudHeaders: function (isJson) {
      var h = {};
      if (isJson) h['content-type'] = 'application/json';
      if (this.cloudToken) h['authorization'] = 'Bearer ' + this.cloudToken;
      return h;
    },

    /** 云端登录：true=成功，false=密码错，null=接口不可用 */
    cloudLogin: function (password) {
      if (!global.fetch) return Promise.resolve(null);
      return fetch('api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: String(password || '') })
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d && d.ok && d.token) { this.setCloudToken(d.token); return true; }
        return false;
      }.bind(this)).catch(function () { return null; });
    },

    /**
     * 拉取远端数据（多源自动回退）：
     *   1) 全局配置的 CDN 地址（window.CDN_DATA_URL，如 jsDelivr）
     *   2) 后端 API（/api/data，Cloudflare Worker + KV）
     *   3) 站点自带的 assets/data/seed.json
     * 全部失败返回 null
     */
    cloudLoadMeta: function () {
      if (!global.fetch) return Promise.resolve(null);
      var sources = [];
      sources.push('api/data');                            // 1) KV 后端：实时、最新
      if (global.CDN_DATA_URL) sources.push(global.CDN_DATA_URL);  // 2) CDN 兜底
      sources.push('assets/data/seed.json');               // 3) 站点自带文件

      function pick(d) {
        if (!d) return null;
        var m = null;
        if (d.meta && d.meta.profile) m = d.meta;        // { meta: {...} }
        else if (d.profile) m = d;                       // 直接就是 meta
        if (!m) return null;
        return { meta: m, at: (d.exportedAt && Date.parse(d.exportedAt)) || 0 };
      }

      function tryNext(i) {
        if (i >= sources.length) return Promise.resolve(null);
        return fetch(sources[i], { cache: 'no-store' }).then(function (r) {
          if (!r.ok) return null;
          return r.json();
        }).then(function (d) {
          return pick(d) || tryNext(i + 1);
        }).catch(function () {
          return tryNext(i + 1);
        });
      }
      return tryNext(0);
    },

    cloudSaveMeta: function () {
      if (!global.fetch || !this.cloudToken) return Promise.resolve(false);
      return fetch('api/data', {
        method: 'PUT',
        headers: this.cloudHeaders(true),
        body: JSON.stringify({ meta: this.meta })
      }).then(function (r) { return r.json(); }).then(function (d) {
        return !!(d && d.ok);
      }).catch(function () { return false; });
    },

    cloudGetFile: function (id) {
      if (!global.fetch || !id) return Promise.resolve(null);
      return fetch('api/file?id=' + encodeURIComponent(id)).then(function (r) {
        return r.ok ? r.json() : null;
      }).then(function (d) {
        if (!d || !d.ok || !d.b64) return null;
        return { blob: base64ToBlob(d.b64, d.type), name: d.name, type: d.type, size: d.b64.length };
      }).catch(function () { return null; });
    },

    cloudPutFile: function (id, file) {
      if (!global.fetch || !this.cloudToken) return Promise.resolve(false);
      var self = this;
      return blobToBase64(file).then(function (b64) {
        return fetch('api/file', {
          method: 'POST',
          headers: self.cloudHeaders(true),
          body: JSON.stringify({ id: id, name: file.name, type: file.type || '', b64: b64 })
        }).then(function (r) { return r.json(); }).then(function (d) { return !!(d && d.ok); });
      }).catch(function () { return false; });
    },

    clearAll: function () {
      var self = this;
      var ids = this.meta.works.map(function (w) { return w.fileId; }).filter(Boolean);
      return Promise.all(ids.map(function (id) { return self.deleteFile(id); })).then(function () {
        try {
          Object.keys(localStorage).filter(function (k) { return k.indexOf(FILE_PREFIX) === 0; })
            .forEach(function (k) { localStorage.removeItem(k); });
          localStorage.removeItem(META_KEY);
        } catch (e) {}
      });
    }
  };

  global.Store = Store;
})(window);

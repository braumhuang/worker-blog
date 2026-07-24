(function () {
  "use strict";

  var config = (function () {
    try {
      var node = document.getElementById("simplecho-config");
      return node ? JSON.parse(node.textContent || "{}") : {};
    } catch (_) {
      return {};
    }
  })();
  var validPalettes = ["gray", "white", "green", "black"];
  var storageKey = "simplecho-palette";
  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };

  function applyPalette(palette) {
    if (validPalettes.indexOf(palette) < 0) return;
    document.documentElement.setAttribute("data-sc-palette", palette);
    $$('[data-sc-set-palette]').forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-sc-set-palette") === palette ? "true" : "false");
    });
  }

  function initPalette() {
    applyPalette(document.documentElement.getAttribute("data-sc-palette") || "gray");
    $$('[data-sc-set-palette]').forEach(function (button) {
      button.addEventListener("click", function () {
        var palette = button.getAttribute("data-sc-set-palette") || "gray";
        try { localStorage.setItem(storageKey, palette); } catch (_) {}
        applyPalette(palette);
      });
    });
    if (config.themeAutoDark && window.matchMedia) {
      var media = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function (event) {
        try { if (localStorage.getItem(storageKey)) return; } catch (_) {}
        applyPalette(event.matches ? "black" : "gray");
      };
      if (media.addEventListener) media.addEventListener("change", onChange);
      else if (media.addListener) media.addListener(onChange);
    }
  }

  function initNavbar() {
    var button = $("#sc-navbar-toggler");
    var collapse = $("#sc-navbar-collapse");
    if (!button || !collapse) return;
    button.addEventListener("click", function () {
      var open = collapse.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initActiveMenu() {
    var current = location.pathname.replace(/\/$/, "") || "/";
    $$(".sc-nav-item a").forEach(function (link) {
      var href;
      try { href = new URL(link.href, location.origin).pathname.replace(/\/$/, "") || "/"; }
      catch (_) { return; }
      if (href === current || (href !== "/" && current.indexOf(href + "/") === 0)) link.closest(".sc-nav-item").classList.add("is-active");
    });
  }

  function initReadingProgress() {
    var bar = $("#sc-reading-progress");
    var content = $("#sc-post-content");
    if (!bar || !content) return;
    var update = function () {
      var rect = content.getBoundingClientRect();
      var scrollTop = window.scrollY || window.pageYOffset;
      var start = scrollTop + rect.top;
      var distance = Math.max(1, content.offsetHeight - window.innerHeight * 0.3);
      var progress = Math.max(0, Math.min(1, (scrollTop - start + window.innerHeight * 0.25) / distance));
      bar.style.width = (progress * 100).toFixed(2) + "%";
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
  }

  function initBackToTop() {
    var button = $("#sc-back-to-top");
    if (!button) return;
    var update = function () { button.classList.toggle("is-visible", (window.scrollY || 0) > 400); };
    update();
    addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", function () { scrollTo({ top: 0, behavior: "smooth" }); });
  }

  function initCodeCopy() {
    $$("#sc-post-content pre").forEach(function (pre) {
      if ($(".sc-code-copy", pre)) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "sc-code-copy";
      button.textContent = "复制";
      pre.appendChild(button);
      button.addEventListener("click", function () {
        var code = $("code", pre) || pre;
        var text = code.innerText;
        var done = function () {
          button.textContent = "已复制";
          button.classList.add("is-copied");
          setTimeout(function () { button.textContent = "复制"; button.classList.remove("is-copied"); }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
        else fallbackCopy(text, done);
      });
    });
  }

  function fallbackCopy(text, done) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand("copy"); done(); } catch (_) {}
    textarea.remove();
  }

  function initImages() {
    $$("#sc-post-content img").forEach(function (image) {
      if (!image.hasAttribute("loading")) image.setAttribute("loading", "lazy");
      image.setAttribute("decoding", "async");
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function initSearch() {
    var form = $("#sc-search-form");
    var input = $("#sc-search-input");
    var results = $("#sc-search-results");
    if (!form || !input || !results) return;
    var timer = 0;
    var controller = null;
    form.addEventListener("submit", function (event) { event.preventDefault(); });
    var search = function () {
      var query = input.value.trim();
      if (!query) { results.classList.remove("is-open"); results.innerHTML = ""; return; }
      if (controller) controller.abort();
      controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      fetch("/api/search?q=" + encodeURIComponent(query), controller ? { signal: controller.signal } : undefined)
        .then(function (response) { if (!response.ok) throw new Error(String(response.status)); return response.json(); })
        .then(function (data) {
          var items = Array.isArray(data.items) ? data.items : [];
          results.innerHTML = items.length ? items.map(function (item) {
            return '<a class="sc-search-result-item" href="' + escapeHtml(item.url || "#") + '"><strong>' + escapeHtml(item.title || "未命名") + '</strong><span>' + escapeHtml(item.excerpt || "") + "</span></a>";
          }).join("") : '<div class="sc-search-result-item sc-search-empty">没有找到匹配内容</div>';
          results.classList.add("is-open");
        })
        .catch(function (error) { if (error && error.name === "AbortError") return; results.innerHTML = '<div class="sc-search-result-item sc-search-empty">搜索暂时不可用</div>'; results.classList.add("is-open"); });
    };
    input.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(search, 180); });
    input.addEventListener("focus", function () { if (input.value.trim()) search(); });
    document.addEventListener("click", function (event) { if (!form.contains(event.target)) results.classList.remove("is-open"); });
  }

  function initCommentForm() {
    var form = $(".sc-comment-form");
    if (!form || !window.fetch || !window.FormData) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var button = $("button[type=submit]", form);
      if (button) { button.disabled = true; button.textContent = "提交中…"; }
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { "X-Requested-With": "comments" } })
        .then(function (response) { if (!response.ok) return response.text().then(function (text) { throw new Error(text || "提交失败"); }); return response.text(); })
        .then(function (html) {
          var current = $("#comments");
          if (!current) return;
          var wrap = document.createElement("div");
          wrap.innerHTML = html;
          var next = $("#comments", wrap);
          if (next) { current.replaceWith(next); initCommentForm(); next.scrollIntoView({ behavior: "smooth", block: "start" }); }
        })
        .catch(function (error) { alert(error.message || "评论提交失败"); if (button) { button.disabled = false; button.textContent = "发表评论"; } });
    });
  }

  function ready(callback) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", callback);
    else callback();
  }

  ready(function () {
    initPalette();
    initNavbar();
    initActiveMenu();
    initReadingProgress();
    initBackToTop();
    initCodeCopy();
    initImages();
    initSearch();
    initCommentForm();
  });
})();

(() => {
  const root = document.documentElement,
    modal = document.querySelector("[data-search-modal]"),
    input = document.querySelector("[data-search-input]"),
    results = document.querySelector("[data-search-results]"),
    menu = document.querySelector("[data-site-nav]"),
    back = document.querySelector("[data-back-to-top]"),
    progress = document.querySelector("[data-reading-progress]");
  let timer = 0,
    active = -1;
  document
    .querySelector("[data-theme-toggle]")
    ?.addEventListener("click", () => {
      root.classList.add("theme-animating");
      const dark = !root.classList.contains("dark");
      root.classList.toggle("dark", dark);
      localStorage.setItem("printer-theme-mode", dark ? "dark" : "light");
      setTimeout(() => root.classList.remove("theme-animating"), 300);
    });
  document
    .querySelector("[data-menu-toggle]")
    ?.addEventListener("click", (e) => {
      menu?.classList.toggle("is-open");
      e.currentTarget.setAttribute(
        "aria-expanded",
        String(menu?.classList.contains("is-open")),
      );
    });
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-nav-submenu-toggle]");
    if (t) {
      const g = t.closest("[data-nav-group]");
      if (matchMedia("(hover:none)").matches || t.tagName === "BUTTON") {
        e.preventDefault();
        document
          .querySelectorAll("[data-nav-group].is-open")
          .forEach((x) => x !== g && x.classList.remove("is-open"));
        g?.classList.toggle("is-open");
      }
    } else if (!e.target.closest("[data-nav-group]"))
      document
        .querySelectorAll("[data-nav-group].is-open")
        .forEach((x) => x.classList.remove("is-open"));
  });
  const setOpen = (o) => {
    modal?.classList.toggle("active", o);
    document.body.classList.toggle("search-open", o);
    if (o) setTimeout(() => input?.focus(), 20);
    else active = -1;
  };
  document
    .querySelector("[data-search-open]")
    ?.addEventListener("click", () => setOpen(true));
  document
    .querySelector("[data-search-close]")
    ?.addEventListener("click", () => setOpen(false));
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) setOpen(false);
  });
  const headerInput = document.querySelector("[data-header-search-input]");
  headerInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && headerInput.value.trim()) {
      input.value = headerInput.value;
      setOpen(true);
      input.dispatchEvent(new Event("input"));
    }
  });
  const items = () =>
      Array.from(results?.querySelectorAll(".search-result-item") || []),
    move = (n) => {
      const a = items();
      if (!a.length) return;
      active = (active + n + a.length) % a.length;
      a.forEach((x, i) => x.classList.toggle("active", i === active));
      a[active].scrollIntoView({ block: "nearest" });
    };
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen(true);
    }
    if (e.key === "Escape") setOpen(false);
    if (!modal?.classList.contains("active")) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    }
    if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      items()[active]?.click();
    }
  });
  input?.addEventListener("input", () => {
    clearTimeout(timer);
    active = -1;
    const q = input.value.trim();
    if (!q) {
      results.innerHTML = '<p class="search-empty">输入关键词开始搜索</p>';
      return;
    }
    timer = setTimeout(async () => {
      results.innerHTML = '<p class="search-empty">搜索中…</p>';
      try {
        const r = await fetch("/api/search?q=" + encodeURIComponent(q)),
          d = await r.json();
        results.replaceChildren();
        if (!d.items?.length) {
          results.innerHTML = '<p class="search-empty">没有找到结果</p>';
          return;
        }
        for (const it of d.items) {
          const a = document.createElement("a");
          a.className = "search-result-item";
          a.href = it.url;
          a.innerHTML =
            '<div class="search-result-title"></div><div class="search-result-excerpt"></div>';
          a.children[0].textContent = it.title;
          a.children[1].textContent = it.excerpt;
          results.append(a);
        }
      } catch {
        results.innerHTML = '<p class="search-empty">搜索暂时不可用</p>';
      }
    }, 180);
  });
  document
    .querySelector("[data-random-read]")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      const a = Array.from(
        document.querySelectorAll(".post-list .post-title a"),
      );
      if (a.length)
        location.href = a[Math.floor(Math.random() * a.length)].href;
    });
  const H = { "X-Requested-With": "comments" };
  async function replace(r, s = false) {
    if (!r.ok) throw new Error((await r.text()) || "评论操作失败");
    const d = new DOMParser().parseFromString(await r.text(), "text/html"),
      n = d.querySelector("#comments"),
      c = document.querySelector("#comments");
    if (!n || !c) throw new Error("无法更新评论区域");
    const t = c.getBoundingClientRect().top;
    c.replaceWith(n);
    requestAnimationFrame(() =>
      s
        ? n.scrollIntoView({ behavior: "smooth" })
        : scrollBy({ top: n.getBoundingClientRect().top - t }),
    );
  }
  document.addEventListener("click", async (e) => {
    const a = e.target.closest("[data-comment-pagination] a");
    if (!a) return;
    e.preventDefault();
    try {
      await replace(await fetch(a.href, { headers: H }), true);
      history.pushState({}, "", a.href);
    } catch {
      location.href = a.href;
    }
  });
  document.addEventListener("submit", async (e) => {
    const f = e.target.closest("[data-comment-form]");
    if (!f) return;
    e.preventDefault();
    const b = f.querySelector("[type=submit]");
    if (b) b.disabled = true;
    try {
      await replace(
        await fetch(f.action, {
          method: "POST",
          body: new FormData(f),
          headers: H,
        }),
      );
      const u = new URL(location.href);
      u.searchParams.delete("comment_page");
      u.searchParams.set("comment", "saved");
      u.hash = "comments";
      history.replaceState({}, "", u);
    } catch (err) {
      alert(err?.message || "评论提交失败");
      if (b) b.disabled = false;
    }
  });
  document.querySelectorAll(".post-content pre").forEach((pre) => {
    if (pre.querySelector(".code-copy-btn")) return;
    const b = document.createElement("button");
    b.className = "code-copy-btn";
    b.textContent = "复制";
    b.addEventListener("click", async () => {
      await navigator.clipboard.writeText(
        (pre.querySelector("code") || pre).textContent || "",
      );
      b.textContent = "已复制";
      setTimeout(() => (b.textContent = "复制"), 1300);
    });
    pre.append(b);
  });
  const update = () => {
    back?.classList.toggle("visible", scrollY > 300);
    if (progress) {
      const h = document.documentElement.scrollHeight - innerHeight;
      progress.style.width =
        (h > 0 ? Math.min(100, (scrollY / h) * 100) : 0) + "%";
    }
  };
  addEventListener("scroll", update, { passive: true });
  update();
  back?.addEventListener("click", () =>
    scrollTo({ top: 0, behavior: "smooth" }),
  );
})();

(() => {
  const root = document.documentElement,
    modal = document.querySelector("[data-search-modal]"),
    input = document.querySelector("[data-search-input]"),
    results = document.querySelector("[data-search-results]"),
    back = document.querySelector("[data-back-to-top]"),
    progress = document.querySelector("[data-reading-progress]");
  let timer = 0,
    active = -1;
  document
    .querySelector("[data-theme-toggle]")
    ?.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next === "dark" ? "dark" : "";
      localStorage.setItem("writecho-theme", next);
    });
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-nav-submenu-toggle]");
    if (toggle) {
      const group = toggle.closest("[data-nav-group]");
      if (matchMedia("(hover:none)").matches || toggle.tagName === "BUTTON") {
        e.preventDefault();
        document
          .querySelectorAll("[data-nav-group].is-open")
          .forEach((x) => x !== group && x.classList.remove("is-open"));
        group?.classList.toggle("is-open");
        toggle.setAttribute(
          "aria-expanded",
          String(group?.classList.contains("is-open")),
        );
      }
    } else if (!e.target.closest("[data-nav-group]"))
      document
        .querySelectorAll("[data-nav-group].is-open")
        .forEach((x) => x.classList.remove("is-open"));
  });
  const setOpen = (open) => {
    modal?.classList.toggle("is-open", open);
    document.body.classList.toggle("search-open", open);
    if (open) setTimeout(() => input?.focus(), 20);
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
  const items = () =>
    Array.from(results?.querySelectorAll(".search-result-item") || []);
  const move = (n) => {
    const a = items();
    if (!a.length) return;
    active = (active + n + a.length) % a.length;
    a.forEach((x, i) => x.classList.toggle("is-active", i === active));
    a[active].scrollIntoView({ block: "nearest" });
  };
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen(true);
    }
    if (e.key === "Escape") setOpen(false);
    if (!modal?.classList.contains("is-open")) return;
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
      results.innerHTML =
        '<div class="search-modal-empty">输入关键词开始搜索</div>';
      return;
    }
    timer = setTimeout(async () => {
      results.innerHTML = '<div class="search-modal-empty">搜索中…</div>';
      try {
        const r = await fetch("/api/search?q=" + encodeURIComponent(q)),
          d = await r.json();
        results.replaceChildren();
        if (!d.items?.length) {
          results.innerHTML =
            '<div class="search-modal-empty">没有找到结果</div>';
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
        results.innerHTML =
          '<div class="search-modal-empty">搜索暂时不可用</div>';
      }
    }, 180);
  });
  const commentHeaders = { "X-Requested-With": "comments" };
  async function replaceComments(response, scroll = false) {
    if (!response.ok)
      throw new Error((await response.text()) || "评论操作失败");
    const doc = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      ),
      next = doc.querySelector("#comments"),
      cur = document.querySelector("#comments");
    if (!next || !cur) throw new Error("无法更新评论区域");
    const top = cur.getBoundingClientRect().top;
    cur.replaceWith(next);
    requestAnimationFrame(() =>
      scroll
        ? next.scrollIntoView({ behavior: "smooth" })
        : scrollBy({ top: next.getBoundingClientRect().top - top }),
    );
  }
  document.addEventListener("click", async (e) => {
    const a = e.target.closest("[data-comment-pagination] a");
    if (!a) return;
    e.preventDefault();
    try {
      await replaceComments(
        await fetch(a.href, { headers: commentHeaders }),
        true,
      );
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
      await replaceComments(
        await fetch(f.action, {
          method: "POST",
          body: new FormData(f),
          headers: commentHeaders,
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
    if (pre.querySelector(".code-copy")) return;
    const b = document.createElement("button");
    b.className = "code-copy";
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
    back?.classList.toggle("visible", scrollY > 320);
    if (progress) {
      const article = document.querySelector(".post-content");
      if (article) {
        progress.style.display = "block";
        const h = document.documentElement.scrollHeight - innerHeight;
        progress.style.width =
          (h > 0 ? Math.min(100, (scrollY / h) * 100) : 0) + "%";
      }
    }
  };
  addEventListener("scroll", update, { passive: true });
  update();
  back?.addEventListener("click", () =>
    scrollTo({ top: 0, behavior: "smooth" }),
  );
})();

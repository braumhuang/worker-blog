(() => {
  const root = document.documentElement;
  const modal = document.querySelector("[data-search-modal]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const nav = document.querySelector(".mobile-nav");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const backToTop = document.querySelector("[data-back-to-top]");
  let timer = 0;
  let activeIndex = -1;

  document
    .querySelector("[data-theme-toggle]")
    ?.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      localStorage.setItem("blog-theme", next);
    });

  const closeMobileSubmenus = (except = null, scope = nav) => {
    Array.from(scope?.children || []).forEach((group) => {
      if (!group.matches?.("[data-mobile-nav-group]") || group === except)
        return;
      group.classList.remove("open");
      group
        .querySelector(":scope > [data-mobile-nav-toggle]")
        ?.setAttribute("aria-expanded", "false");
    });
  };
  const closeAllMobileSubmenus = () => {
    nav?.querySelectorAll("[data-mobile-nav-group]").forEach((group) => {
      group.classList.remove("open");
      group
        .querySelector(":scope > [data-mobile-nav-toggle]")
        ?.setAttribute("aria-expanded", "false");
    });
  };
  const setMenuOpen = (open) => {
    nav?.classList.toggle("active", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("mobile-nav-open", open);
    if (!open) closeAllMobileSubmenus();
  };
  menuToggle?.addEventListener("click", () =>
    setMenuOpen(!nav?.classList.contains("active")),
  );
  nav?.addEventListener("click", (event) => {
    const submenuToggle = event.target.closest("[data-mobile-nav-toggle]");
    if (submenuToggle) {
      event.preventDefault();
      const group = submenuToggle.closest("[data-mobile-nav-group]");
      const open = !group?.classList.contains("open");
      closeMobileSubmenus(group, group?.parentElement || nav);
      group?.classList.toggle("open", open);
      submenuToggle.setAttribute("aria-expanded", String(open));
      return;
    }
    if (event.target.closest("a")) setMenuOpen(false);
  });

  const moreMenu = document.querySelector("[data-nav-more]");
  const moreToggle = moreMenu?.querySelector("[data-nav-more-toggle]");
  const setMoreOpen = (open) => {
    moreMenu?.classList.toggle("open", open);
    moreToggle?.setAttribute("aria-expanded", String(open));
  };
  moreToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    setMoreOpen(!moreMenu?.classList.contains("open"));
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-nav-more]")) setMoreOpen(false);
  });

  const setSearchOpen = (open) => {
    modal?.classList.toggle("active", open);
    document.body.classList.toggle("search-open", open);
    if (open) setTimeout(() => input?.focus(), 30);
    else activeIndex = -1;
  };
  document
    .querySelector("[data-search-open]")
    ?.addEventListener("click", () => setSearchOpen(true));
  document
    .querySelector("[data-search-close]")
    ?.addEventListener("click", () => setSearchOpen(false));
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) setSearchOpen(false);
  });

  const items = () =>
    Array.from(results?.querySelectorAll(".search-result-item") || []);
  const moveActive = (step) => {
    const list = items();
    if (!list.length) return;
    activeIndex = (activeIndex + step + list.length) % list.length;
    list.forEach((item, index) =>
      item.classList.toggle("active", index === activeIndex),
    );
    list[activeIndex].scrollIntoView({ block: "nearest" });
  };

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setSearchOpen(true);
    }
    if (event.key === "Escape") {
      setSearchOpen(false);
      setMenuOpen(false);
      setMoreOpen(false);
    }
    if (!modal?.classList.contains("active")) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      items()[activeIndex]?.click();
    }
  });

  input?.addEventListener("input", () => {
    clearTimeout(timer);
    activeIndex = -1;
    const q = input.value.trim();
    if (!q) {
      results.innerHTML =
        '<div class="search-empty">输入关键词开始搜索 · 支持标题 / 摘要 / 标签</div>';
      return;
    }
    timer = setTimeout(async () => {
      results.innerHTML = '<div class="search-empty">搜索中…</div>';
      try {
        const response = await fetch("/api/search?q=" + encodeURIComponent(q));
        const data = await response.json();
        results.replaceChildren();
        if (!data.items?.length) {
          results.innerHTML = '<div class="search-empty">没有找到结果</div>';
          return;
        }
        for (const item of data.items) {
          const link = document.createElement("a");
          link.className = "search-result-item";
          link.href = item.url;
          const title = document.createElement("div");
          title.className = "search-result-title";
          title.textContent = item.title;
          const excerpt = document.createElement("div");
          excerpt.className = "search-result-excerpt";
          excerpt.textContent = item.excerpt;
          link.append(title, excerpt);
          results.append(link);
        }
      } catch {
        results.innerHTML = '<div class="search-empty">搜索暂时不可用</div>';
      }
    }, 180);
  });

  const commentHeaders = { "X-Requested-With": "comments" };

  const replaceComments = async (
    response,
    { historyUrl = "", historyMode = "", scrollMode = "keep" } = {},
  ) => {
    if (!response.ok)
      throw new Error((await response.text()) || "评论操作失败");
    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const next = parsed.querySelector("#comments");
    const current = document.querySelector("#comments");
    if (!next || !current) throw new Error("无法更新评论区域");

    const previousTop = current.getBoundingClientRect().top;
    current.replaceWith(next);
    if (historyUrl && historyMode === "push")
      history.pushState({}, "", historyUrl);
    if (historyUrl && historyMode === "replace")
      history.replaceState({}, "", historyUrl);

    requestAnimationFrame(() => {
      if (scrollMode === "comments") {
        next.scrollIntoView({ block: "start", behavior: "smooth" });
        return;
      }
      const offset = next.getBoundingClientRect().top - previousTop;
      if (Math.abs(offset) > 1) scrollBy({ top: offset, behavior: "auto" });
    });
  };

  const fetchComments = (url) => fetch(url, { headers: commentHeaders });

  document.addEventListener("click", async (event) => {
    const link = event.target.closest("[data-comment-pagination] a");
    if (!link) return;
    event.preventDefault();
    const section = link.closest("#comments");
    section?.setAttribute("aria-busy", "true");
    try {
      await replaceComments(await fetchComments(link.href), {
        historyUrl: link.href,
        historyMode: "push",
        scrollMode: "comments",
      });
    } catch {
      location.href = link.href;
    }
  });

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest("[data-comment-form]");
    if (!form) return;
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    const section = form.closest("#comments");
    if (submit) submit.disabled = true;
    section?.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: commentHeaders,
      });
      const nextUrl = new URL(location.href);
      nextUrl.searchParams.delete("comment_page");
      nextUrl.searchParams.set("comment", "saved");
      nextUrl.hash = "comments";
      await replaceComments(response, {
        historyUrl: nextUrl.toString(),
        historyMode: "replace",
        scrollMode: "keep",
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "评论提交失败");
      section?.removeAttribute("aria-busy");
      if (submit) submit.disabled = false;
    }
  });

  addEventListener("popstate", async () => {
    if (!document.querySelector("#comments")) return;
    try {
      await replaceComments(await fetchComments(location.href), {
        scrollMode: "keep",
      });
    } catch {
      location.reload();
    }
  });

  const updateBackToTop = () =>
    backToTop?.classList.toggle("visible", scrollY > 480);
  addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop?.addEventListener("click", () =>
    scrollTo({ top: 0, behavior: "smooth" }),
  );
  addEventListener("resize", () => {
    if (innerWidth > 768) setMenuOpen(false);
  });
})();

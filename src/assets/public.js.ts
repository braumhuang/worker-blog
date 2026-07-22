export const publicJs = String.raw`
(() => {
  const root = document.documentElement;
  const modal = document.querySelector('[data-search-modal]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const nav = document.querySelector('.mobile-nav');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const backToTop = document.querySelector('[data-back-to-top]');
  let timer = 0;
  let activeIndex = -1;

  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('blog-theme', next);
  });

  const setMenuOpen = (open) => {
    nav?.classList.toggle('active', open);
    menuToggle?.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('mobile-nav-open', open);
  };
  menuToggle?.addEventListener('click', () => setMenuOpen(!nav?.classList.contains('active')));
  nav?.addEventListener('click', (event) => { if (event.target.closest('a')) setMenuOpen(false); });

  const setSearchOpen = (open) => {
    modal?.classList.toggle('active', open);
    document.body.classList.toggle('search-open', open);
    if (open) setTimeout(() => input?.focus(), 30);
    else activeIndex = -1;
  };
  document.querySelector('[data-search-open]')?.addEventListener('click', () => setSearchOpen(true));
  document.querySelector('[data-search-close]')?.addEventListener('click', () => setSearchOpen(false));
  modal?.addEventListener('click', (event) => { if (event.target === modal) setSearchOpen(false); });

  const items = () => Array.from(results?.querySelectorAll('.search-result-item') || []);
  const moveActive = (step) => {
    const list = items();
    if (!list.length) return;
    activeIndex = (activeIndex + step + list.length) % list.length;
    list.forEach((item, index) => item.classList.toggle('active', index === activeIndex));
    list[activeIndex].scrollIntoView({ block: 'nearest' });
  };

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true); }
    if (event.key === 'Escape') { setSearchOpen(false); setMenuOpen(false); }
    if (!modal?.classList.contains('active')) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); moveActive(1); }
    if (event.key === 'ArrowUp') { event.preventDefault(); moveActive(-1); }
    if (event.key === 'Enter' && activeIndex >= 0) { event.preventDefault(); items()[activeIndex]?.click(); }
  });

  input?.addEventListener('input', () => {
    clearTimeout(timer);
    activeIndex = -1;
    const q = input.value.trim();
    if (!q) { results.innerHTML = '<div class="search-empty">输入关键词开始搜索 · 支持标题 / 摘要 / 标签</div>'; return; }
    timer = setTimeout(async () => {
      results.innerHTML = '<div class="search-empty">搜索中…</div>';
      try {
        const response = await fetch('/api/search?q=' + encodeURIComponent(q));
        const data = await response.json();
        results.replaceChildren();
        if (!data.items?.length) { results.innerHTML = '<div class="search-empty">没有找到结果</div>'; return; }
        for (const item of data.items) {
          const link = document.createElement('a');
          link.className = 'search-result-item';
          link.href = item.url;
          const title = document.createElement('div');
          title.className = 'search-result-title';
          title.textContent = item.title;
          const excerpt = document.createElement('div');
          excerpt.className = 'search-result-excerpt';
          excerpt.textContent = item.excerpt;
          link.append(title, excerpt);
          results.append(link);
        }
      } catch {
        results.innerHTML = '<div class="search-empty">搜索暂时不可用</div>';
      }
    }, 180);
  });

  const updateBackToTop = () => backToTop?.classList.toggle('visible', scrollY > 480);
  addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  addEventListener('resize', () => { if (innerWidth > 768) setMenuOpen(false); });
})();
`

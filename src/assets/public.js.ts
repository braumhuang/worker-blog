export const publicJs = String.raw`
(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('blog-theme');
  if (savedTheme) root.dataset.theme = savedTheme;
  else if (matchMedia('(prefers-color-scheme: dark)').matches) root.dataset.theme = 'dark';

  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('blog-theme', next);
  });

  const nav = document.querySelector('.mobile-nav');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const setMenuOpen = (open) => {
    nav?.classList.toggle('open', open);
    menuToggle?.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('mobile-nav-open', open);
  };
  menuToggle?.addEventListener('click', () => setMenuOpen(!nav?.classList.contains('open')));
  nav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });
  addEventListener('resize', () => {
    if (innerWidth > 760) setMenuOpen(false);
  });

  const modal = document.querySelector('[data-search-modal]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  let timer = 0;
  const openSearch = () => {
    modal?.classList.add('open');
    setTimeout(() => input?.focus(), 0);
  };
  const closeSearch = () => modal?.classList.remove('open');
  document.querySelector('[data-search-open]')?.addEventListener('click', openSearch);
  document.querySelector('[data-search-close]')?.addEventListener('click', closeSearch);
  modal?.addEventListener('click', (event) => { if (event.target === modal) closeSearch(); });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
    if (event.key === 'Escape') { closeSearch(); setMenuOpen(false); }
  });
  input?.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (!q) { results.textContent = '输入关键词开始搜索 · 支持标题、正文、标签'; return; }
    timer = setTimeout(async () => {
      results.textContent = '搜索中…';
      try {
        const response = await fetch('/api/search?q=' + encodeURIComponent(q));
        const data = await response.json();
        results.replaceChildren();
        if (!data.items?.length) { results.textContent = '没有找到结果'; return; }
        for (const item of data.items) {
          const link = document.createElement('a');
          link.className = 'search-result';
          link.href = item.url;
          const title = document.createElement('strong');
          title.textContent = item.title;
          const excerpt = document.createElement('span');
          excerpt.textContent = item.excerpt;
          link.append(title, excerpt);
          results.append(link);
        }
      } catch {
        results.textContent = '搜索暂时不可用';
      }
    }, 180);
  });
})();
`

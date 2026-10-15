// Theme toggle, nav highlighting, math rendering, copy buttons, contact form, and live repo stats.
(function () {
  const root = document.documentElement;

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeColor) themeColor.setAttribute('content', theme === 'light' ? '#F5F3EF' : '#151913');
    if (themeToggle) {
      const next = theme === 'light' ? 'dark' : 'light';
      themeToggle.setAttribute('aria-label', `Switch to ${next} theme`);
      themeToggle.setAttribute('title', `Switch to ${next} theme`);
    }
  }

  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const target = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(target);
      try { localStorage.setItem('theme', target); } catch (e) { /* storage blocked */ }
    });
  }

  // KaTeX (loaded with defer before this script; equations stay as plain TeX if the CDN is unreachable)
  if (typeof window.renderMathInElement === 'function') {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      ignoredClasses: ['no-math'],
      throwOnError: false
    });
  }

  // Equations wider than the screen scroll sideways; make those reachable by keyboard
  const equations = document.querySelectorAll('.equation-container');
  function markScrollableEquations() {
    equations.forEach(eq => {
      if (eq.scrollWidth > eq.clientWidth + 1) {
        eq.setAttribute('tabindex', '0');
        eq.setAttribute('role', 'region');
        eq.setAttribute('aria-label', 'Equation (scrolls horizontally)');
      } else if (eq.getAttribute('role') === 'region') {
        eq.removeAttribute('tabindex');
        eq.removeAttribute('role');
        eq.removeAttribute('aria-label');
      }
    });
  }
  if (equations.length) {
    markScrollableEquations();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(markScrollableEquations, 150);
    });
    // Web fonts can change equation widths after first layout
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(markScrollableEquations);
  }

  // Clipboard with a fallback for browsers/contexts without the async API
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  function flash(btn, message) {
    const original = btn.dataset.label || btn.textContent;
    btn.dataset.label = original;
    btn.textContent = message;
    clearTimeout(btn._flashTimer);
    btn._flashTimer = setTimeout(() => { btn.textContent = original; }, 1500);
  }

  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      copyText(btn.getAttribute('data-copy'))
        .then(() => flash(btn, 'Copied'))
        .catch(() => flash(btn, 'Copy failed'));
    });
  });

  // Highlight the section in view (homepage only: links that point at in-page anchors)
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (navLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map();
    navLinks.forEach(a => {
      const section = document.getElementById(a.getAttribute('href').slice(1));
      if (section) byId.set(section.id, a);
    });

    const visible = new Set();
    const setCurrent = id => {
      navLinks.forEach(a => a.removeAttribute('aria-current'));
      const link = byId.get(id);
      if (link) link.setAttribute('aria-current', 'true');
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      // Bottom of page: the last section may never reach the trigger band
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setCurrent(navLinks[navLinks.length - 1].getAttribute('href').slice(1));
        return;
      }
      const top = Array.from(visible).sort((a, b) => a.offsetTop - b.offsetTop)[0];
      if (top) setCurrent(top.id);
    }, { rootMargin: '-35% 0px -60% 0px' });

    byId.forEach((_, id) => observer.observe(document.getElementById(id)));
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setCurrent(navLinks[navLinks.length - 1].getAttribute('href').slice(1));
      }
    }, { passive: true });
  }

  // Contact form: composes an email in the visitor's mail app
  const mailForm = document.getElementById('quick-mail-form');
  if (mailForm) {
    mailForm.addEventListener('submit', e => {
      e.preventDefault();
      const fields = ['sender-name', 'sender-subject', 'sender-body'].map(id => mailForm.elements[id]);
      // Whitespace-only input counts as empty
      fields.forEach(f => { if (!f.value.trim()) f.value = ''; });
      if (!mailForm.reportValidity()) return;
      const [name, subject, body] = fields.map(f => f.value.trim());
      const fullSubject = encodeURIComponent(`[Website] ${subject}`);
      const fullBody = encodeURIComponent(`${body}\n\n${name}`);
      window.location.href = `mailto:${mailForm.dataset.email}?subject=${fullSubject}&body=${fullBody}`;
    });
  }

  // Repository cards are static HTML; this only refreshes stars, language, and last-push date
  const repoGrid = document.getElementById('github-repos');
  if (repoGrid && 'fetch' in window) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Unauthenticated GitHub API allows 60 requests/hour per IP, so cache the result for an hour
    const CACHE_KEY = 'gh-repos-v1';
    const CACHE_TTL = 60 * 60 * 1000;

    function readCache() {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && Array.isArray(cached.repos) && Date.now() - cached.time < CACHE_TTL) return cached.repos;
      } catch (e) { /* storage blocked or corrupt */ }
      return null;
    }

    function fetchRepos() {
      const controller = 'AbortController' in window ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), 6000) : null;
      return fetch(`https://api.github.com/users/${encodeURIComponent(repoGrid.dataset.user)}/repos?per_page=100`, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: controller ? controller.signal : undefined
      })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
        .then(data => {
          if (!Array.isArray(data)) throw new Error('unexpected response');
          const repos = data.map(r => ({
            name: String(r.name || ''),
            stargazers_count: Number(r.stargazers_count) || 0,
            language: r.language ? String(r.language) : null,
            pushed_at: r.pushed_at ? String(r.pushed_at) : null
          }));
          try { localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), repos })); } catch (e) { /* ignore */ }
          return repos;
        })
        .finally(() => { if (timer) clearTimeout(timer); });
    }

    const cachedRepos = readCache();
    (cachedRepos ? Promise.resolve(cachedRepos) : fetchRepos())
      .then(data => {
        const byName = new Map(data.map(repo => [repo.name.toLowerCase(), repo]));
        repoGrid.querySelectorAll('[data-repo]').forEach(card => {
          const repo = byName.get(card.getAttribute('data-repo').toLowerCase());
          if (!repo) return;
          const stars = card.querySelector('[data-field="stars"]');
          const lang = card.querySelector('[data-field="language"]');
          const updated = card.querySelector('[data-field="updated"]');
          if (stars) stars.textContent = String(repo.stargazers_count || 0);
          if (lang && repo.language) lang.textContent = repo.language;
          if (updated && repo.pushed_at) {
            const d = new Date(repo.pushed_at);
            if (!isNaN(d)) {
              updated.textContent = `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
              updated.setAttribute('datetime', repo.pushed_at);
            }
          }
        });
      })
      .catch(() => { /* keep the static values */ });
  }
})();

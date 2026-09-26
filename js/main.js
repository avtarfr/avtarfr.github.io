// Repositories fetcher, mail form, and LaTeX copier
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Controller
  const themeToggle = document.getElementById('theme-toggle');
  const toggleLabel = document.getElementById('theme-toggle-label');

  function updateToggleUI(theme) {
    if (!toggleLabel) return;
    toggleLabel.textContent = theme === 'light' ? 'Dark' : 'Light';
  }

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  updateToggleUI(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const target = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', target);
      localStorage.setItem('theme', target);
      updateToggleUI(target);
    });
  }

  // Quick mail form dispatcher
  const mailForm = document.getElementById('quick-mail-form');
  if (mailForm) {
    mailForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('sender-name').value.trim();
      const subject = document.getElementById('sender-subject').value.trim();
      const body = document.getElementById('sender-body').value.trim();

      const fullSubject = encodeURIComponent(`[Website Contact] ${subject} (${name})`);
      const fullBody = encodeURIComponent(`From: ${name}\n\nMessage:\n${body}`);
      const mailtoUrl = `mailto:sumangalam.avtarsharma@students.iiserpune.ac.in?subject=${fullSubject}&body=${fullBody}`;

      window.location.href = mailtoUrl;
    });
  }

  // LaTeX copy buttons
  document.querySelectorAll('.copy-latex').forEach(btn => {
    btn.addEventListener('click', () => {
      const tex = btn.getAttribute('data-tex');
      navigator.clipboard.writeText(tex).then(() => {
        const original = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(() => btn.textContent = original, 1200);
      });
    });
  });

  // Fetch GitHub repositories with rich fallback
  const repoContainer = document.getElementById('github-repos');
  if (!repoContainer) return;

  const fallback = [
    {
      name: 'Lorenz96-stability-sweep',
      description: 'Online stability sweeps across neural parameterizations of Lorenz-96 subgrid dynamics as a function of training volume.',
      language: 'Python',
      stargazers_count: 0,
      forks_count: 0,
      updated_at: '2026-08',
      html_url: 'https://github.com/avtarfr'
    },
    {
      name: 'enso-rainfall-dynamics',
      description: 'Spatial interpolation and ENSO sensitivity analysis on IMD monsoon rainfall datasets.',
      language: 'Python',
      stargazers_count: 0,
      forks_count: 0,
      updated_at: '2026-07',
      html_url: 'https://github.com/avtarfr'
    },
    {
      name: 'math-club-treasure-hunt-bot',
      description: 'Discord bot for clue verification and progress tracking in campus treasure hunts.',
      language: 'JavaScript',
      stargazers_count: 0,
      forks_count: 0,
      updated_at: '2026-03',
      html_url: 'https://github.com/avtarfr'
    }
  ];

  fetch('https://api.github.com/users/avtarfr/repos?sort=updated&per_page=6')
    .then(r => r.json())
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) throw new Error();
      render(data.slice(0, 4));
    })
    .catch(() => render(fallback));

  function render(list) {
    repoContainer.innerHTML = '';
    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'repo-card';
      const langClass = (item.language || '').toLowerCase();
      const updatedStr = item.updated_at ? item.updated_at.substring(0, 7) : '2026';

      card.innerHTML = `
        <div>
          <div class="repo-head">
            <h3 class="repo-title">
              <a href="${item.html_url}" target="_blank">${item.name}</a>
            </h3>
            <span class="text-muted font-mono" style="font-size:0.75rem;">&nearr;</span>
          </div>
          <p class="repo-desc">${item.description || 'Student project repository and code.'}</p>
        </div>
        <div class="repo-meta">
          <span class="lang-badge">
            ${item.language || 'Code'}
          </span>
          <span>&#9733; ${item.stargazers_count || 0}</span>
          <span>&#9874; ${item.forks_count || 0}</span>
          <span style="margin-left: auto;">${updatedStr}</span>
        </div>
      `;
      repoContainer.appendChild(card);
    });
  }
});

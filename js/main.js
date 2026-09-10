// Repositories fetcher, mail form, and LaTeX copier
document.addEventListener('DOMContentLoaded', () => {
  // Quick mail form dispatcher
  const mailForm = document.getElementById('quick-mail-form');
  if (mailForm) {
    mailForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('sender-name').value.trim();
      const subject = document.getElementById('sender-subject').value.trim();
      const body = document.getElementById('sender-body').value.trim();

      const fullSubject = encodeURIComponent(`[Academic Inquiries] ${subject} (${name})`);
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
      description: 'Online stability vs. data volume sweep across 20 neural parameterizations of Lorenz-96 subgrid dynamics.',
      language: 'Python',
      stargazers_count: 0,
      forks_count: 0,
      updated_at: '2026-08',
      html_url: 'https://github.com/avtarfr'
    },
    {
      name: 'enso-rainfall-dynamics',
      description: 'Spatial interpolation pipeline and ENSO sensitivity index calculation for Indian monsoon datasets.',
      language: 'Python',
      stargazers_count: 0,
      forks_count: 0,
      updated_at: '2026-07',
      html_url: 'https://github.com/avtarfr'
    },
    {
      name: 'math-club-treasure-hunt-bot',
      description: 'Automated verification bot and closed-loop game mechanics engine built for IISER Pune Maths Club.',
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
          <p class="repo-desc">${item.description || 'Numerical modelling routines and computational mathematics.'}</p>
        </div>
        <div class="repo-meta">
          <span class="lang-badge">
            <span class="lang-dot ${langClass}"></span>
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

// Terminal console with clean inspection commands
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('terminal-modal');
  const toggleBtn = document.getElementById('term-toggle');
  const closeBtn = document.getElementById('term-close');
  const input = document.getElementById('term-in');
  const out = document.getElementById('term-out');

  if (!modal || !input) return;

  function toggle() {
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) input.focus();
  }

  if (toggleBtn) toggleBtn.addEventListener('click', toggle);
  if (closeBtn) closeBtn.addEventListener('click', toggle);

  window.addEventListener('keydown', e => {
    if (e.key === '`' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      toggle();
    }
  });

  const commands = {
    help: () => 'Commands: focus, courses, lorenz --kick, lorenz --f [val], clear',
    focus: () => 'Research RQ: Minimal training volume for neural parameterizations of subgrid term U_k to remain online-stable.',
    courses: () => 'Recent: Deep Learning (DS4144), Time Series Analysis (DS4233), Atmospheric Physics (EC3124), Bayesian Theory (DS4244).',
    clear: () => { out.innerHTML = ''; return ''; }
  };

  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;

    printLine(`sharma@l96-workstation:~$ ${raw}`, 'text-emerald');

    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();

    if (cmd === 'lorenz') {
      if (parts[1] === '--kick' && window.injectShock) {
        window.injectShock(8.0);
        printLine('Stochastic noise applied to state vector X.');
      } else if (parts[1] === '--f' && parts[2] && window.setForcing) {
        const val = parseFloat(parts[2]);
        window.setForcing(val);
        printLine(`Parameter F set to ${val}`);
      } else {
        printLine('Usage: lorenz --kick | lorenz --f [number]');
      }
      return;
    }

    if (commands[cmd]) {
      const res = commands[cmd]();
      if (res) printLine(res);
    } else {
      printLine(`Command not found: '${cmd}'. Type 'help' for options.`);
    }

    out.scrollTop = out.scrollHeight;
  });

  function printLine(text, className = '') {
    const p = document.createElement('p');
    if (className) p.className = className;
    p.textContent = text;
    out.appendChild(p);
  }
});

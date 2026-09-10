// High-speed Lorenz-96 numerical engine with Runge-Kutta 4
const l96Canvas = document.getElementById('l96-canvas');
const hovCanvas = document.getElementById('hovmoller-canvas');

if (l96Canvas) {
  const ctx = l96Canvas.getContext('2d');
  const hovCtx = hovCanvas ? hovCanvas.getContext('2d') : null;

  let width, height;
  function resize() {
    width = l96Canvas.width = l96Canvas.parentElement.clientWidth;
    height = l96Canvas.height = l96Canvas.parentElement.clientHeight;
    if (hovCanvas) {
      hovCanvas.width = width;
      hovCanvas.height = height;
    }
  }
  resize();
  window.addEventListener('resize', resize);

  const K = 40;
  let X = new Float32Array(K);
  let F = 8.0;
  const dt = 0.01;

  for (let k = 0; k < K; k++) {
    X[k] = F + (Math.random() - 0.5) * 0.4;
  }
  X[Math.floor(K / 2)] += 0.05;

  function dX(arr, forcing) {
    const deriv = new Float32Array(K);
    for (let k = 0; k < K; k++) {
      let km2 = (k - 2 + K) % K;
      let km1 = (k - 1 + K) % K;
      let kp1 = (k + 1) % K;
      deriv[k] = (arr[kp1] - arr[km2]) * arr[km1] - arr[k] + forcing;
    }
    return deriv;
  }

  function rk4Step() {
    let k1 = dX(X, F);

    let temp = new Float32Array(K);
    for (let i = 0; i < K; i++) temp[i] = X[i] + 0.5 * dt * k1[i];
    let k2 = dX(temp, F);

    for (let i = 0; i < K; i++) temp[i] = X[i] + 0.5 * dt * k2[i];
    let k3 = dX(temp, F);

    for (let i = 0; i < K; i++) temp[i] = X[i] + dt * k3[i];
    let k4 = dX(temp, F);

    for (let i = 0; i < K; i++) {
      X[i] += (dt / 6.0) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    }
  }

  let showHov = true;
  function updateHovmoller() {
    if (!hovCtx || !showHov) return;
    hovCtx.drawImage(hovCanvas, 0, 0, width, height - 2, 0, 2, width, height - 2);

    const cellW = width / K;
    for (let k = 0; k < K; k++) {
      const val = X[k];
      const anomaly = (val - F) / 4.0;
      let r = 8, g = 12, b = 24;

      if (anomaly > 0) {
        g = Math.min(220, 12 + anomaly * 190);
        b = Math.min(240, 24 + anomaly * 210);
      } else {
        r = Math.min(180, 8 - anomaly * 150);
        b = Math.min(220, 24 - anomaly * 170);
      }
      hovCtx.fillStyle = `rgb(${r|0}, ${g|0}, ${b|0})`;
      hovCtx.fillRect(k * cellW, 0, cellW + 1, 2);
    }
  }

  function drawRing() {
    ctx.clearRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.5;
    const baseRadius = Math.min(width, height) * 0.32;

    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const gradient = ctx.createLinearGradient(cx - baseRadius, cy, cx + baseRadius, cy);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(0.5, '#06b6d4');
    gradient.addColorStop(1, '#8b5cf6');

    ctx.beginPath();
    for (let k = 0; k <= K; k++) {
      const idx = k % K;
      const angle = (k / K) * Math.PI * 2 - Math.PI / 2;
      const r = baseRadius + (X[idx] - F) * 6.5;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;

      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let k = 0; k < K; k++) {
      const angle = (k / K) * Math.PI * 2 - Math.PI / 2;
      const r = baseRadius + (X[k] - F) * 6.5;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;

      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = (k % 2 === 0) ? '#8b5cf6' : '#10b981';
      ctx.fill();
    }
  }

  const energyEl = document.getElementById('energy-val');
  const regimeEl = document.getElementById('regime-val');

  function updateMetrics() {
    let sumSq = 0;
    for (let k = 0; k < K; k++) sumSq += X[k] * X[k];
    const energy = 0.5 * (sumSq / K);

    if (energyEl) energyEl.textContent = energy.toFixed(2);
    if (regimeEl) {
      if (F <= 3.5) regimeEl.textContent = 'Decaying';
      else if (F < 6.0) regimeEl.textContent = 'Periodic';
      else regimeEl.textContent = 'Turbulent';
    }
  }

  const slider = document.getElementById('f-slider');
  const fValText = document.getElementById('f-val');
  if (slider) {
    slider.addEventListener('input', e => {
      F = parseFloat(e.target.value);
      if (fValText) fValText.textContent = F.toFixed(1);
    });
  }

  const kickBtn = document.getElementById('kick-btn');
  if (kickBtn) {
    kickBtn.addEventListener('click', () => {
      for (let k = 0; k < K; k++) {
        X[k] += (Math.random() - 0.5) * 5.0;
      }
    });
  }

  const toggleHov = document.getElementById('toggle-hov-btn');
  if (toggleHov && hovCanvas) {
    toggleHov.addEventListener('click', () => {
      showHov = !showHov;
      hovCanvas.style.display = showHov ? 'block' : 'none';
    });
  }

  let tick = 0;
  function animate() {
    for (let s = 0; s < 4; s++) rk4Step();
    drawRing();
    updateHovmoller();
    if (tick % 6 === 0) updateMetrics();
    tick++;
    requestAnimationFrame(animate);
  }
  animate();
}

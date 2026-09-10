// Interactive 3D Lorenz Attractor
const canvas = document.getElementById('lorenz-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width = canvas.width = canvas.parentElement.clientWidth;
  let height = canvas.height = canvas.parentElement.clientHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
  });

  const sigma = 10.0;
  const rho = 28.0;
  const beta = 8.0 / 3.0;

  let dt = 0.008;
  let points = [];
  const maxPoints = 900;

  let x = 0.1, y = 0.0, z = 0.0;
  let rotX = 0.4, rotY = 0.6;
  let isDragging = false;
  let prevMouseX = 0, prevMouseY = 0;

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });
  window.addEventListener('mouseup', () => isDragging = false);
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouseX;
    const dy = e.clientY - prevMouseY;
    rotY += dx * 0.008;
    rotX += dy * 0.008;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  const perturbBtn = document.getElementById('perturb-btn');
  if (perturbBtn) {
    perturbBtn.addEventListener('click', () => {
      x += (Math.random() - 0.5) * 15.0;
      y += (Math.random() - 0.5) * 15.0;
      z += (Math.random() - 0.5) * 15.0;
    });
  }

  function stepLorenz() {
    for (let i = 0; i < 4; i++) {
      let dx = sigma * (y - x);
      let dy = x * (rho - z) - y;
      let dz = x * y - beta * z;

      x += dx * dt;
      y += dy * dt;
      z += dz * dt;

      points.push({ x, y, z });
      if (points.length > maxPoints) points.shift();
    }
  }

  function project(p) {
    // 3D rotation
    let cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    let x1 = p.x * cosY + p.z * sinY;
    let z1 = -p.x * sinY + p.z * cosY;

    let cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    let y2 = p.y * cosX - z1 * sinX;
    let z2 = p.y * sinX + z1 * cosX;

    const scale = 11;
    const px = width / 2 + x1 * scale + 100;
    const py = height / 2 - (y2 - 25) * scale;
    return { x: px, y: py, z: z2 };
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    if (points.length > 2) {
      for (let i = 1; i < points.length; i++) {
        const p1 = project(points[i - 1]);
        const p2 = project(points[i]);

        const alpha = (i / points.length) * 0.75;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(88, 166, 255, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }

  function loop() {
    stepLorenz();
    draw();
    requestAnimationFrame(loop);
  }
  loop();
}

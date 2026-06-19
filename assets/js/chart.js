(function () {
  function drawBar(canvasId, labels, values) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    const h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const width = canvas.offsetWidth, height = canvas.offsetHeight;
    ctx.clearRect(0, 0, width, height);
    const max = Math.max(...values, 1);
    const pad = 35;
    const gap = 18;
    const barW = Math.max(18, (width - pad * 2 - gap * (values.length - 1)) / values.length);
    ctx.font = '12px Inter, Arial';
    ctx.fillStyle = '#6b7280';
    ctx.strokeStyle = '#edf2f7';
    for (let i = 0; i < 4; i++) {
      const y = pad + i * ((height - pad * 2) / 3);
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(width - pad, y); ctx.stroke();
    }
    values.forEach((v, i) => {
      const barH = (v / max) * (height - pad * 2);
      const x = pad + i * (barW + gap);
      const y = height - pad - barH;
      const grad = ctx.createLinearGradient(0, y, 0, height - pad);
      grad.addColorStop(0, '#0bb7a8'); grad.addColorStop(1, '#0b6d67');
      roundRect(ctx, x, y, barW, barH, 8, grad);
      ctx.fillStyle = '#111827';
      ctx.textAlign = 'center';
      ctx.fillText(String(v), x + barW / 2, y - 7);
      ctx.fillStyle = '#6b7280';
      ctx.fillText(String(labels[i]).slice(0, 12), x + barW / 2, height - 10);
    });
  }

  function drawPie(canvasId, labels, values) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    const h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const width = canvas.offsetWidth, height = canvas.offsetHeight;
    ctx.clearRect(0, 0, width, height);
    const total = values.reduce((a,b) => a + b, 0) || 1;
    const colors = ['#0f8f8a', '#15c8b8', '#7dd3fc', '#a7f3d0', '#2dd4bf'];
    let start = -Math.PI / 2;
    const r = Math.min(width, height) / 3.2;
    const cx = width / 2.7;
    const cy = height / 2;
    values.forEach((v, i) => {
      const angle = (v / total) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, start, start + angle); ctx.closePath(); ctx.fillStyle = colors[i % colors.length]; ctx.fill();
      start += angle;
    });
    ctx.font = '12px Inter, Arial';
    labels.forEach((label, i) => {
      const x = width * 0.58; const y = height * 0.32 + i * 24;
      ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(x, y - 10, 12, 12);
      ctx.fillStyle = '#374151'; ctx.fillText(`${label}: ${values[i]}`, x + 18, y);
    });
  }

  function drawLine(canvasId, labels, values) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    const h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const width = canvas.offsetWidth, height = canvas.offsetHeight;
    ctx.clearRect(0, 0, width, height);
    const max = Math.max(...values, 1), pad = 35;
    ctx.strokeStyle = '#edf2f7';
    for (let i = 0; i < 4; i++) { const y = pad + i * ((height - pad * 2) / 3); ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(width - pad, y); ctx.stroke(); }
    const pts = values.map((v, i) => ({ x: pad + i * ((width - pad * 2) / Math.max(values.length - 1, 1)), y: height - pad - (v / max) * (height - pad * 2) }));
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = '#0f8f8a'; ctx.lineWidth = 3; ctx.stroke();
    pts.forEach((p, i) => { ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fillStyle = '#0f8f8a'; ctx.fill(); ctx.fillStyle = '#374151'; ctx.font='12px Inter, Arial'; ctx.textAlign='center'; ctx.fillText(labels[i], p.x, height - 10); });
  }

  function roundRect(ctx, x, y, w, h, r, fill) {
    const radius = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y); ctx.lineTo(x + w - radius, y); ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius); ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius); ctx.quadraticCurveTo(x, y, x + radius, y); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
  }

  window.FKCharts = { drawBar, drawPie, drawLine };
})();

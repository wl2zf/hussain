// خلفية Matrix Rain بألوان وردية/بنفسجية (بدل الأخضر التقليدي)
(function () {
  const canvas = document.getElementById('matrix');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const glyphs =
    'アイウエオカキクケコサシスセソ0123456789✦❀✧♡'.split('');
  const colors = ['#ff6ec7', '#c98bd6', '#b06ab3', '#e8c07d'];
  const fontSize = 16;
  let columns = 0;
  let drops = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(0).map(() => Math.random() * -50);
  }

  function draw() {
    // أثر التلاشي الداكن
    ctx.fillStyle = 'rgba(20, 10, 31, 0.12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillText(ch, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  window.addEventListener('resize', resize);
  resize();
  setInterval(draw, 55);
})();

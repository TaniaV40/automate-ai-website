const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('#mobile-menu');
const menuClose = menu?.querySelector('.mobile-menu-close');
const header = document.querySelector('.site-header');
const canvas = document.querySelector('#mesh-canvas');

const onScroll = () => {
  header?.classList.toggle('scrolled', window.scrollY > 50);
};

const setMenuState = (open) => {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('translate-x-0', open);
  menu.classList.toggle('translate-x-full', !open);
  document.body.style.overflow = open ? 'hidden' : '';
};

toggle?.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  setMenuState(!isOpen);
});

menuClose?.addEventListener('click', () => {
  setMenuState(false);
});

window.addEventListener('scroll', onScroll);
onScroll();

if (canvas) {
  const ctx = canvas.getContext('2d');
  const points = [];
  let width = 0;
  let height = 0;
  let dpr = 1;

  const resize = () => {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const createPoints = () => {
    points.length = 0;
    const count = Math.min(220, Math.max(140, Math.floor((width * height) / 12000)));
    for (let i = 0; i < count; i += 1) {
      const px = (Math.random() + Math.random()) / 2;
      const py = (Math.random() + Math.random()) / 2;
      points.push({
        x: px * width,
        y: py * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1.2 + Math.random() * 1.6,
      });
    }
  };

  const step = (time) => {
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    const breath = 0.5 + Math.sin(time * 0.0004) * 0.5;

    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    }

    for (let i = 0; i < points.length; i += 1) {
      const a = points[i];
      const dxC = a.x - centerX;
      const dyC = a.y - centerY;
      const distC = Math.sqrt(dxC * dxC + dyC * dyC);
      const centerFade = Math.max(0, 1 - distC / (Math.min(width, height) * 0.7));

      for (let j = i + 1; j < points.length; j += 1) {
        const b = points[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 140;
        if (dist < maxDist) {
          const alpha = ((1 - dist / maxDist) * 0.55 + 0.25) * centerFade * (0.6 + 0.4 * breath);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of points) {
      const dxC = p.x - centerX;
      const dyC = p.y - centerY;
      const distC = Math.sqrt(dxC * dxC + dyC * dyC);
      const centerFade = Math.max(0.1, 1 - distC / (Math.min(width, height) * 0.7));
      ctx.fillStyle = `rgba(255, 255, 255, ${0.75 * centerFade})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(step);
  };

  resize();
  createPoints();
  window.addEventListener('resize', () => {
    resize();
    createPoints();
  });
  requestAnimationFrame(step);
}

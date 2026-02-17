const canvas = document.getElementById("bg");
const hero = canvas ? canvas.closest(".hero-section") : null;

if (!canvas || !hero) {
  throw new Error("Hero canvas not found.");
}

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {
  canvas.style.display = "none";
} else {
  const ctx = canvas.getContext("2d", { alpha: false });

  const params = {
    amplitude: 72,
    speed: 180,
    wavelength: 560,
    nodeCount: 90,
    linkRadius: 70,
    particleDensity: 1.6,
    ambientNodeCount: 120,
    ambientLinkRadius: 140,
    ambientAlpha: 0.1,
  };

  const dpr = () => 1;
  let width = 0;
  let height = 0;
  let centerY = 0;
  let time = 0;
  let waveGradient = null;

  const masterWave = (x, t) => {
    const k = (Math.PI * 2) / params.wavelength;
    const y =
      Math.sin(k * x - 1.6 * t) * params.amplitude +
      Math.sin(k * 0.5 * x - 2.2 * t + 1.3) * params.amplitude * 0.22 +
      Math.sin(k * 1.4 * x - 3.6 * t - 0.8) * params.amplitude * 0.08;

    return centerY + y;
  };

  const baseWave = masterWave;

  const strands = Array.from({ length: 44 }, () => ({
    phaseJitter: (Math.random() - 0.5) * 0.55,
    width: 0.9 + Math.random() * 1.9,
    alpha: 0.1 + Math.random() * 0.16,
    offset: (Math.random() - 0.5) * (params.amplitude * 1.55),
    freqMul: 0.92 + Math.random() * 0.18,
    loose: 0.6 + Math.random() * 1.3,
  }));

  const nodes = [];
  const ambientNodes = [];
  const particles = [];

  const seedNodes = () => {
    nodes.length = 0;
    const spreadY = params.amplitude * 3.8;

    for (let i = 0; i < params.nodeCount; i += 1) {
      const xNorm = Math.random();
      const x = xNorm * width;
      const bandY = masterWave(x, 0);
      const y = bandY + (Math.random() - 0.5) * spreadY;

      nodes.push({
        xNorm,
        yOffset: y,
        jitter: (Math.random() - 0.5) * 6,
      });
    }
  };

  const seedParticles = () => {
    particles.length = 0;
    const count = Math.floor(params.nodeCount * params.particleDensity * 2.5);
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random(),
        offset: (Math.random() - 0.5) * params.amplitude * 1.2,
        speed: params.speed * (0.6 + Math.random() * 0.7),
        size: 0.6 + Math.random() * 0.6,
        hueShift: Math.random(),
      });
    }
  };

  const seedAmbientNodes = () => {
    ambientNodes.length = 0;
    for (let i = 0; i < params.ambientNodeCount; i += 1) {
      ambientNodes.push({
        xNorm: Math.random(),
        yNorm: Math.random(),
        vx: (Math.random() - 0.5) * 0.00008,
        vy: (Math.random() - 0.5) * 0.00006,
        hue: Math.random(),
      });
    }
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    const ratio = dpr();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    centerY = height * 0.62;

    waveGradient = ctx.createLinearGradient(0, 0, width, 0);
    waveGradient.addColorStop(0, "rgba(220, 90, 255, 0.9)");
    waveGradient.addColorStop(0.55, "rgba(140, 120, 255, 0.85)");
    waveGradient.addColorStop(1, "rgba(80, 170, 255, 0.85)");
  };

  const drawBackground = () => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
  };

  const drawGlowBand = (t) => {
    if (!waveGradient) return;

    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = waveGradient;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(130, 120, 255, 0.65)";
    ctx.lineWidth = 10;
    ctx.globalAlpha = 0.55;

    ctx.beginPath();
    for (let x = 0; x <= width; x += 4) {
      const y = baseWave(x, t);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawBloom = (t) => {
    if (!waveGradient) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = waveGradient;
    ctx.globalAlpha = 0.08;
    ctx.lineWidth = 28;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 6) {
      const y = masterWave(x, t);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawStrands = (t) => {
    if (!waveGradient) return;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    strands.forEach((strand) => {
      const buildPath = () => {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 5) {
          const y =
            masterWave(x, t + strand.phaseJitter) +
            strand.offset +
            Math.sin(
              (x / params.wavelength) * Math.PI * 2 * strand.freqMul -
              t * 2.6
            ) * (4.0 + 3.0 * strand.loose) +
            Math.sin(x * 0.006 + t * 0.8 + strand.phaseJitter * 2.0) *
              (8.0 * strand.loose);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      };

      ctx.strokeStyle = waveGradient;
      ctx.shadowBlur = 0;

      ctx.globalAlpha = strand.alpha * 0.38;
      ctx.lineWidth = strand.width * 2.1;
      buildPath();
      ctx.stroke();

      ctx.globalAlpha = strand.alpha;
      ctx.lineWidth = strand.width;
      buildPath();
      ctx.stroke();
    });

    ctx.restore();
  };

  const updateAmbientNodes = (t) => {
    for (let i = 0; i < ambientNodes.length; i += 1) {
      const n = ambientNodes[i];
      n.xNorm = (n.xNorm + n.vx + 1) % 1;
      const x = n.xNorm * width;
      const bandY = masterWave(x, t) / height;
      const pull = (bandY - n.yNorm) * 0.00012;
      n.yNorm = (n.yNorm + n.vy + pull + 1) % 1;
    }
  };

  const drawAmbientMesh = (t) => {
    updateAmbientNodes(t);

    const cellSize = params.ambientLinkRadius;
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);
    const buckets = new Map();

    for (let i = 0; i < ambientNodes.length; i += 1) {
      const n = ambientNodes[i];
      const x = n.xNorm * width;
      const y = n.yNorm * height;
      const cx = Math.min(cols - 1, Math.max(0, Math.floor(x / cellSize)));
      const cy = Math.min(rows - 1, Math.max(0, Math.floor(y / cellSize)));
      const key = `${cx},${cy}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(i);
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(140, 120, 255, ${params.ambientAlpha})`;
    ctx.lineWidth = 1;

    const r = params.ambientLinkRadius;
    const r2 = r * r;

    ctx.beginPath();

    for (let i = 0; i < ambientNodes.length; i += 1) {
      const a = ambientNodes[i];
      const ax = a.xNorm * width;
      const ay = a.yNorm * height;
      const cx = Math.min(cols - 1, Math.max(0, Math.floor(ax / cellSize)));
      const cy = Math.min(rows - 1, Math.max(0, Math.floor(ay / cellSize)));

      for (let ox = -1; ox <= 1; ox += 1) {
        for (let oy = -1; oy <= 1; oy += 1) {
          const nx = cx + ox;
          const ny = cy + oy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const key = `${nx},${ny}`;
          const list = buckets.get(key);
          if (!list) continue;

          for (let k = 0; k < list.length; k += 1) {
            const j = list[k];
            if (j <= i) continue;
            const b = ambientNodes[j];
            const bx = b.xNorm * width;
            const by = b.yNorm * height;
            const dx = bx - ax;
            const dy = by - ay;
            const d2 = dx * dx + dy * dy;
            if (d2 > r2) continue;
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
          }
        }
      }
    }

    ctx.stroke();

    for (let i = 0; i < ambientNodes.length; i += 1) {
      const n = ambientNodes[i];
      const x = n.xNorm * width;
      const y = n.yNorm * height;
      const hueMix = n.hue;
      const r = Math.round(190 + 20 * hueMix);
      const g = Math.round(130 + 20 * (1 - hueMix));
      const b = Math.round(255 - 30 * hueMix);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
      ctx.beginPath();
      ctx.arc(x, y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawMesh = (t) => {
    nodes.sort((a, b) => a.xNorm - b.xNorm);
    const spacing = width / (params.nodeCount - 1);
    const maxNeighbor = Math.ceil(params.linkRadius / spacing);
    const r = params.linkRadius;
    const r2 = r * r;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const nearPath = new Path2D();
    const farPath = new Path2D();

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const x = node.xNorm * width;
      const bandY = masterWave(x, t);
      const y = (node.yOffset - centerY) + bandY + node.jitter;

      for (let j = i + 1; j <= Math.min(nodes.length - 1, i + maxNeighbor); j += 1) {
        const other = nodes[j];
        const ox = other.xNorm * width;
        const otherBand = masterWave(ox, t);
        const oy = (other.yOffset - centerY) + otherBand + other.jitter;
        const dx = ox - x;
        const dy = oy - y;
        const d2 = dx * dx + dy * dy;

        if (d2 < r2) {
          if (d2 < r2 * 0.35) {
            nearPath.moveTo(x, y);
            nearPath.lineTo(ox, oy);
          } else {
            farPath.moveTo(x, y);
            farPath.lineTo(ox, oy);
          }
        }
      }
    }

    ctx.strokeStyle = "rgba(130, 120, 255, 0.22)";
    ctx.lineWidth = 1;
    ctx.stroke(nearPath);
    ctx.strokeStyle = "rgba(130, 120, 255, 0.12)";
    ctx.stroke(farPath);

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const x = node.xNorm * width;
      const bandY = masterWave(x, t);
      const y = (node.yOffset - centerY) + bandY + node.jitter;
      ctx.fillStyle = "rgba(200, 160, 255, 0.7)";
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawParticles = (t) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    particles.forEach((p) => {
      p.x += (p.speed / width) * 0.7;
      if (p.x > 1) p.x -= 1;
      const x = p.x * width;
      const wave = baseWave(x, t);
      const y = wave + p.offset + Math.sin(t * 1.8 + p.x * 12) * 4;

      const hueMix = p.hueShift;
      const r = Math.round(190 + 40 * hueMix);
      const g = Math.round(120 + 60 * (1 - hueMix));
      const b = Math.round(255 - 40 * hueMix);

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  resize();
  seedNodes();
  seedAmbientNodes();
  seedParticles();

  const observer = new ResizeObserver(() => {
    resize();
    seedNodes();
    seedAmbientNodes();
    seedParticles();
  });
  observer.observe(hero);

  let running = true;
  const io = new IntersectionObserver(
    ([entry]) => {
      running = entry.isIntersecting;
    },
    { threshold: 0.01 }
  );
  io.observe(hero);

  let last = 0;
  const FPS = 30;
  const frameTime = 1000 / FPS;

  const tick = (now) => {
    if (now - last < frameTime) {
      requestAnimationFrame(tick);
      return;
    }
    last = now;
    time = now * 0.001;

    if (running) {
      drawBackground();
      drawAmbientMesh(time);
      drawBloom(time);
      drawStrands(time);
      drawMesh(time);
      drawParticles(time);
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

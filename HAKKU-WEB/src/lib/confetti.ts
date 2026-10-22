/**
 * Zero-dependency client-side Confetti Celebration Engine
 * High-performance 60fps canvas particle system for celebrating user legal milestones
 */

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: "rect" | "circle";
}

const CELEBRATION_COLORS = [
  "#005bbb", // HAKKU Primary Blue
  "#ff8c00", // HAKKU Gold Accent
  "#137333", // Legal Success Green
  "#3b82f6", // Sky Blue
  "#8b5cf6", // Royal Violet
  "#f59e0b", // Warm Amber
  "#ec4899", // Rose
];

export function triggerConfetti(options?: {
  particleCount?: number;
  originY?: number;
  spread?: number;
}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Check accessibility: if user prefers reduced motion, skip confetti
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const count = options?.particleCount ?? 80;
  const originY = options?.originY ?? 0.6; // from middle-bottom

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const particles: ConfettiParticle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI / 2) + (Math.random() - 0.5) * (options?.spread ? (options.spread * Math.PI) / 180 : Math.PI * 0.7);
    const speed = 7 + Math.random() * 9;

    particles.push({
      x: width * 0.5 + (Math.random() - 0.5) * 120,
      y: height * originY,
      vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
      vy: -Math.abs(Math.sin(angle) * speed),
      size: 6 + Math.random() * 6,
      color: CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      shape: Math.random() > 0.4 ? "rect" : "circle",
    });
  }

  const startTime = performance.now();
  const DURATION = 2800; // 2.8 seconds

  function render(currentTime: number) {
    const elapsed = currentTime - startTime;
    if (elapsed > DURATION || !ctx) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const fadeFactor = elapsed > DURATION * 0.65 ? (DURATION - elapsed) / (DURATION * 0.35) : 1;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // gravity
      p.vx *= 0.985; // air drag
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, fadeFactor);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

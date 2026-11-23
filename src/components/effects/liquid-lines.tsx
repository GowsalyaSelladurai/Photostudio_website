"use client";

import { useEffect, useRef } from "react";

type TrailPoint = {
  x: number;
  y: number;
  time: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  hue: number;
};

export function LiquidLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    // Respect the user's reduced-motion preference.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    let frame = 0;
    let lastTime = 0;
    let particleTimer = 0;

    const trail: TrailPoint[] = [];
    const particles: Particle[] = [];

    const mouse = {
      x: 0,
      y: 0,
      previousX: 0,
      previousY: 0,
      active: false,
      moved: false,
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Works for both mouse and touch movement.
    const handleMove = (event: PointerEvent) => {
      mouse.previousX = mouse.x;
      mouse.previousY = mouse.y;

      mouse.x = event.clientX;
      mouse.y = event.clientY;

      mouse.active = true;
      mouse.moved = true;

      trail.push({
        x: mouse.x,
        y: mouse.y,
        time: performance.now(),
      });

      if (trail.length > 90) trail.shift();
    };

    // Start the effect immediately when touching the screen.
    const handleDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        mouse.previousX = event.clientX;
        mouse.previousY = event.clientY;
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.active = true;
        mouse.moved = false;

        trail.push({
          x: mouse.x,
          y: mouse.y,
          time: performance.now(),
        });
      }
    };

    // Stop adding to the trail when the finger is released.
    const handleUp = () => {
      mouse.active = false;
      mouse.moved = false;
    };

    const handleLeave = () => {
      mouse.active = false;
    };

    const addParticle = (x: number, y: number) => {
      particles.push({
        x: x + (Math.random() - 0.5) * 35,
        y: y + (Math.random() - 0.5) * 35,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size: Math.random() * 2.2 + 0.4,
        life: 1,
        hue: Math.random() > 0.35 ? 188 : 270,
      });

      if (particles.length > 220) particles.shift();
    };

    const drawRibbon = (time: number) => {
      if (trail.length < 3) return;

      const points = trail.map((point, index) => {
        const progress = index / (trail.length - 1);
        return {
          x: point.x,
          y: point.y,
          progress,
        };
      });

      const left: { x: number; y: number }[] = [];
      const right: { x: number; y: number }[] = [];

      points.forEach((point, index) => {
        const previous = points[Math.max(0, index - 1)];
        const next = points[Math.min(points.length - 1, index + 1)];

        const dx = next.x - previous.x;
        const dy = next.y - previous.y;
        const length = Math.sqrt(dx * dx + dy * dy) || 1;

        const normalX = -dy / length;
        const normalY = dx / length;

        const progress = point.progress;

        const wave =
          Math.sin(progress * 13 + time * 0.002) * 5 +
          Math.sin(progress * 24 - time * 0.0015) * 2;

        const envelope = Math.sin(progress * Math.PI);

        const ribbonWidth =
          (8 + envelope * 19) * Math.pow(progress, 0.55);

        const widthOffset = ribbonWidth + wave;

        left.push({
          x: point.x + normalX * widthOffset,
          y: point.y + normalY * widthOffset,
        });

        right.push({
          x: point.x - normalX * widthOffset,
          y: point.y - normalY * widthOffset,
        });
      });

      const first = points[0];
      const last = points[points.length - 1];

      const gradient = ctx.createLinearGradient(
        first.x,
        first.y,
        last.x,
        last.y
      );

      gradient.addColorStop(0, "rgba(139, 92, 246, 0)");
      gradient.addColorStop(0.35, "rgba(167, 139, 250, 0.16)");
      gradient.addColorStop(0.65, "rgba(34, 211, 238, 0.23)");
      gradient.addColorStop(1, "rgba(103, 232, 249, 0.04)");

      // Wide atmospheric glow.
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.shadowBlur = 32;
      ctx.shadowColor = "#22D3EE";
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(left[0].x, left[0].y);

      for (let i = 1; i < left.length; i++) {
        ctx.lineTo(left[i].x, left[i].y);
      }

      for (let i = right.length - 1; i >= 0; i--) {
        ctx.lineTo(right[i].x, right[i].y);
      }

      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Translucent flowing ribbon.
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.85;

      ctx.beginPath();
      ctx.moveTo(left[0].x, left[0].y);

      for (let i = 1; i < left.length; i++) {
        const p = left[i];
        const previous = left[i - 1];

        ctx.quadraticCurveTo(
          previous.x,
          previous.y,
          (previous.x + p.x) / 2,
          (previous.y + p.y) / 2
        );
      }

      for (let i = right.length - 1; i >= 0; i--) {
        ctx.lineTo(right[i].x, right[i].y);
      }

      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Fine silk texture inside the ribbon.
      for (let strand = 0; strand < 5; strand++) {
        ctx.save();

        const offset = (strand - 2) * 3.5;

        ctx.beginPath();

        points.forEach((point, index) => {
          const previous = points[Math.max(0, index - 1)];
          const next = points[Math.min(points.length - 1, index + 1)];

          const dx = next.x - previous.x;
          const dy = next.y - previous.y;
          const length = Math.sqrt(dx * dx + dy * dy) || 1;

          const nx = -dy / length;
          const ny = dx / length;

          const wave =
            Math.sin(point.progress * 16 + time * 0.002 + strand) * 5;

          const x = point.x + nx * (offset + wave);
          const y = point.y + ny * (offset + wave);

          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });

        const strandGradient = ctx.createLinearGradient(
          first.x,
          first.y,
          last.x,
          last.y
        );

        strandGradient.addColorStop(0, "rgba(196, 181, 253, 0)");
        strandGradient.addColorStop(0.4, "rgba(167, 139, 250, 0.3)");
        strandGradient.addColorStop(0.8, "rgba(103, 232, 249, 0.48)");
        strandGradient.addColorStop(1, "rgba(34, 211, 238, 0)");

        ctx.strokeStyle = strandGradient;
        ctx.lineWidth = strand === 2 ? 1.5 : 0.8;
        ctx.stroke();

        ctx.restore();
      }
    };

    const drawParticles = (delta: number) => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.life -= 0.006 * delta;

        p.vx *= 0.995;
        p.vy *= 0.995;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life * 0.85;
        ctx.fillStyle = `hsl(${p.hue}, 95%, 65%)`;
        ctx.shadowColor = `hsl(${p.hue}, 100%, 65%)`;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    };

    const animate = (time: number) => {
      const delta = Math.min(
        (time - (lastTime || time)) / 16.67,
        2
      );

      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      if (mouse.active && mouse.moved) {
        const dx = mouse.x - mouse.previousX;
        const dy = mouse.y - mouse.previousY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        particleTimer += distance;

        while (particleTimer > 8) {
          addParticle(mouse.x, mouse.y);
          particleTimer -= 8;
        }

        mouse.moved = false;
      }

      drawRibbon(time);
      drawParticles(delta);

      // Gradually remove the old trail.
      const now = performance.now();

      while (
        trail.length > 0 &&
        now - trail[0].time > 1100
      ) {
        trail.shift();
      }

      frame = requestAnimationFrame(animate);
    };

    resize();

    window.addEventListener("resize", resize);

    // Desktop mouse + mobile touch.
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    window.addEventListener("pointerleave", handleLeave);

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
      window.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="liquid-lines-canvas"
      aria-hidden="true"
    />
  );
}
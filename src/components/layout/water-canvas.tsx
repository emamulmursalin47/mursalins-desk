"use client";

import { useRef, useEffect } from "react";

const DAMPING = 0.985;
const DROP_RADIUS = 3;
const AMBIENT_MS = 500;
const IDLE_TIMEOUT = 4000; // pause simulation after 4s of no interaction
const FRAME_INTERVAL = 33; // ~30fps cap

export function WaterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const scale = isMobile ? 6 : 4; // coarser grid on mobile

    let simW = 1;
    let simH = 1;
    let buf1 = new Float32Array(1);
    let buf2 = new Float32Array(1);
    let imgData: ImageData | null = null; // reused every frame
    let raf = 0;
    let lastDrop = 0;
    let lastFrame = 0;
    let mx = -1;
    let my = -1;
    let mIn = false;
    let lastInteraction = performance.now();
    let idle = false;
    let visible = true;

    const resize = () => {
      simW = Math.max(1, Math.ceil(window.innerWidth / scale));
      simH = Math.max(1, Math.ceil(window.innerHeight / scale));
      cvs.width = simW;
      cvs.height = simH;
      buf1 = new Float32Array(simW * simH);
      buf2 = new Float32Array(simW * simH);
      imgData = ctx.createImageData(simW, simH); // allocate once
    };

    const wake = () => {
      lastInteraction = performance.now();
      if (idle) {
        idle = false;
        raf = requestAnimationFrame(loop);
      }
    };

    const drop = (cx: number, cy: number, str: number, r = DROP_RADIUS) => {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const px = cx + dx;
          const py = cy + dy;
          if (px >= 0 && px < simW && py >= 0 && py < simH) {
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d <= r)
              buf1[py * simW + px] =
                (buf1[py * simW + px] ?? 0) + str * (1 - d / r);
          }
        }
      }
    };

    const simulate = () => {
      for (let y = 1; y < simH - 1; y++) {
        for (let x = 1; x < simW - 1; x++) {
          const i = y * simW + x;
          buf2[i] =
            ((buf1[i - 1]! + buf1[i + 1]! + buf1[i - simW]! + buf1[i + simW]!) /
              2 -
              buf2[i]!) *
            DAMPING;
        }
      }
      const tmp = buf1;
      buf1 = buf2;
      buf2 = tmp;
    };

    const paint = (time: number) => {
      if (!imgData) return;
      const d = imgData.data;
      const t = time * 0.0008;
      const useCaustics = !isMobile; // skip expensive trig on mobile

      for (let y = 0; y < simH; y++) {
        for (let x = 0; x < simW; x++) {
          const idx = y * simW + x;
          const h = buf1[idx] ?? 0;
          const j = idx * 4;

          let wave = h * 10;
          if (useCaustics) {
            wave +=
              Math.sin(x * 0.09 + t) *
              Math.sin(y * 0.09 + t * 0.7) *
              Math.cos((x + y) * 0.05 + t * 0.5) *
              0.25;
          }

          const hi = Math.max(0, wave);
          const lo = Math.max(0, -wave);

          d[j] = Math.min(255, 130 + hi * 3);
          d[j + 1] = Math.min(255, 195 + hi * 2.5);
          d[j + 2] = Math.min(255, 155 + hi * 2);
          d[j + 3] = Math.min(40, 5 + hi * 3 + lo * 2);
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    const loop = (time: number) => {
      // Pause when tab hidden or idle
      if (!visible) { raf = requestAnimationFrame(loop); return; }
      if (time - lastInteraction > IDLE_TIMEOUT) {
        idle = true;
        return; // stop the loop — wake() restarts it
      }

      // Throttle to ~30fps
      if (time - lastFrame < FRAME_INTERVAL) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastFrame = time;

      // 1. Ambient drops
      if (time - lastDrop > AMBIENT_MS) {
        drop(
          2 + Math.floor(Math.random() * Math.max(1, simW - 4)),
          2 + Math.floor(Math.random() * Math.max(1, simH - 4)),
          0.4 + Math.random() * 0.6,
        );
        lastDrop = time;
      }

      // 2. Mouse / touch ripples
      if (mIn && mx >= 0) {
        const sx = Math.floor(mx / scale);
        const sy = Math.floor(my / scale);
        if (sx >= 1 && sx < simW - 1 && sy >= 1 && sy < simH - 1) {
          drop(sx, sy, 1.2, isMobile ? 3 : 4);
        }
      }

      // 3. Scroll-driven horizontal waves
      const scrollPhase = window.scrollY * 0.015;
      for (const frac of [0.45, 0.7]) {
        const wy = Math.floor(simH * frac);
        if (wy > 0 && wy < simH - 1) {
          for (let x = 0; x < simW; x++) {
            buf1[wy * simW + x] =
              (buf1[wy * simW + x] ?? 0) +
              Math.sin(x * 0.12 + scrollPhase + frac * 5) * 0.12;
          }
        }
      }

      simulate();
      paint(time);
      raf = requestAnimationFrame(loop);
    };

    // ── Event handlers ──────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      mIn = true;
      wake();
    };
    const onLeave = () => {
      mIn = false;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        mx = t.clientX;
        my = t.clientY;
        mIn = true;
        wake();
      }
    };
    const onTouchEnd = () => {
      mIn = false;
    };
    const onScroll = () => {
      wake();
    };
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      if (visible) wake();
    };

    // ── Bootstrap ───────────────────────────────────────────────
    resize();
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}

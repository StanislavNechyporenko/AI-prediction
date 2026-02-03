"use client";

import { useEffect, useRef } from "react";

const MAX_POINTS = 40;

export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<
    { x: number; y: number; alpha: number; color: string }[]
  >([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (event: MouseEvent) => {
      const element = document.elementFromPoint(event.clientX, event.clientY);
      const area = element?.closest<HTMLElement>("[data-trail]");
      const tone = area?.dataset.trail ?? "light";
      const color = tone === "dark" ? "17,17,17" : "249,115,22";
      pointsRef.current.push({
        x: event.clientX,
        y: event.clientY,
        alpha: 1,
        color
      });
      if (pointsRef.current.length > MAX_POINTS) {
        pointsRef.current.shift();
      }
    };

    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pointsRef.current = pointsRef.current
        .map((point) => ({ ...point, alpha: point.alpha - 0.03 }))
        .filter((point) => point.alpha > 0);

      pointsRef.current.forEach((point, index) => {
        const radius = 8 + index * 0.15;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${point.color}, ${Math.max(point.alpha, 0)})`;
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  );
}

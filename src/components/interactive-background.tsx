/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";

import { useEffect, useRef } from "react";

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
    }

    const particles: Particle[] = [];

    const colors = [
      "rgba(99, 102, 241, 0.6)",
      "rgba(167, 139, 250, 0.6)",
      "rgba(6, 182, 212, 0.6)",
      "rgba(16, 185, 129, 0.6)",
    ];

    function createParticle(x: number, y: number) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      });
    }

    function animate() {
      ctx!.fillStyle = "rgba(15, 23, 42, 0.1)";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx!.globalAlpha = p.life;
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalAlpha = 1;

      if (Math.random() < 0.3) {
        createParticle(
          Math.random() * canvas!.width,
          Math.random() * canvas!.height
        );
      }

      requestAnimationFrame(animate);
    }

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() < 0.5) {
        createParticle(e.clientX, e.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", () => {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}

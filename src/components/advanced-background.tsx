/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";

import { useEffect, useRef, useState } from "react";

export function AdvancedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Animated mesh gradient background
    const time = { value: 0 };
    const colors = [
      { r: 99, g: 102, b: 241 },   // Indigo
      { r: 167, g: 139, b: 250 },  // Purple
      { r: 6, g: 182, b: 212 },    // Cyan
      { r: 59, g: 130, b: 246 },   // Blue
    ];

    function drawMesh() {
      const t = time.value * 0.0005;

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const gridSize = 80;
      const cols = Math.ceil(canvas!.width / gridSize) + 1;
      const rows = Math.ceil(canvas!.height / gridSize) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;

          const wave1 = Math.sin(x * 0.005 + t) * 20;
          const wave2 = Math.cos(y * 0.005 + t) * 20;
          const wave3 = Math.sin((x + y) * 0.003 + t * 0.5) * 15;

          const offsetX = wave1 + wave3;
          const offsetY = wave2 + wave3;

          const colorIndex = ((i + j + Math.floor(t)) % colors.length + colors.length) % colors.length;
          const color = colors[colorIndex];

          const alpha = 0.15 + Math.sin(t * 0.3 + i + j) * 0.1;

          ctx!.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
          ctx!.beginPath();
          ctx!.arc(x + offsetX, y + offsetY, 40, 0, Math.PI * 2);
          ctx!.fill();

          // Blur effect
          ctx!.filter = `blur(${10 + Math.sin(t + i) * 5}px)`;
        }
      }

      ctx!.filter = "none";
      time.value++;
    }

    function animate() {
      drawMesh();
      requestAnimationFrame(animate);
    }

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ filter: "blur(40px)" }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/50 to-slate-950/70" />
    </div>
  );
}

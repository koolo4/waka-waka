'use client';

import { useEffect, useRef } from 'react';

export default function LiquidGlassBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    let animationId: number;
    let time = 0;
    const blobs: Blob[] = [];

    interface Blob {
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
      update: () => void;
      draw: (ctx: CanvasRenderingContext2D) => void;
    }

    // Create liquid blobs
    const createBlobs = () => {
      const colors = [
        'rgba(99, 102, 241, 0.05)',    // Indigo
        'rgba(167, 139, 250, 0.05)',   // Purple
        'rgba(6, 182, 212, 0.05)',     // Cyan
        'rgba(16, 185, 129, 0.03)',    // Emerald
      ];

      for (let i = 0; i < 5; i++) {
        blobs.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 100 + Math.random() * 200,
          color: colors[i % colors.length],
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x - this.radius > canvas.width) this.x = -this.radius;
            if (this.x + this.radius < 0) this.x = canvas.width + this.radius;
            if (this.y - this.radius > canvas.height) this.y = -this.radius;
            if (this.y + this.radius < 0) this.y = canvas.height + this.radius;
          },
          draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
          },
        });
      }
    };

    createBlobs();

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply blur for liquid effect
      ctx.filter = 'blur(40px)';

      // Draw and update blobs
      for (const blob of blobs) {
        blob.update();
        blob.draw(ctx);
      }

      ctx.filter = 'none';
      time++;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ 
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d1729 100%)',
      }}
    />
  );
}

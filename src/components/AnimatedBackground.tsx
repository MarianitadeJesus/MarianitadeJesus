import React, { useEffect, useRef } from 'react';

interface Leaf {
  x: number;
  y: number;
  size: number;
  rotation: number;
  speed: number;
  drift: number;
  opacity: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const leaves: Leaf[] = [];
    const leafCount = 30;

    // Initialize leaves
    for (let i = 0; i < leafCount; i++) {
      leaves.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 20 + Math.random() * 40,
        rotation: Math.random() * 360,
        speed: 0.3 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 0.5,
        opacity: 0.15 + Math.random() * 0.25
      });
    }

    const drawLeaf = (leaf: Leaf) => {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate((leaf.rotation * Math.PI) / 180);
      ctx.globalAlpha = leaf.opacity;

      // Create gradient for leaf
      const gradient = ctx.createLinearGradient(-leaf.size / 2, -leaf.size / 2, leaf.size / 2, leaf.size / 2);
      gradient.addColorStop(0, '#2d5016');
      gradient.addColorStop(0.5, '#4a7c2d');
      gradient.addColorStop(1, '#6b9d3a');

      // Draw leaf shape
      ctx.beginPath();
      ctx.moveTo(0, -leaf.size / 2);
      ctx.quadraticCurveTo(leaf.size / 3, -leaf.size / 4, leaf.size / 2, 0);
      ctx.quadraticCurveTo(leaf.size / 3, leaf.size / 4, 0, leaf.size / 2);
      ctx.quadraticCurveTo(-leaf.size / 3, leaf.size / 4, -leaf.size / 2, 0);
      ctx.quadraticCurveTo(-leaf.size / 3, -leaf.size / 4, 0, -leaf.size / 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw vein
      ctx.strokeStyle = 'rgba(45, 80, 22, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -leaf.size / 2);
      ctx.lineTo(0, leaf.size / 2);
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      leaves.forEach((leaf) => {
        // Update position
        leaf.y += leaf.speed;
        leaf.x += leaf.drift;
        leaf.rotation += 0.5;

        // Reset if out of bounds
        if (leaf.y > canvas.height + leaf.size) {
          leaf.y = -leaf.size;
          leaf.x = Math.random() * canvas.width;
        }
        if (leaf.x < -leaf.size) leaf.x = canvas.width + leaf.size;
        if (leaf.x > canvas.width + leaf.size) leaf.x = -leaf.size;

        drawLeaf(leaf);
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: 'linear-gradient(135deg, #f5f7f0 0%, #e8f0e0 50%, #d4e5c8 100%)'
      }}
    />
  );
}

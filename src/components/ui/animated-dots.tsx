import React, { useEffect, useRef } from 'react';

interface Dot {
  x: number;
  y: number;
  radius: number;
  angle: number;
  speed: number;
  distance: number;
}

const AnimatedDots: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dots: Dot[] = [];
    const numDots = 150; // Increased from 50 to 150
    
    // Create dots
    for (let i = 0; i < numDots; i++) {
      dots.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 3 + 2, // Increased size range from 1-3 to 2-5
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
        distance: Math.random() * 100 + 50
      });
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      dots.forEach(dot => {
        // Update dot position based on circular motion
        dot.angle += dot.speed;
        dot.x = dot.x + Math.cos(dot.angle) * 0.5;
        dot.y = dot.y + Math.sin(dot.angle) * 0.5;

        // Wrap dots around screen
        if (dot.x > canvas.width) dot.x = 0;
        if (dot.x < 0) dot.x = canvas.width;
        if (dot.y > canvas.height) dot.y = 0;
        if (dot.y < 0) dot.y = canvas.height;

        // Draw dot with gradient
        const gradient = ctx.createRadialGradient(
          dot.x, dot.y, 0,
          dot.x, dot.y, dot.radius
        );
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)'); // Increased opacity from 0.2 to 0.6
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

export default AnimatedDots;

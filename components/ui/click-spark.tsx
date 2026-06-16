"use client";

import { useEffect, useRef } from "react";

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  extraScale?: number;
}

interface Spark {
  x: number;
  y: number;
  startTime: number;
  rotation: number;
}

export const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor = "#99BC85",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  extraScale = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed > duration) return false;

        const progress = elapsed / duration;
        const opacity = 1 - progress;
        const currentDistance = (sparkRadius + progress * 50) * extraScale;

        for (let i = 0; i < sparkCount; i++) {
          const angle = (i * 2 * Math.PI) / sparkCount + spark.rotation;
          const x = spark.x + Math.cos(angle) * currentDistance;
          const y = spark.y + Math.sin(angle) * currentDistance;

          ctx.beginPath();
          ctx.arc(x, y, (sparkSize / 2) * opacity, 0, 2 * Math.PI);
          ctx.fillStyle = sparkColor;
          ctx.globalAlpha = opacity;
          ctx.fill();
        }

        return true;
      });

      requestAnimationFrame(animate);
    };

    const handleClick = (e: MouseEvent) => {
      sparksRef.current.push({
        x: e.clientX,
        y: e.clientY,
        startTime: performance.now(),
        rotation: Math.random() * 2 * Math.PI,
      });
    };

    window.addEventListener("mousedown", handleClick);
    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousedown", handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, extraScale]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

import React, { useEffect, useRef } from "react";

export default function AudioVisualizer({ isPlaying }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const barsRef = useRef([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size with device pixel ratio for sharp rendering
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    updateCanvasSize();

    const barCount = 60; // More bars for smoother look
    const barWidth = 3; // Thin bars for minimal design

    // Initialize bars with random properties
    if (barsRef.current.length === 0) {
      for (let i = 0; i < barCount; i++) {
        barsRef.current.push({
          height: 0,
          targetHeight: 0,
          speed: 0.1 + Math.random() * 0.15,
          phase: Math.random() * Math.PI * 2,
          baseFrequency: 0.02 + Math.random() * 0.03,
        });
      }
    }

    const draw = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const centerY = height / 2;
      const maxBarHeight = height * 0.7;

      ctx.clearRect(0, 0, width, height);

      // Get CSS variables for colors
      const styles = getComputedStyle(document.documentElement);
      const accent = styles.getPropertyValue("--accent").trim();
      const accentHover = styles.getPropertyValue("--accent-hover").trim();

      const spacing = width / barCount;

      for (let i = 0; i < barCount; i++) {
        const bar = barsRef.current[i];
        const x = i * spacing + (spacing - barWidth) / 2;

        if (isPlaying) {
          // Simulate rhythm with sine waves and random variations
          const time = Date.now() * 0.001;
          const basePulse = Math.sin(time * 2 + bar.phase) * 0.5 + 0.5;
          const secondaryPulse =
            Math.sin(time * 3.5 + bar.phase * 1.5) * 0.3 + 0.3;
          const randomFactor =
            Math.sin(time * bar.baseFrequency * 50 + bar.phase) * 0.2 + 0.8;

          bar.targetHeight =
            (basePulse * 0.6 + secondaryPulse * 0.4) *
            randomFactor *
            maxBarHeight;

          // Smooth interpolation
          bar.height += (bar.targetHeight - bar.height) * bar.speed;
        } else {
          // Idle state - minimal height
          bar.targetHeight = 4;
          bar.height += (bar.targetHeight - bar.height) * 0.1;
        }

        const barHeight = Math.max(2, bar.height);
        const y = centerY - barHeight / 2;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, accent);
        gradient.addColorStop(1, accentHover);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Add subtle glow for playing state
        if (isPlaying && bar.height > 10) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = accent;
          ctx.fillRect(x, y, barWidth, barHeight);
          ctx.shadowBlur = 0;
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    // Handle window resize
    const handleResize = () => {
      updateCanvasSize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [isPlaying]);

  return <canvas ref={canvasRef} className="audio-visualizer" />;
}

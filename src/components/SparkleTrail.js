import React, { useEffect, useRef, useCallback } from "react";
import "./SparkleTrail.css";

const SPARKLE_COLORS = [
  "#FF7B99",  // rose pink
  "#FFB7C5",  // light pink
  "#FFD700",  // gold
  "#FFFFFF",  // white
  "#FF5E81",  // hot pink
  "#E8A0BF",  // dusty rose
  "#B587FF",  // lavender
];

function SparkleTrail() {
  const containerRef = useRef(null);
  const lastSpawnTime = useRef(0);
  const isTouchDevice = useRef(false);

  // Detect touch devices on mount
  useEffect(() => {
    isTouchDevice.current = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }, []);

  const spawnSparkle = useCallback((x, y) => {
    const container = containerRef.current;
    if (!container) return;

    const sparkle = document.createElement("span");
    sparkle.className = "sparkle-particle";

    // Random properties
    const size = Math.random() * 6 + 3; // 3–9px
    const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
    const driftX = (Math.random() - 0.5) * 40; // horizontal drift ±20px
    const duration = Math.random() * 400 + 600; // 600–1000ms

    sparkle.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      --drift-x: ${driftX}px;
      animation-duration: ${duration}ms;
    `;

    // Add a star shape for some particles
    if (Math.random() > 0.6) {
      sparkle.classList.add("sparkle-star");
    }

    container.appendChild(sparkle);

    // Clean up after animation ends
    setTimeout(() => {
      if (sparkle.parentNode === container) {
        container.removeChild(sparkle);
      }
    }, duration + 50);
  }, []);

  useEffect(() => {
    if (isTouchDevice.current) return;

    const handleMouseMove = (e) => {
      const now = Date.now();
      // Throttle: spawn at most every 40ms
      if (now - lastSpawnTime.current < 40) return;
      lastSpawnTime.current = now;

      spawnSparkle(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [spawnSparkle]);

  // Don't render on touch devices
  if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
    return null;
  }

  return <div ref={containerRef} className="sparkle-trail-container" />;
}

export default SparkleTrail;

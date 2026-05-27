import { useRef, useCallback } from "react";

/**
 * useTilt — custom hook for 3D perspective tilt on mouse hover.
 * Returns a ref to attach to the card element and event handlers.
 * 
 * Usage:
 *   const { tiltRef, tiltHandlers } = useTilt({ maxTilt: 8 });
 *   <div ref={tiltRef} {...tiltHandlers} className="glass-card">...</div>
 */
export function useTilt({ maxTilt = 8 } = {}) {
  const tiltRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = tiltRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from center as -1 to 1
    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);

    // Clamp
    const rotateX = Math.max(-maxTilt, Math.min(maxTilt, -percentY * maxTilt));
    const rotateY = Math.max(-maxTilt, Math.min(maxTilt, percentX * maxTilt));

    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    el.style.transition = "transform 0.1s ease-out";
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    const el = tiltRef.current;
    if (!el) return;

    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    el.style.transition = "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)";
  }, []);

  const tiltHandlers = {
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };

  return { tiltRef, tiltHandlers };
}

import React, { useRef, useEffect } from "react";
import "./VideoBackground.css";

function VideoBackground() {
  const videoRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start with opacity 0 for fade-in
    video.style.opacity = "0";

    const handleCanPlay = () => {
      video.play().catch(() => {});
    };

    const monitorPlayback = () => {
      if (!video || video.paused) {
        rafRef.current = requestAnimationFrame(monitorPlayback);
        return;
      }

      const { currentTime, duration } = video;

      if (duration && duration > 0) {
        // Fade in during first 0.5s
        if (currentTime < 0.5) {
          video.style.opacity = String(Math.min(currentTime / 0.5, 1));
        }
        // Fade out during last 0.5s
        else if (currentTime > duration - 0.5) {
          const remaining = duration - currentTime;
          video.style.opacity = String(Math.max(remaining / 0.5, 0));
        }
        // Full opacity in between
        else {
          video.style.opacity = "1";
        }
      }

      rafRef.current = requestAnimationFrame(monitorPlayback);
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
      }, 100);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);
    rafRef.current = requestAnimationFrame(monitorPlayback);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="video-bg-container" aria-hidden="true">
      <video
        ref={videoRef}
        className="video-bg-element"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
        muted
        playsInline
        preload="auto"
      />
      {/* Gradient overlays for seamless blend */}
      <div className="video-gradient-top" />
      <div className="video-gradient-bottom" />
    </div>
  );
}

export default VideoBackground;

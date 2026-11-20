"use client";

import React, { useEffect, useRef, useState } from "react";

const ALBUM_VIDEOS = [
  {
    id: "video-1",
    src: "/videos/album/album-video-1.mp4",
    label: "Showcase Reel 1",
  },
  {
    id: "video-2",
    src: "/videos/album/album-video-2.mp4",
    label: "Showcase Reel 2",
  },
];

interface AlbumHeroVideoSlideshowProps {
  className?: string;
  fallbackImageSrc?: string;
}

/**
 * AlbumHeroVideoSlideshow
 *
 * A luxury two-video slideshow component for the Albums page hero.
 * Automatically alternates between two videos in a continuous loop
 * using native `ended` events with a smooth crossfade transition.
 */
export function AlbumHeroVideoSlideshow({
  className = "",
  fallbackImageSrc = "/images/album-hero.jpg",
}: AlbumHeroVideoSlideshowProps) {
  const [activeVideoIndex, setActiveVideoIndex] = useState<0 | 1>(0);
  const [videoErrors, setVideoErrors] = useState<{ [key: number]: boolean }>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const videoRef0 = useRef<HTMLVideoElement | null>(null);
  const videoRef1 = useRef<HTMLVideoElement | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Initialize and play the first video automatically
  useEffect(() => {
    const v0 = videoRef0.current;
    if (v0 && !prefersReducedMotion) {
      v0.muted = true;
      v0.play().catch(() => {
        // Autoplay policy or media not yet available; handled gracefully
      });
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [prefersReducedMotion]);

  // Transition handler when a video finishes playing
  const handleVideoEnded = (finishedIndex: 0 | 1) => {
    if (prefersReducedMotion) return;

    const nextIndex = finishedIndex === 0 ? 1 : 0;
    const nextVideo = nextIndex === 0 ? videoRef0.current : videoRef1.current;
    const currentVideo = finishedIndex === 0 ? videoRef0.current : videoRef1.current;

    // Start playing the incoming video immediately
    if (nextVideo) {
      nextVideo.muted = true;
      nextVideo.currentTime = 0;
      nextVideo.play().catch(() => {});
    }

    // Switch visual active index to trigger crossfade
    setActiveVideoIndex(nextIndex);

    // Pause the outgoing video only after the 700ms crossfade finishes to prevent black frames
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      if (currentVideo) {
        currentVideo.pause();
        currentVideo.currentTime = 0;
      }
    }, 750);
  };

  const handleVideoError = (index: number) => {
    setVideoErrors((prev) => ({ ...prev, [index]: true }));
  };

  // If both videos fail to load (e.g. before user manually places the MP4 files), display graceful studio fallback
  const allVideosUnavailable = videoErrors[0] && videoErrors[1];

  return (
    <div
      className={`relative aspect-[5/4] w-full overflow-hidden rounded-xl bg-[var(--studio-ivory-white)] ${className}`}
      aria-label="StudioFrame Luxury Photo Album Showcase"
    >
      {/* Video 1 */}
      <video
        ref={videoRef0}
        src={ALBUM_VIDEOS[0].src}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => handleVideoEnded(0)}
        onError={() => handleVideoError(0)}
        className={`absolute inset-0 h-full w-full rounded-xl object-cover transition-opacity duration-700 ease-in-out ${
          activeVideoIndex === 0 && !allVideosUnavailable
            ? "opacity-100 z-10"
            : "opacity-0 z-0 pointer-events-none"
        }`}
      />

      {/* Video 2 */}
      <video
        ref={videoRef1}
        src={ALBUM_VIDEOS[1].src}
        muted
        playsInline
        preload="auto"
        onEnded={() => handleVideoEnded(1)}
        onError={() => handleVideoError(1)}
        className={`absolute inset-0 h-full w-full rounded-xl object-cover transition-opacity duration-700 ease-in-out ${
          activeVideoIndex === 1 && !allVideosUnavailable
            ? "opacity-100 z-10"
            : "opacity-0 z-0 pointer-events-none"
        }`}
      />

      {/* Graceful Fallback / Standby Poster when video files are not yet present on disk */}
      {allVideosUnavailable && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
          <img
            src={fallbackImageSrc}
            alt="Premium hardcover photo album showcase"
            className="h-full w-full object-cover rounded-xl"
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg bg-[#292522]/80 px-4 py-2 backdrop-blur-md">
            <span className="text-xs font-medium text-white/90">
              Video Showcase Standby
            </span>
            <span className="text-[11px] text-[#C5A87D]">
              Awaiting album-video-1.mp4 & album-video-2.mp4
            </span>
          </div>
        </div>
      )}

      {/* Subtle Studio Showcase Indicator (Active when videos are playing) */}
      {!allVideosUnavailable && (
        <div className="pointer-events-none absolute bottom-3.5 right-3.5 z-20 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur-md">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
              activeVideoIndex === 0 ? "bg-[#B89B70]" : "bg-white/40"
            }`}
          />
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
              activeVideoIndex === 1 ? "bg-[#B89B70]" : "bg-white/40"
            }`}
          />
        </div>
      )}
    </div>
  );
}

export default AlbumHeroVideoSlideshow;


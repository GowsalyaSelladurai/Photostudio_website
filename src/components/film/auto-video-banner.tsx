"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { heroBanner } from "@/config/film.config";

const videos = heroBanner.videos;
const INTERVAL_MS = heroBanner.intervalMs;
const FADE_MS = 800;
/** The next video is rewound and paused this long before it is shown. */
const PREPARE_BEFORE_MS = 1200;
/** Start the loop even if a video never reports ready (slow network). */
const READY_FALLBACK_MS = 6000;
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const subscribeNever = () => () => {};

export function AutoVideoBanner() {
  // Videos are rendered client-side only, and not at all for visitors who
  // asked for reduced motion (they see the still poster instead).
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const reduceMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
  const [ready, setReady] = useState<boolean[]>(() => videos.map(() => false));
  const [fallbackElapsed, setFallbackElapsed] = useState(false);
  const [active, setActive] = useState(0);
  const players = useRef<(HTMLVideoElement | null)[]>([]);

  const playersEnabled = mounted && !reduceMotion;

  const markReady = useCallback((index: number) => {
    setReady((current) =>
      current[index]
        ? current
        : current.map((value, i) => (i === index ? true : value)),
    );
  }, []);

  const play = useCallback((index: number) => {
    const player = players.current[index];
    if (!player) return;
    player.muted = true;
    player.play().catch(() => {
      /* autoplay blocked: the poster stays visible */
    });
  }, []);

  const rewindAndPause = useCallback((index: number) => {
    const player = players.current[index];
    if (!player) return;
    player.pause();
    player.currentTime = 0;
  }, []);

  useEffect(() => {
    if (!playersEnabled) return;
    const fallback = window.setTimeout(
      () => setFallbackElapsed(true),
      READY_FALLBACK_MS,
    );
    return () => window.clearTimeout(fallback);
  }, [playersEnabled]);

  // The loop begins once every video can play (or the fallback elapsed).
  const started = playersEnabled && (ready.every(Boolean) || fallbackElapsed);

  // On start: the first video plays from 0, the others wait rewound and paused.
  useEffect(() => {
    if (!started) return;
    videos.forEach((_, index) => {
      if (index === 0) {
        const first = players.current[0];
        if (first) first.currentTime = 0;
        play(0);
      } else {
        rewindAndPause(index);
      }
    });
  }, [started, play, rewindAndPause]);

  // Every INTERVAL_MS: show the next video (already rewound), then pause the old one.
  useEffect(() => {
    if (!started || videos.length < 2) return;
    const next = (active + 1) % videos.length;

    const prepare = window.setTimeout(
      () => rewindAndPause(next),
      INTERVAL_MS - PREPARE_BEFORE_MS,
    );

    const swap = window.setTimeout(() => {
      play(next);
      setActive(next);
      window.setTimeout(() => rewindAndPause(active), FADE_MS + 100);
    }, INTERVAL_MS);

    return () => {
      window.clearTimeout(prepare);
      window.clearTimeout(swap);
    };
  }, [started, active, play, rewindAndPause]);

  return (
    <section
      aria-label="Featured wedding films"
      data-active-index={active}
      data-started={started}
      className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8"
    >
      <div className="relative isolate h-[260px] overflow-hidden rounded-2xl bg-[var(--color-ink)] shadow-xl shadow-black/15 ring-1 ring-black/10 sm:h-[360px] sm:rounded-3xl lg:h-[440px]">
        <Image
          src={heroBanner.poster}
          alt={heroBanner.posterAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {playersEnabled
          ? videos.map((video, index) => {
              const visible = ready[index] && active === index;
              return (
                <div
                  key={video.id}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity ease-in-out"
                  style={{
                    opacity: visible ? 1 : 0,
                    transitionDuration: `${FADE_MS}ms`,
                  }}
                >
                  <video
                    ref={(node) => {
                      players.current[index] = node;
                    }}
                    src={video.src}
                    poster={video.poster}
                    muted
                    playsInline
                    preload="auto"
                    tabIndex={-1}
                    disablePictureInPicture
                    onCanPlay={() => markReady(index)}
                    className="h-full w-full object-cover"
                  />
                </div>
              );
            })
          : null}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />

        <ul
          aria-label="Banner videos"
          className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2"
        >
          {videos.map((video, index) => (
            <li key={video.id}>
              <span
                aria-current={active === index ? "true" : undefined}
                className={`block h-1.5 rounded-full transition-all duration-500 ${
                  active === index
                    ? "w-10 bg-[var(--studio-champagne-gold)]"
                    : "w-5 bg-white/50"
                }`}
              />
              <span className="sr-only">{video.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

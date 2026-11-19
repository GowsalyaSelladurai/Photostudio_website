
"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type {
  FrameMaterialId,
  FrameOrientation,
} from "../../types/frame";
import {
  computePreviewLayout,
  formatInches,
} from "../../lib/frameStudio";
import SampleArtwork from "./SampleArtwork";

interface FramePreviewProps {
  widthIn: number;
  heightIn: number;
  orientation: FrameOrientation;
  frameMaterial: FrameMaterialId;
  artworkUrl: string | null;
  artworkName: string | null;
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function FramePreview({
  widthIn,
  heightIn,
  orientation,
  frameMaterial,
  artworkUrl,
  artworkName,
}: FramePreviewProps) {
  const [zoomed, setZoomed] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  const [position, setPosition] = useState({
    x: 50,
    y: 50,
  });

  const fieldRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<{
    pointerId: number;
    lastX: number;
    lastY: number;
  } | null>(null);

  const [field, setField] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useIsoLayoutEffect(() => {
    const element = fieldRef.current;
    if (!element) return;

    const measure = () => {
      const next = {
        width: element.clientWidth,
        height: element.clientHeight,
      };

      setField((previous) =>
        previous &&
        previous.width === next.width &&
        previous.height === next.height
          ? previous
          : next,
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const layout = useMemo(
    () =>
      field
        ? computePreviewLayout(
            widthIn,
            heightIn,
            field.width,
            field.height,
          )
        : null,
    [field, widthIn, heightIn],
  );

  const frameStyle = layout
    ? ({
        width: `${layout.widthPx}px`,
        height: `${layout.heightPx}px`,
        "--fs-moulding": `${layout.mouldingPx}px`,
        "--fs-mat": `${layout.matPx}px`,
      } as CSSProperties)
    : undefined;

  // Reset crop and zoom whenever a different photograph is selected.
  const [prevArtworkUrl, setPrevArtworkUrl] = useState(artworkUrl);
  if (prevArtworkUrl !== artworkUrl) {
    setPrevArtworkUrl(artworkUrl);
    setImageZoom(1);
    setPosition({ x: 50, y: 50 });
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (!artworkUrl) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
    };
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const rect = event.currentTarget.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;

    dragRef.current = {
      ...drag,
      lastX: event.clientX,
      lastY: event.clientY,
    };

    setPosition((current) => ({
      x: Math.max(
        0,
        Math.min(100, current.x - (deltaX / rect.width) * 100),
      ),
      y: Math.max(
        0,
        Math.min(100, current.y - (deltaY / rect.height) * 100),
      ),
    }));
  }

  function handlePointerEnd(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  function resetPhoto() {
    setPosition({ x: 50, y: 50 });
    setImageZoom(1);
  }

  const imageStyle: CSSProperties = {
    objectPosition: `${position.x}% ${position.y}%`,
    transform: `scale(${imageZoom})`,
    transformOrigin: "center",
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  };

  const orientationLabel =
    orientation === "portrait" ? "Portrait" : "Landscape";

  return (
    <div className="fs-stage" data-zoomed={zoomed}>
      <div className="fs-stage__light" aria-hidden="true" />

      <button
        type="button"
        className="fs-stage__zoom"
        aria-pressed={zoomed}
        onClick={() => setZoomed((value) => !value)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle
            cx="10.5"
            cy="10.5"
            r="6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="m15.5 15.5 5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        {zoomed ? "Zoom out" : "Zoom"}
      </button>

      <div className="fs-stage__field" ref={fieldRef}>
        <div
          className="fs-frame"
          style={frameStyle}
          data-ready={layout !== null}
          data-width-in={widthIn}
          data-height-in={heightIn}
        >
          <div
            className="fs-frame__wood"
            data-material={frameMaterial}
          >
            <div className="fs-frame__mat">
              <div
                className="fs-frame__art"
                data-draggable={Boolean(artworkUrl)}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
              >
                {artworkUrl ? (
                  // Local object URL; next/image is not required.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={artworkUrl}
                    alt={artworkName ?? "Your uploaded artwork"}
                    style={imageStyle}
                    draggable={false}
                  />
                ) : (
                  <SampleArtwork />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {artworkUrl && (
        <div className="fs-art-controls">
          <label className="fs-art-controls__zoom">
            <span>Photo zoom</span>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={imageZoom}
              onChange={(event) =>
                setImageZoom(Number(event.target.value))
              }
            />
          </label>

          <button
            type="button"
            className="fs-link-button"
            onClick={resetPhoto}
          >
            Reset photo
          </button>
        </div>
      )}

      <p className="fs-stage__caption" aria-live="polite">
        {formatInches(widthIn)} × {formatInches(heightIn)} in,{" "}
        {orientationLabel}
      </p>
    </div>
  );
}


"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { getAlbumPhoto } from "@/lib/album-photo-storage";

import type {
  AlbumProject,
  AlbumPhotoPlacement,
  AlbumTextElement,
  PhotoTransform,
  AlbumLayoutType,
  AlbumCornerRadius,
  AlbumPhotoShadow,
} from "@/types/album";

type AlbumPagePreviewProps = {
  project: AlbumProject;
  selectedPhotoPlacementId: string | null;
  onSelectPhoto: (placementId: string) => void;
  onTransformChange: (
    placementId: string,
    transform: PhotoTransform,
  ) => void;

  // Text editing props are optional until connected in the workspace.
  selectedTextId?: string | null;
  onSelectText?: (textId: string | null) => void;
  onTextPositionChange?: (
    textId: string,
    x: number,
    y: number,
  ) => void;
};

type PhotoDragState = {
  placementId: string;
  pointerId: number;
  lastX: number;
  lastY: number;
};

type TextDragState = {
  textId: string;
  pointerId: number;
  lastX: number;
  lastY: number;
};

export function AlbumPagePreview({
  project,
  selectedPhotoPlacementId,
  onSelectPhoto,
  onTransformChange,
  selectedTextId = null,
  onSelectText,
  onTextPositionChange,
}: AlbumPagePreviewProps) {
  const currentPage = project.pages[project.currentPageIndex];
  const placements = currentPage?.photos ?? [];
  const textElements = currentPage?.texts ?? [];

  const layout: AlbumLayoutType =
    currentPage?.layout ?? "single";

  const photoIdsKey = placements
    .map((item) => item.photoId)
    .join("|");

  const [imageUrls, setImageUrls] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const photoDragRef = useRef<PhotoDragState | null>(null);
  const textDragRef = useRef<TextDragState | null>(null);

  // Load photographs from IndexedDB.
  useEffect(() => {
    let cancelled = false;
    const createdUrls: string[] = [];

    async function loadImages() {
      setLoading(true);
      setImageUrls({});

      const entries = await Promise.all(
        placements.map(async (placement) => {
          const blob = await getAlbumPhoto(
            project.id,
            placement.photoId,
          );

          if (!blob) return null;

          const url = URL.createObjectURL(blob);
          createdUrls.push(url);

          return [placement.photoId, url] as const;
        }),
      );

      if (cancelled) {
        createdUrls.forEach((url) =>
          URL.revokeObjectURL(url),
        );
        return;
      }

      setImageUrls(
        Object.fromEntries(
          entries.filter(
            (
              entry,
            ): entry is readonly [string, string] =>
              entry !== null,
          ),
        ),
      );

      setLoading(false);
    }

    loadImages().catch(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;

      createdUrls.forEach((url) =>
        URL.revokeObjectURL(url),
      );
    };
  }, [project.id, photoIdsKey]);

  // Close fullscreen preview using Escape.
  useEffect(() => {
    if (!isFullscreen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isFullscreen]);

  // Album dimensions.
  const aspectRatio =
    project.orientation === "landscape"
      ? "3 / 2"
      : project.orientation === "square"
        ? "1 / 1"
        : "2 / 3";

  const photoCount = placements.length;
  const isFullBleed = layout === "full-bleed";

  // Page styling.
  const frameStyle = currentPage?.frameStyle ?? "none";
  const photoSpacing =
    currentPage?.photoSpacing ?? "balanced";

  const cornerRadius: AlbumCornerRadius =
    currentPage?.cornerRadius ?? "square";

  const photoShadow: AlbumPhotoShadow =
    currentPage?.photoShadow ?? "none";

  const spacingValue = {
    compact: "4px",
    balanced: "10px",
    spacious: "18px",
  }[photoSpacing];

  // Photo frame styling.
  function getFrameClass() {
    switch (frameStyle) {
      case "thin":
        return "border-2 border-white p-1";

      case "elegant":
        return "border-[3px] border-[#B99B70] p-1";

      case "polaroid":
        return "border border-[#E5E0D8] bg-white p-2";

      default:
        return "border-0 p-0";
    }
  }

  // Photo corner radius.
  function getCornerRadius(): string {
    switch (cornerRadius) {
      case "square":
        return "0px";

      case "subtle":
        return "8px";

      case "rounded":
        return "18px";

      default:
        return "0px";
    }
  }

  // Photo shadow.
  function getPhotoShadow(): string {
    switch (photoShadow) {
      case "none":
        return "none";

      case "soft":
        return "0 4px 12px rgba(35, 28, 20, 0.12)";

      case "premium":
        return "0 10px 24px rgba(35, 28, 20, 0.22), 0 2px 6px rgba(35, 28, 20, 0.10)";

      default:
        return "none";
    }
  }

  // Album page layouts.
  function getGridClass() {
    switch (layout) {
      case "single":
      case "full-bleed":
        return "grid-cols-1 grid-rows-1";

      case "two-photo":
        return "grid-cols-2 grid-rows-1";

      case "three-photo":
      case "four-grid":
        return "grid-cols-2 grid-rows-2";

      case "collage":
        return "grid-cols-4 grid-rows-3";
    }
  }

  // Individual photo positions.
  function getPhotoStyle(index: number): CSSProperties {
    if (layout === "three-photo") {
      if (photoCount === 1 && index === 0) {
        return {
          gridColumn: "1 / span 2",
          gridRow: "1 / span 2",
        };
      }

      if (index === 0) {
        return {
          gridColumn: "1",
          gridRow: "1 / span 2",
        };
      }
    }

    if (layout === "collage") {
      if (photoCount === 1 && index === 0) {
        return {
          gridColumn: "1 / span 4",
          gridRow: "1 / span 3",
        };
      }

      if (photoCount === 2) {
        return index === 0
          ? {
              gridColumn: "1 / span 2",
              gridRow: "1 / span 3",
            }
          : {
              gridColumn: "3 / span 2",
              gridRow: "1 / span 3",
            };
      }

      if (index === 0) {
        return {
          gridColumn: "1 / span 2",
          gridRow: "1 / span 2",
        };
      }
    }

    return {};
  }

  // Start photo dragging.
  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    placement: AlbumPhotoPlacement,
  ) {
    if (!event.isPrimary) return;

    event.preventDefault();
    event.stopPropagation();

    onSelectPhoto(placement.id);
    onSelectText?.(null);

    photoDragRef.current = {
      placementId: placement.id,
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  }

  // Move selected photograph.
  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
    placement: AlbumPhotoPlacement,
  ) {
    const drag = photoDragRef.current;

    if (
      !drag ||
      drag.placementId !== placement.id ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    const bounds =
      event.currentTarget.getBoundingClientRect();

    if (!bounds.width || !bounds.height) return;

    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;

    drag.lastX = event.clientX;
    drag.lastY = event.clientY;

    onTransformChange(placement.id, {
      ...placement.transform,
      x:
        placement.transform.x +
        (deltaX / bounds.width) * 100,
      y:
        placement.transform.y +
        (deltaY / bounds.height) * 100,
    });
  }

  // Finish photo dragging.
  function handlePhotoPointerUp(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      photoDragRef.current?.pointerId === event.pointerId
    ) {
      photoDragRef.current = null;
    }
  }

  // Start text dragging.
  function handleTextPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    text: AlbumTextElement,
  ) {
    if (!event.isPrimary) return;

    event.preventDefault();
    event.stopPropagation();

    onSelectText?.(text.id);
    onSelectPhoto("");

    textDragRef.current = {
      textId: text.id,
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  }

  // Move selected text.
  function handleTextPointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
    text: AlbumTextElement,
  ) {
    const drag = textDragRef.current;

    if (
      !drag ||
      drag.textId !== text.id ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    const pageBounds =
      event.currentTarget.parentElement?.getBoundingClientRect();

    if (!pageBounds?.width || !pageBounds.height) return;

    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;

    drag.lastX = event.clientX;
    drag.lastY = event.clientY;

    const nextX = Math.max(
      0,
      Math.min(100, text.x + (deltaX / pageBounds.width) * 100),
    );

    const nextY = Math.max(
      0,
      Math.min(100, text.y + (deltaY / pageBounds.height) * 100),
    );

    onTextPositionChange?.(text.id, nextX, nextY);
  }

  // Finish text dragging.
  function handleTextPointerUp(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      textDragRef.current?.pointerId === event.pointerId
    ) {
      textDragRef.current = null;
    }
  }

  // Text font family.
  function getTextFontFamily(text: AlbumTextElement) {
    switch (text.fontFamily ?? "serif") {
      case "sans":
        return "Arial, Helvetica, sans-serif";

      case "elegant":
        return '"Palatino Linotype", "Book Antiqua", Palatino, serif';

      case "serif":
      default:
        return 'Georgia, "Times New Roman", serif';
    }
  }

  // Text visual styling.
  function getTextStyle(
    text: AlbumTextElement,
  ): CSSProperties {
    return {
      position: "absolute",
      left: `${text.x}%`,
      top: `${text.y}%`,
      transform: `translate(-50%, -50%) rotate(${text.rotation}deg)`,
      fontFamily: getTextFontFamily(text),
      fontSize: `${text.fontSize}px`,
      color: text.color ?? "#292522",
      fontWeight: text.fontWeight ?? "normal",
      fontStyle: text.italic ? "italic" : "normal",
      textAlign: text.textAlign ?? "center",
      whiteSpace: "pre-wrap",
      overflowWrap: "anywhere",
    };
  }

  // Album page preview.
  const previewPage = (
    <div
      className={`relative isolate grid w-full max-w-2xl overflow-hidden shadow-xl ${
        isFullBleed ? "p-0" : "p-3 sm:p-5"
      } ${getGridClass()}`}
      style={{
        aspectRatio,
        background:
          currentPage?.background ?? "#F5F0E8",
        gap: isFullBleed ? "0px" : spacingValue,
        gridAutoRows: "minmax(0, 1fr)",
      }}
    >
      {photoCount === 0 ? (
        <div className="col-span-full row-span-full flex flex-col items-center justify-center px-5 text-center">
          <span className="text-4xl text-[#B99B70]">
            ＋
          </span>

          <p className="mt-3 font-serif text-xl text-[var(--color-ink)]">
            Your story starts here
          </p>

          <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--color-muted)]">
            Choose a photograph from your photo library
            and add it to this page to see your design.
          </p>
        </div>
      ) : (
        placements.map((placement, index) => {
          const isSelected =
            selectedPhotoPlacementId === placement.id;

          const transform = placement.transform;

          return (
            <div
              key={placement.id}
              className={`relative z-10 min-h-0 min-w-0 touch-none select-none overflow-hidden ${
                getFrameClass()
              } ${
                isSelected
                  ? "ring-2 ring-inset ring-[#B99B70]"
                  : "ring-1 ring-inset ring-black/5"
              }`}
              style={{
                ...getPhotoStyle(index),
                borderRadius: getCornerRadius(),
                boxShadow: getPhotoShadow(),
              }}
              onPointerDown={(event) =>
                handlePointerDown(event, placement)
              }
              onPointerMove={(event) =>
                handlePointerMove(event, placement)
              }
              onPointerUp={handlePhotoPointerUp}
              onPointerCancel={handlePhotoPointerUp}
              onLostPointerCapture={handlePhotoPointerUp}
              onContextMenu={(event) =>
                event.preventDefault()
              }
              title="Select and drag to reposition this photograph"
            >
              {imageUrls[placement.photoId] ? (
                <img
                  src={imageUrls[placement.photoId]}
                  alt="Album photograph"
                  draggable={false}
                  className="pointer-events-none h-full w-full object-cover"
                  style={{
                    transform: `translate(${transform.x}%, ${transform.y}%) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
                    objectPosition: `${50 + transform.cropX}% ${50 + transform.cropY}%`,
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--color-muted)]">
                  {loading
                    ? "Loading photo..."
                    : "Photo unavailable"}
                </div>
              )}

              {isSelected && (
                <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-[#171717]/80 px-2.5 py-1 text-[10px] font-semibold text-white">
                  Selected · Drag to move
                </span>
              )}
            </div>
          );
        })
      )}

      {/* Text overlay layer */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {textElements.map((text) => {
          const isSelected = selectedTextId === text.id;

          return (
            <div
              key={text.id}
              className={`pointer-events-auto absolute max-w-[85%] cursor-grab touch-none select-none active:cursor-grabbing ${
                isSelected
                  ? "rounded-sm outline outline-1 outline-dashed outline-[#B99B70] outline-offset-4"
                  : ""
              }`}
              style={getTextStyle(text)}
              onPointerDown={(event) =>
                handleTextPointerDown(event, text)
              }
              onPointerMove={(event) =>
                handleTextPointerMove(event, text)
              }
              onPointerUp={handleTextPointerUp}
              onPointerCancel={handleTextPointerUp}
              onLostPointerCapture={handleTextPointerUp}
              title="Select and drag to reposition this text"
            >
              {text.text || " "}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section
      className={
        isFullscreen
          ? "fixed inset-0 z-[100] flex h-dvh flex-col overflow-y-auto bg-[#171717] p-4 sm:p-8"
          : "flex min-w-0 flex-col rounded-3xl border border-[var(--color-line)] bg-white p-5 sm:p-7"
      }
      role={isFullscreen ? "dialog" : undefined}
      aria-modal={isFullscreen ? true : undefined}
      aria-label={
        isFullscreen
          ? "Fullscreen album preview"
          : undefined
      }
    >
      {/* Preview toolbar */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.16em] ${
              isFullscreen
                ? "text-[#B99B70]"
                : "text-[var(--color-clay)]"
            }`}
          >
            Live preview
          </p>

          <h2
            className={`mt-1 font-serif text-xl ${
              isFullscreen
                ? "text-white"
                : "text-[var(--color-ink)]"
            }`}
          >
            Page {project.currentPageIndex + 1}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1.5 text-xs ${
              isFullscreen
                ? "bg-white/10 text-white"
                : "bg-[var(--studio-warm-beige)] text-[var(--studio-deep-charcoal)]"
            }`}
          >
            {photoCount}{" "}
            {photoCount === 1 ? "photo" : "photos"}
          </span>

          <button
            type="button"
            onClick={() =>
              setIsFullscreen((current) => !current)
            }
            aria-label={
              isFullscreen
                ? "Close fullscreen preview"
                : "Open fullscreen preview"
            }
            className={`rounded-full border p-2.5 transition ${
              isFullscreen
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--studio-champagne-gold)]"
            }`}
          >
            {isFullscreen ? "✕" : "⛶"}
          </button>
        </div>
      </div>

      {/* Album page */}
      <div
        className={`flex flex-1 items-center justify-center rounded-2xl p-4 sm:p-7 ${
          isFullscreen
            ? "bg-[#292522]"
            : "bg-[#EAE7E1]"
        }`}
      >
        {previewPage}
      </div>

      <p
        className={`mt-4 text-center text-xs ${
          isFullscreen
            ? "text-white/60"
            : "text-[var(--color-muted)]"
        }`}
      >
        {isFullscreen
          ? "Press Escape or use the close button to return to the editor."
          : "Select a photo or text to edit it. Drag it to reposition."}
      </p>
    </section>
  );
}

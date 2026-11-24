"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";

import { albumConfig, getAlbumSizeOption } from "@/config/album.config";
import { albumPricing } from "@/config/studio.config";
import { calculateAlbumPrice, formatAlbumPrice } from "@/lib/album-price";
import { getAlbumProject, saveAlbumProject } from "@/lib/album-storage";
import {
  deleteAlbumPhoto,
  getAlbumPhoto,
  saveAlbumPhoto,
} from "@/lib/album-photo-storage";
import { analyzePhotoBlob } from "@/lib/ai/smart-fit-client";
import { distributePhotosAcrossAlbum } from "@/lib/album-auto-layout";
import { computePageLayoutSlots } from "@/lib/album-page-canvas";
import { calculateSmartCrop } from "@/lib/ai/smart-crop-engine";
import type {
  AlbumCoverFinish,
  AlbumLayoutType,
  AlbumOrientation,
  AlbumPhoto,
  AlbumPhotoPlacement,
  AlbumProject,
  PhotoTransform,
} from "@/types/album";

/**
 * Miniature 3D isometric book preview for album size selection
 */
function MiniAlbumBookPreview({ sizeId }: { sizeId: string }) {
  let w = 36;
  let h = 36;

  if (sizeId === "4x4") {
    w = 34;
    h = 34;
  } else if (sizeId === "10x4") {
    w = 44;
    h = 24;
  } else if (sizeId === "classic") {
    w = 28;
    h = 40;
  } else if (sizeId === "premium") {
    w = 32;
    h = 38;
  } else if (sizeId === "12x8") {
    w = 40;
    h = 28;
  } else if (sizeId === "grand") {
    w = 28;
    h = 42;
  }

  return (
    <div className="relative flex h-11 w-12 items-center justify-center flex-shrink-0">
      <div
        className="absolute -bottom-0.5 rounded-full bg-[#3D352E]/15 blur-[2px]"
        style={{ width: `${w + 4}px`, height: "6px" }}
      />
      <svg
        width={w + 6}
        height={h + 4}
        viewBox={`0 0 ${w + 6} ${h + 4}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id={`cov-${sizeId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFD7CB" />
            <stop offset="100%" stopColor="#B3A796" />
          </linearGradient>
          <linearGradient id={`spn-${sizeId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9C8F7E" />
            <stop offset="100%" stopColor="#C4B9A9" />
          </linearGradient>
        </defs>
        <rect x="2" y="3" width={w} height={h} rx="1.5" fill="#A89A88" opacity="0.7" />
        <rect x="1" y="2" width={w - 1} height={h} rx="1.5" fill={`url(#cov-${sizeId})`} stroke="#B5A897" strokeWidth="0.6" />
        <rect x="1" y="2" width="3.5" height={h} rx="1" fill={`url(#spn-${sizeId})`} />
      </svg>
    </div>
  );
}

/**
 * Cover finish swatch preview
 */
function CoverFinishSwatch({ finish }: { finish: AlbumCoverFinish }) {
  if (finish === "linen") {
    return (
      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-[#D5CAA8] bg-[#E8E0D2] shadow-sm">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(#C4B59D 1px, transparent 1px), radial-gradient(#C4B59D 1px, #E8E0D2 1px)",
            backgroundSize: "3px 3px",
            backgroundPosition: "0 0, 1.5px 1.5px",
          }}
        />
      </div>
    );
  }

  if (finish === "leather") {
    return (
      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-[#946237] bg-[#7A4B23] shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/20" />
      </div>
    );
  }

  return (
    <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-[#CFC5B4] bg-[#F5EFE6] shadow-sm">
      <img
        src="/images/booking-editorial.png"
        alt="Printed photo cover sample"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function AlbumEditorWorkspace({ projectId }: { projectId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);

  const [project, setProject] = useState<AlbumProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  // Photo management modal state & drag-to-reorder state
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Load project metadata
  useEffect(() => {
    const savedProject = getAlbumProject(projectId);
    setProject(savedProject);
    setLoading(false);
  }, [projectId]);

  // Load preview thumbnails for uploaded photographs
  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    const createdUrls: string[] = [];

    async function loadThumbnails() {
      const urlMap: Record<string, string> = {};

      for (const photo of project!.photos) {
        const blob = await getAlbumPhoto(project!.id, photo.id);
        if (blob && !cancelled) {
          const url = URL.createObjectURL(blob);
          createdUrls.push(url);
          urlMap[photo.id] = url;
        }
      }

      if (!cancelled) {
        setPreviewUrls(urlMap);
      }
    }

    void loadThumbnails();

    return () => {
      cancelled = true;
      createdUrls.forEach(URL.revokeObjectURL);
    };
  }, [project?.id, project?.photos]);

  async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    if (typeof createImageBitmap === "function") {
      try {
        const bitmap = await createImageBitmap(file);
        const dims = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        return dims;
      } catch {
        // Fallback below
      }
    }

    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth || 1200, height: img.naturalHeight || 800 });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 1200, height: 800 });
      };
      img.src = url;
    });
  }

  async function handleFiles(fileList: FileList | File[]) {
    if (uploading || !project) return;
    setError("");

    const files = Array.from(fileList);
    if (files.length === 0) return;

    const remainingSlots = albumConfig.maxPhotos - project.photos.length;
    if (remainingSlots <= 0) {
      setError(`You have reached the maximum limit of ${albumConfig.maxPhotos} photographs.`);
      return;
    }

    if (files.length > remainingSlots) {
      setError(`You can only add ${remainingSlots} more photo(s) to this album.`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!albumConfig.allowedFormats.includes(file.type as never)) {
        setError(`${file.name}: only JPEG, PNG, and WebP images are supported.`);
        return;
      }
      if (file.size > albumConfig.maxFileSizeMB * 1024 * 1024) {
        setError(`${file.name} exceeds the maximum file size of ${albumConfig.maxFileSizeMB} MB.`);
        return;
      }
      if (file.size === 0) {
        setError(`${file.name} is an empty file.`);
        return;
      }
      validFiles.push(file);
    }

    setUploading(true);
    const addedPhotos: AlbumPhoto[] = [];
    const addedIds: string[] = [];

    try {
      for (const file of validFiles) {
        const dims = await getImageDimensions(file);
        const photoId = crypto.randomUUID();

        await saveAlbumPhoto(project.id, photoId, file);
        addedIds.push(photoId);

        addedPhotos.push({
          id: photoId,
          fileName: file.name,
          url: "",
          width: dims.width,
          height: dims.height,
          fileSize: file.size,
          uploadedAt: Date.now(),
        });
      }

      const updatedProject: AlbumProject = {
        ...project,
        photos: [...project.photos, ...addedPhotos],
        updatedAt: Date.now(),
      };

      try {
        saveAlbumProject(updatedProject);
      } catch (saveError) {
        await Promise.all(addedIds.map((id) => deleteAlbumPhoto(project.id, id)));
        throw saveError;
      }

      setProject(updatedProject);

      // Asynchronously trigger AI Smart Fit analysis in the background
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const photoId = addedIds[i];
        void analyzePhotoBlob(file, photoId)
          .then((smartFit) => {
            setProject((curr) => {
              if (!curr) return curr;
              const latestPhotos = curr.photos.map((p) =>
                p.id === photoId ? { ...p, smartFit } : p,
              );
              const enriched: AlbumProject = {
                ...curr,
                photos: latestPhotos,
                updatedAt: Date.now(),
              };
              try {
                saveAlbumProject(enriched);
              } catch (err) {
                console.warn("Could not save AI-enriched project:", err);
              }
              return enriched;
            });
          })
          .catch((err) => {
            console.warn("SmartFit: Analysis warning:", err);
          });
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload photographs. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      void handleFiles(event.target.files);
      event.target.value = "";
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) {
      void handleFiles(event.dataTransfer.files);
    }
  }

  async function handleRemovePhoto(photoId: string) {
    if (!project) return;
    setError("");

    const updatedProject: AlbumProject = {
      ...project,
      photos: project.photos.filter((p) => p.id !== photoId),
      coverPhotoId: project.coverPhotoId === photoId ? null : project.coverPhotoId,
      updatedAt: Date.now(),
    };

    try {
      saveAlbumProject(updatedProject);
      setProject(updatedProject);

      const url = previewUrls[photoId];
      if (url) {
        URL.revokeObjectURL(url);
      }
      setPreviewUrls((prev) => {
        const next = { ...prev };
        delete next[photoId];
        return next;
      });

      await deleteAlbumPhoto(project.id, photoId);
    } catch {
      setError("Unable to remove photograph. Please try again.");
    }
  }

  function handleSetCoverPhoto(photoId: string) {
    if (!project) return;
    const nextCover = project.coverPhotoId === photoId ? null : photoId;
    const updated: AlbumProject = {
      ...project,
      coverPhotoId: nextCover,
      updatedAt: Date.now(),
    };
    saveAlbumProject(updated);
    setProject(updated);
  }

  // Size selection
  function handleSelectSize(sizeId: string) {
    if (!project || project.sizeId === sizeId) return;
    const sizeConfig = albumPricing.sizes.find((s) => s.id === sizeId);
    const orientation: AlbumOrientation = sizeConfig
      ? sizeConfig.width === sizeConfig.height
        ? "square"
        : sizeConfig.width > sizeConfig.height
          ? "landscape"
          : "portrait"
      : project.orientation;

    // If pages already exist, re-calculate crops for the newly selected album size
    let updatedPages = project.pages;
    if (project.pages && project.pages.length > 0) {
      const sizeOpt = getAlbumSizeOption(sizeId);
      const targetAspect = sizeOpt.width / sizeOpt.height;
      const pageW = targetAspect >= 1 ? 1200 : Math.round(1800 * targetAspect);
      const pageH = Math.round(pageW / targetAspect);

      updatedPages = project.pages.map((page) => {
        const slots = computePageLayoutSlots(
          page.layout,
          page.photos.length,
          pageW,
          pageH,
          page.photoSpacing ?? "balanced",
        );

        const updatedPhotos = page.photos.map((placement, idx) => {
          const photoMeta = project.photos.find((p) => p.id === placement.photoId);
          if (photoMeta?.smartFit) {
            const slot = slots[idx] ?? { index: idx, x: 0, y: 0, width: pageW, height: pageH };
            const smartResult = calculateSmartCrop(
              photoMeta.width,
              photoMeta.height,
              slot.width,
              slot.height,
              photoMeta.smartFit.subjects,
            );
            return {
              ...placement,
              transform: {
                ...placement.transform,
                cropX: smartResult.cropX,
                cropY: smartResult.cropY,
                fitMode: smartResult.fitMode,
              },
            };
          }
          return placement;
        });

        return {
          ...page,
          photos: updatedPhotos,
        };
      });
    }

    const updated: AlbumProject = {
      ...project,
      sizeId,
      orientation,
      pages: updatedPages,
      updatedAt: Date.now(),
    };
    saveAlbumProject(updated);
    setProject(updated);
  }

  // Cover finish selection
  function handleSelectFinish(finish: AlbumCoverFinish) {
    if (!project || project.coverFinish === finish) return;
    const updated: AlbumProject = {
      ...project,
      coverFinish: finish,
      updatedAt: Date.now(),
    };
    saveAlbumProject(updated);
    setProject(updated);
  }

  // Reordering photos (persists immediately)
  function handleReorderPhotos(fromIndex: number, toIndex: number) {
    if (!project || fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= project.photos.length || toIndex >= project.photos.length) return;

    const nextPhotos = [...project.photos];
    const [moved] = nextPhotos.splice(fromIndex, 1);
    nextPhotos.splice(toIndex, 0, moved);

    const updated: AlbumProject = {
      ...project,
      photos: nextPhotos,
      updatedAt: Date.now(),
    };

    saveAlbumProject(updated);
    setProject(updated);
  }

  async function handleLiveView() {
    if (!project) return;
    setError("");

    if (project.photos.length === 0) {
      setError("Please upload at least one photograph to generate your album.");
      return;
    }

    const maxCapacity = project.pageCount * 6;
    if (project.photos.length > maxCapacity) {
      setError(
        `Too many photographs selected: ${project.photos.length} photos provided, but a ${project.pageCount}-page album can hold at most ${maxCapacity} photos (maximum 6 photos per page). Please remove ${project.photos.length - maxCapacity} photo(s).`,
      );
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Generate pages automatically via Phase 1 Engine
      const generatedPages = distributePhotosAcrossAlbum(
        project.photos,
        project.pageCount,
        {
          defaultBackground: "#F5F0E8",
          fullBleedRatio: 0.25,
          sizeId: project.sizeId,
        },
      );

      // 2. Persist generated album project
      const updatedProject: AlbumProject = {
        ...project,
        pages: generatedPages,
        updatedAt: Date.now(),
      };

      saveAlbumProject(updatedProject);
      setProject(updatedProject);

      // 3. Open the separate 3D Live View route
      router.push(`/albums/preview/${project.id}`);
    } catch (genError) {
      setError(
        genError instanceof Error
          ? genError.message
          : "Unable to generate album. Please check your photograph collection.",
      );
      setIsGenerating(false);
    }
  }

  const selectedSizeOption = useMemo(
    () =>
      albumConfig.sizes.find((s) => s.id === project?.sizeId) ??
      albumPricing.sizes.find((s) => s.id === project?.sizeId),
    [project?.sizeId],
  );

  const selectedFinishOption = useMemo(
    () => albumConfig.coverFinishes.find((f) => f.id === project?.coverFinish),
    [project?.coverFinish],
  );

  const totalPrice = useMemo(() => {
    if (!project) return 0;
    return calculateAlbumPrice(
      project.sizeId,
      project.pageCount,
      project.coverFinish,
    );
  }, [project?.sizeId, project?.pageCount, project?.coverFinish]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--studio-ivory-white)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B99B70] border-t-transparent" />
          <p className="font-serif text-lg text-[var(--color-ink)]">Loading your album project...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[var(--studio-ivory-white)]">
        <h1 className="font-serif text-3xl text-[var(--color-ink)]">Album not found</h1>
        <button
          type="button"
          onClick={() => router.push("/albums")}
          className="rounded-full bg-[#B99B70] px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#D0B48A]"
        >
          Back to albums
        </button>
      </main>
    );
  }

  const firstFivePhotos = project.photos.slice(0, 5);

  return (
    <main className="min-h-screen bg-[var(--studio-ivory-white)] text-[var(--color-ink)]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E8DDCE] bg-[#FAF7F2]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8C8075]">
              <span className="h-px w-6 bg-[#C4A882]" aria-hidden="true" />
              <span>StudioFrame Customization</span>
              <span className="h-px w-6 bg-[#C4A882]" aria-hidden="true" />
            </p>
            <h1 className="mt-0.5 font-serif text-2xl sm:text-3xl font-medium text-[var(--studio-deep-charcoal)]">
              {project.name || "My Photo Album"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLiveView}
              disabled={isGenerating || uploading || project.photos.length === 0}
              className="flex items-center gap-2 rounded-full bg-[#C4A882] px-6 py-2.5 text-xs font-semibold text-[#171717] shadow-sm transition hover:bg-[#B59872] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#171717] border-t-transparent" />
                  <span>Generating Album...</span>
                </>
              ) : (
                <>
                  <span>Live View</span>
                  <span>▶</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/albums")}
              className="rounded-full border border-[#DED4C5] bg-white px-5 py-2.5 text-xs font-semibold text-[#292522] transition hover:border-[var(--studio-champagne-gold)]"
            >
              Back to albums
            </button>
          </div>
        </div>
      </header>

      {/* Main Customization Section */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Error notification */}
        {error && (
          <div
            className="mb-6 rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-800 border border-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Responsive Three-Column Layout: Specifications, Upload, and Photo Gallery */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
          {/* Column 1: Album Specifications (Size & Cover Finish) */}
          <div className="rounded-[24px] border border-[#E4D9C8] bg-[#FCFAF7] p-5 sm:p-6 shadow-[0_4px_24px_rgba(41,37,34,0.03)] flex flex-col justify-between">
            <div>
              <div className="border-b border-[#E8DDCE] pb-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--studio-champagne-gold)]">
                  01 / Album Size & Finish
                </p>
                <h2 className="mt-1 font-serif text-2xl font-medium text-[var(--studio-deep-charcoal)]">
                  Album Specifications
                </h2>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                  Choose physical dimensions and cover material
                </p>
              </div>

              {/* Album Size Selection */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--studio-deep-charcoal)]">
                    Album size
                  </label>
                  <span className="text-[11px] font-bold text-[#A67C4A] uppercase">
                    {project.sizeId}
                  </span>
                </div>

                <div className="space-y-2">
                  {albumConfig.sizes.map((size) => {
                    const isSelected = project.sizeId === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => handleSelectSize(size.id)}
                        className={`group relative flex w-full items-center justify-between rounded-xl p-2.5 sm:p-3 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-[1.5px] border-[var(--studio-champagne-gold)] bg-[#F5EFE6] shadow-sm"
                            : "border border-[#E4D9C8] bg-white hover:border-[var(--studio-champagne-gold)]/60 hover:bg-[#FDFBF7]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <MiniAlbumBookPreview sizeId={size.id} />
                          <div className="min-w-0">
                            <span className="block truncate text-xs sm:text-sm font-semibold tracking-tight text-[var(--studio-deep-charcoal)]">
                              {size.label}
                            </span>
                            <span className="block text-[10px] text-[var(--color-muted)]">
                              {size.width} × {size.height} inches
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-[var(--studio-deep-charcoal)]">
                            {formatAlbumPrice(size.amount)}
                          </span>
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded-full transition ${
                              isSelected
                                ? "bg-[#A67C4A] text-white"
                                : "border border-[#DED4C5] bg-white"
                            }`}
                          >
                            {isSelected && (
                              <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="m3.5 8.5 3 3 6-7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cover Finish Selection */}
            <div className="mt-5 border-t border-[#E8DDCE] pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--studio-deep-charcoal)]">
                  Cover finish
                </label>
                <span className="text-[11px] font-semibold text-[#A67C4A] capitalize">
                  {selectedFinishOption?.label ?? project.coverFinish}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {albumConfig.coverFinishes.map((finish) => {
                  const isSelected = project.coverFinish === finish.id;
                  return (
                    <button
                      key={finish.id}
                      type="button"
                      onClick={() => handleSelectFinish(finish.id as AlbumCoverFinish)}
                      className={`relative flex flex-col items-center rounded-xl p-2 text-center transition-all duration-200 ${
                        isSelected
                          ? "border-[1.5px] border-[var(--studio-champagne-gold)] bg-[#F5EFE6] shadow-sm"
                          : "border border-[#E4D9C8] bg-white hover:border-[var(--studio-champagne-gold)]/60 hover:bg-[#FDFBF7]"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#A67C4A] text-white shadow-sm">
                          <svg viewBox="0 0 16 16" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="m3.5 8.5 3 3 6-7" />
                          </svg>
                        </span>
                      )}

                      <CoverFinishSwatch finish={finish.id as AlbumCoverFinish} />

                      <span className="mt-1.5 block text-[11px] font-semibold text-[var(--studio-deep-charcoal)] leading-tight">
                        {finish.label}
                      </span>
                      <span className="mt-0.5 line-clamp-1 text-[9px] text-[var(--color-muted)] leading-tight">
                        {finish.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Photo Upload Area */}
          <div className="rounded-[24px] border border-[#E4D9C8] bg-[#FCFAF7] p-5 sm:p-6 shadow-[0_4px_24px_rgba(41,37,34,0.03)] flex flex-col justify-between">
            <div>
              <div className="border-b border-[#E8DDCE] pb-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--studio-champagne-gold)]">
                  02 / Photo Upload
                </p>
                <h2 className="mt-1 font-serif text-2xl font-medium text-[var(--studio-deep-charcoal)]">
                  Upload Photographs
                </h2>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                  Auto-composed across {project.pageCount} pages
                </p>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept={albumConfig.allowedFormats.join(",")}
                multiple
                onChange={handleInputChange}
                className="hidden"
              />

              {/* Upload Dropzone Box */}
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                    setDragging(false);
                  }
                }}
                onDrop={handleDrop}
                className={`mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all min-h-[380px] ${
                  dragging
                    ? "border-[var(--studio-champagne-gold)] bg-[#F5EFE6]"
                    : "border-[#DED4C5] bg-[#F7F2EA]/45"
                }`}
              >
                {/* Cloud Upload Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#B89B70] shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                    <path d="M12 12v9" />
                    <path d="m16 16-4-4-4 4" />
                  </svg>
                </div>

                <h3 className="mt-3 font-serif text-base font-semibold text-[var(--studio-deep-charcoal)]">
                  {uploading
                    ? "Uploading your photographs..."
                    : "Drag and drop photographs here"}
                </h3>

                <p className="mt-1 max-w-xs text-xs text-[var(--color-muted)] leading-relaxed">
                  Supports JPG, PNG and WebP files up to {albumConfig.maxFileSizeMB} MB each.
                </p>

                <span className="my-2 text-[11px] text-[#8C8075]">or</span>

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading || project.photos.length >= albumConfig.maxPhotos}
                  className="flex items-center gap-2 rounded-full bg-[var(--studio-midnight-black)] px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--studio-deep-charcoal)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                  </svg>
                  <span>{uploading ? "Uploading..." : "Choose Files from Device"}</span>
                </button>

                {/* Polaroid Fanned-out Photo Graphics (from reference design) */}
                <div className="relative mt-6 flex h-20 w-full items-center justify-center">
                  {/* Polaroid 1 (Tilted Left) */}
                  <div className="absolute -translate-x-10 -rotate-12 transform overflow-hidden rounded-md border-2 border-white bg-white p-1 shadow-md transition-transform duration-200 hover:scale-105">
                    <img
                      src="/images/booking-editorial.png"
                      alt="Sample photograph"
                      className="h-14 w-12 object-cover"
                    />
                    <div className="h-2.5 bg-white" />
                  </div>

                  {/* Polaroid 2 (Center) */}
                  <div className="absolute z-10 overflow-hidden rounded-md border-2 border-white bg-white p-1 shadow-lg transition-transform duration-200 hover:scale-105">
                    <img
                      src="/images/default-frame-photo.jpeg"
                      alt="Sample photograph"
                      className="h-16 w-13 object-cover"
                    />
                    <div className="h-3 bg-white" />
                  </div>

                  {/* Polaroid 3 (Tilted Right) */}
                  <div className="absolute translate-x-10 rotate-12 transform overflow-hidden rounded-md border-2 border-white bg-white p-1 shadow-md transition-transform duration-200 hover:scale-105">
                    <img
                      src="/images/frame-preview-2.jpeg"
                      alt="Sample photograph"
                      className="h-14 w-12 object-cover"
                    />
                    <div className="h-2.5 bg-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-[#E4D9C8] bg-[#F2ECE1] py-1.5 px-4 text-center text-[11px] text-[#7A6E60]">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Drop images anywhere inside the dashed box</span>
            </div>
          </div>

          {/* Column 3: Uploaded Photo Gallery & Selection Summary */}
          <div className="rounded-[24px] border border-[#E4D9C8] bg-[#FCFAF7] p-5 sm:p-6 shadow-[0_4px_24px_rgba(41,37,34,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between border-b border-[#E8DDCE] pb-3.5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--studio-champagne-gold)]">
                    03 / Photo Gallery
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-medium text-[var(--studio-deep-charcoal)]">
                    Selected Photos
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {project.photos.length === 0
                      ? "First thumbnails preview"
                      : `First ${firstFivePhotos.length} thumbnails · ${project.photos.length} uploaded`}
                  </p>
                </div>

                {project.photos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsManageModalOpen(true)}
                    className="rounded-full border border-[#DED4C5] bg-[#F7F2EA] px-3.5 py-1 text-xs font-semibold text-[var(--studio-deep-charcoal)] transition hover:bg-[#EFE7DA]"
                  >
                    Manage ({project.photos.length})
                  </button>
                )}
              </div>

              {project.photos.length === 0 ? (
                <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DED4C5] bg-[#F7F2EA]/40 p-6 text-center min-h-[170px]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-base text-[#8C8075] shadow-sm">
                    📷
                  </div>
                  <p className="mt-2.5 font-serif text-sm font-medium text-[var(--studio-deep-charcoal)]">
                    No photographs selected yet
                  </p>
                  <p className="mt-1 max-w-[200px] text-[11px] text-[var(--color-muted)]">
                    Upload photographs in Section 02 to preview them here.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {firstFivePhotos.map((photo, index) => {
                    const isCover = project.coverPhotoId === photo.id;
                    const url = previewUrls[photo.id];

                    return (
                      <div
                        key={photo.id}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-[#E4D9C8] bg-white shadow-sm transition hover:shadow-md"
                      >
                        {url ? (
                          <img
                            src={url}
                            alt={photo.fileName}
                            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-[var(--color-muted)]">
                            Loading...
                          </div>
                        )}

                        {/* Photo Index Indicator Badge */}
                        <span className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[9px] font-semibold text-white backdrop-blur-sm">
                          {index + 1}
                        </span>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => void handleRemovePhoto(photo.id)}
                          title="Remove photo"
                          aria-label={`Remove photo ${photo.fileName}`}
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-bold text-white transition hover:bg-red-600"
                        >
                          ✕
                        </button>

                        {/* Cover Photo Badge */}
                        {isCover && (
                          <span className="absolute bottom-1 left-1 rounded bg-[#B99B70] px-1.5 py-0.5 text-[8px] font-bold text-[#171717]">
                            Cover
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* 6th Slot: View All Tile */}
                  <button
                    type="button"
                    onClick={() => setIsManageModalOpen(true)}
                    className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-[#B89B70] bg-[#FAF6F0] p-2 text-center transition hover:bg-[#F2EAE0]"
                  >
                    <span className="text-xl font-bold text-[#B89B70]">+</span>
                    <span className="mt-0.5 text-[10px] font-semibold text-[var(--studio-deep-charcoal)]">
                      View All ({project.photos.length})
                    </span>
                    <span className="text-[8px] text-[var(--color-muted)]">
                      Manage & reorder
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Embedded Specification Summary & CTA */}
            <div className="mt-6 border-t border-[#E8DDCE] pt-4">
              <div className="space-y-3">
                {/* Size */}
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#8C8075]" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 3H3v18h18V3Z" />
                      <path d="M9 3v18M3 9h18" />
                    </svg>
                  </span>
                  <div>
                    <span className="block text-[11px] text-[#8C8075]">Album size</span>
                    <span className="block text-xs font-semibold text-[var(--studio-deep-charcoal)]">
                      {selectedSizeOption?.label}
                    </span>
                  </div>
                </div>

                {/* Pages */}
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#8C8075]" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M7 7h10M7 12h10M7 17h6" />
                    </svg>
                  </span>
                  <div>
                    <span className="block text-[11px] text-[#8C8075]">Pages</span>
                    <span className="block text-xs font-semibold text-[var(--studio-deep-charcoal)]">
                      {project.pageCount} pages
                    </span>
                  </div>
                </div>

                {/* Cover Finish */}
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#8C8075]" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="9" />
                      <path d="m4.93 4.93 14.14 14.14M12 3v18M3 12h18" />
                    </svg>
                  </span>
                  <div>
                    <span className="block text-[11px] text-[#8C8075]">Cover finish</span>
                    <span className="block text-xs font-semibold text-[var(--studio-deep-charcoal)]">
                      {selectedFinishOption?.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="my-4 border-t border-[#E8DDCE]" />

              {/* Estimated Price */}
              <div>
                <span className="block text-xs text-[#8C8075]">Estimated price</span>
                <span className="mt-0.5 block font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[var(--studio-midnight-black)]">
                  {formatAlbumPrice(totalPrice)}
                </span>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={handleLiveView}
                disabled={isGenerating || uploading || project.photos.length === 0}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--studio-midnight-black)] py-3 px-5 text-xs font-semibold text-white shadow-md transition hover:bg-[var(--studio-deep-charcoal)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{isGenerating ? "Composing Spreads..." : "Create and start designing"}</span>
                <span aria-hidden="true">&gt;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Banner: Ready to see your physical 3D photobook? */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 rounded-[24px] bg-[var(--studio-midnight-black)] p-6 sm:p-8 text-white shadow-xl">
          <div className="flex items-center gap-5">
            {/* 3D Photobook with floral illustration */}
            <div className="relative flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10">
              <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
                <rect x="8" y="10" width="32" height="28" rx="2" fill="#C4B9A9" stroke="#E8DDCE" strokeWidth="1.5" />
                <path d="M8 10h5v28H8z" fill="#9E9180" />
                <rect x="18" y="16" width="16" height="16" rx="1" fill="#FAF7F2" stroke="#B5A897" strokeWidth="1" />
              </svg>
            </div>

            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#F5F0E8] font-medium">
                Ready to see your physical 3D photobook?
              </h3>
              <p className="mt-1 text-xs text-white/70 sm:text-sm">
                Click Live View to generate your {project.pageCount}-page album and interact with a realistic page turning.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLiveView}
            disabled={isGenerating || uploading || project.photos.length === 0}
            className="flex-shrink-0 flex items-center gap-2 rounded-full bg-[#C4A882] px-8 py-3.5 text-xs sm:text-sm font-semibold text-[#171717] shadow-lg transition hover:bg-[#B59872] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGenerating ? "Generating Album..." : "Generate & Open Live View ▶"}
          </button>
        </div>
      </section>

      {/* Photo Management & Reordering Popup Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-3xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8DDCE] p-6 sm:px-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B99B70]">
                  Photo Library & Sequence
                </p>
                <h3 className="font-serif text-2xl text-[var(--studio-deep-charcoal)] font-medium">
                  Manage & Reorder Photographs
                </h3>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Drag and drop thumbnails to reorder your photos. Album pages will be generated in this exact sequence.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  ref={modalInputRef}
                  type="file"
                  accept={albumConfig.allowedFormats.join(",")}
                  multiple
                  onChange={handleInputChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => modalInputRef.current?.click()}
                  disabled={uploading || project.photos.length >= albumConfig.maxPhotos}
                  className="rounded-full bg-[var(--studio-warm-beige)] px-4 py-2 text-xs font-semibold text-[var(--studio-deep-charcoal)] transition hover:bg-[#E8DCCB] disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "＋ Add More Photos"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(false)}
                  aria-label="Close photo manager"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DED4C5] text-sm font-bold text-[var(--studio-deep-charcoal)] transition hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Grid of All Photos (with Drag and Drop Reordering) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {project.photos.map((photo, index) => {
                  const isCover = project.coverPhotoId === photo.id;
                  const url = previewUrls[photo.id];
                  const isDraggingThis = draggedPhotoIndex === index;
                  const isOverThis = dragOverIndex === index;

                  return (
                    <div
                      key={photo.id}
                      draggable={true}
                      onDragStart={() => setDraggedPhotoIndex(index)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverIndex !== index) {
                          setDragOverIndex(index);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === index) {
                          setDragOverIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedPhotoIndex !== null && draggedPhotoIndex !== index) {
                          handleReorderPhotos(draggedPhotoIndex, index);
                        }
                        setDraggedPhotoIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                        isDraggingThis
                          ? "opacity-40 scale-95 border-dashed border-[#B99B70]"
                          : isOverThis
                            ? "border-2 border-[#B99B70] bg-[#FAF6F0] scale-105"
                            : isCover
                              ? "border-[#B99B70] ring-2 ring-[#B99B70]/30"
                              : "border-[#E4D9C8] hover:border-gray-400"
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-square w-full cursor-grab active:cursor-grabbing overflow-hidden bg-[var(--studio-warm-beige)]">
                        {url ? (
                          <img
                            src={url}
                            alt={photo.fileName}
                            className="h-full w-full object-cover select-none"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-[var(--color-muted)]">
                            Loading...
                          </div>
                        )}

                        {/* Drag Handle Indicator */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                          <span>⋮⋮</span>
                          <span>#{index + 1}</span>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => void handleRemovePhoto(photo.id)}
                          title="Remove photo"
                          aria-label={`Remove photo ${photo.fileName}`}
                          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white transition hover:bg-red-600"
                        >
                          ✕
                        </button>

                        {/* Cover Badge */}
                        {isCover && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-[#B99B70] px-2.5 py-0.5 text-[10px] font-bold text-[#171717] shadow-sm">
                            Cover Photo
                          </span>
                        )}
                      </div>

                      {/* Controls and Move Arrows */}
                      <div className="flex flex-1 flex-col justify-between p-3">
                        <div>
                          <p className="truncate text-xs font-medium text-[var(--studio-deep-charcoal)]" title={photo.fileName}>
                            {photo.fileName}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[var(--color-muted)]">
                            {photo.width} × {photo.height} px
                          </p>
                        </div>

                        {/* Reorder Arrows for Touch/Accessibility */}
                        <div className="mt-2 flex items-center justify-between gap-1 border-t border-[#E8DDCE] pt-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleReorderPhotos(index, index - 1)}
                            title="Move earlier"
                            aria-label={`Move photo ${index + 1} earlier`}
                            className="rounded px-2 py-1 text-[10px] font-semibold border border-[#E4D9C8] transition hover:bg-gray-100 disabled:opacity-25"
                          >
                            ◀ Move
                          </button>

                          {project.coverFinish === "photo" && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverPhoto(photo.id)}
                              className={`rounded px-2 py-1 text-[10px] font-semibold transition ${
                                isCover
                                  ? "bg-[#B99B70] text-[#171717]"
                                  : "border border-[#E4D9C8] hover:border-[#B99B70]"
                              }`}
                            >
                              {isCover ? "Cover" : "Set Cover"}
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={index === project.photos.length - 1}
                            onClick={() => handleReorderPhotos(index, index + 1)}
                            title="Move later"
                            aria-label={`Move photo ${index + 1} later`}
                            className="rounded px-2 py-1 text-[10px] font-semibold border border-[#E4D9C8] transition hover:bg-gray-100 disabled:opacity-25"
                          >
                            Move ▶
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#E8DDCE] p-5 sm:px-8">
              <span className="text-xs text-[var(--color-muted)]">
                Total: {project.photos.length} photos ready for auto-layout
              </span>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="rounded-full bg-[var(--studio-midnight-black)] px-7 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--studio-deep-charcoal)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

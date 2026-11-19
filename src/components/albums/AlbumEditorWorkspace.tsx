"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";

import { albumConfig } from "@/config/album.config";
import { albumPricing } from "@/config/studio.config";
import { getAlbumProject, saveAlbumProject } from "@/lib/album-storage";
import {
  deleteAlbumPhoto,
  getAlbumPhoto,
  saveAlbumPhoto,
} from "@/lib/album-photo-storage";
import { distributePhotosAcrossAlbum } from "@/lib/album-auto-layout";
import type { AlbumCoverFinish, AlbumPhoto, AlbumProject } from "@/types/album";

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
    const updated: AlbumProject = {
      ...project,
      sizeId,
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

  const maxCapacity = project.pageCount * 6;
  const firstFivePhotos = project.photos.slice(0, 5);
  const remainingCount = Math.max(0, project.photos.length - 5);

  return (
    <main className="min-h-screen bg-[var(--studio-ivory-white)] text-[var(--color-ink)]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-clay)]">
              StudioFrame Customization
            </p>
            <h1 className="mt-0.5 font-serif text-2xl text-[var(--color-ink)]">
              {project.name || "Custom Album"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLiveView}
              disabled={isGenerating || uploading || project.photos.length === 0}
              className="flex items-center gap-2 rounded-full bg-[#B99B70] px-7 py-3 text-sm font-semibold text-[#171717] shadow-md transition hover:bg-[#D0B48A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#171717] border-t-transparent" />
                  Generating Album...
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
              className="rounded-full border border-[var(--color-line)] px-5 py-3 text-sm font-semibold transition hover:border-[#B99B70]"
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
            className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-800 border border-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Responsive Three-Column Layout: Specifications, Upload, and Photo Gallery */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {/* Column 1: Album Specifications (Size & Cover Finish) */}
          <div className="rounded-3xl border border-[var(--color-line)] bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="border-b border-[var(--color-line)] pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
                  01 / Album Size & Finish
                </p>
                <h2 className="mt-1 font-serif text-xl text-[var(--color-ink)]">
                  Album Specifications
                </h2>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                  Choose physical dimensions and cover material
                </p>
              </div>

              {/* Album Size Selection */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                    Album Size
                  </label>
                  <span className="text-[11px] font-semibold text-[#B99B70] uppercase">
                    {project.sizeId}
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
                  {albumPricing.sizes.map((size) => {
                    const isSelected = project.sizeId === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => handleSelectSize(size.id)}
                        className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition ${
                          isSelected
                            ? "border-[#B99B70] bg-[#FAF6F0] shadow-sm ring-1 ring-[#B99B70]"
                            : "border-[var(--color-line)] bg-white hover:border-[#B99B70]/60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                              {size.id}
                            </span>
                            <span className="rounded bg-[#FAF6F0] px-1.5 py-0.5 text-[10px] font-semibold text-[#B99B70]">
                              {size.width} × {size.height} in
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">
                            {size.label}
                          </p>
                        </div>
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                            isSelected
                              ? "border-[#B99B70] bg-[#B99B70]"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cover Finish Selection */}
            <div className="mt-5 border-t border-[var(--color-line)] pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                  Cover Finish
                </label>
                <span className="text-[11px] font-semibold text-[#B99B70] capitalize">
                  {project.coverFinish}
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {albumConfig.coverFinishes.map((finish) => {
                  const isSelected = project.coverFinish === finish.id;
                  return (
                    <button
                      key={finish.id}
                      type="button"
                      onClick={() => handleSelectFinish(finish.id as AlbumCoverFinish)}
                      className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition ${
                        isSelected
                          ? "border-[#B99B70] bg-[#FAF6F0] shadow-sm ring-1 ring-[#B99B70]"
                          : "border-[var(--color-line)] bg-white hover:border-[#B99B70]/60"
                      }`}
                    >
                      <span className="text-xs font-bold text-[var(--color-ink)]">
                        {finish.label}
                      </span>
                      <span className="mt-0.5 line-clamp-1 text-[9px] leading-tight text-[var(--color-muted)]">
                        {finish.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Photo Upload Area */}
          <div className="rounded-3xl border border-[var(--color-line)] bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between border-b border-[var(--color-line)] pb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
                    02 / Photo Upload
                  </p>
                  <h2 className="mt-1 font-serif text-xl text-[var(--color-ink)]">
                    Upload Photographs
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    Auto-composed across {project.pageCount} pages
                  </p>
                </div>
                <span className="rounded-full bg-[var(--studio-warm-beige)] px-3 py-1 text-[11px] font-semibold text-[var(--studio-deep-charcoal)]">
                  {project.photos.length} / {albumConfig.maxPhotos}
                </span>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept={albumConfig.allowedFormats.join(",")}
                multiple
                onChange={handleInputChange}
                className="hidden"
              />

              {/* Upload Dropzone */}
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
                className={`mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors min-h-[310px] ${
                  dragging
                    ? "border-[#B99B70] bg-[#FAF6F0]"
                    : "border-[var(--color-line)] bg-[var(--studio-ivory-white)]"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm text-xl text-[#B99B70]">
                  ＋
                </div>

                <h3 className="mt-3 font-serif text-base font-semibold text-[var(--color-ink)]">
                  {uploading ? "Uploading your photographs..." : "Drag and drop photographs here"}
                </h3>

                <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[var(--color-muted)]">
                  Supports JPEG, PNG and WebP files up to {albumConfig.maxFileSizeMB} MB each.
                </p>

                <p className="mt-1 text-[11px] text-[var(--color-clay)]">
                  Capacity: up to {maxCapacity} photos ({project.pageCount} pages × max 6)
                </p>

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading || project.photos.length >= albumConfig.maxPhotos}
                  className="mt-4 rounded-full bg-[var(--studio-midnight-black)] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--studio-deep-charcoal)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Choose Files from Device"}
                </button>
              </div>
            </div>

            <p className="mt-3 text-center text-[11px] text-[var(--color-muted)]">
              Drop images anywhere inside the dashed box
            </p>
          </div>

          {/* Column 3: Uploaded Photo Gallery */}
          <div className="rounded-3xl border border-[var(--color-line)] bg-white p-6 shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-start justify-between border-b border-[var(--color-line)] pb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-clay)]">
                    03 / Photo Gallery
                  </p>
                  <h2 className="mt-1 font-serif text-xl text-[var(--color-ink)]">
                    Selected Photos
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {project.photos.length === 0
                      ? "First 5 preview thumbnails"
                      : `First 5 thumbnails · ${project.photos.length} uploaded`}
                  </p>
                </div>

                {project.photos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsManageModalOpen(true)}
                    className="rounded-full border border-[#B99B70] bg-[#FAF6F0] px-3.5 py-1 text-xs font-semibold text-[#171717] transition hover:bg-[#F0E6D8]"
                  >
                    Manage ({project.photos.length})
                  </button>
                )}
              </div>

              {project.photos.length === 0 ? (
                <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--studio-ivory-white)] p-8 text-center min-h-[310px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg text-[var(--color-muted)] shadow-sm">
                    📷
                  </div>
                  <p className="mt-3 font-serif text-base text-[var(--color-ink)]">
                    No photographs selected yet
                  </p>
                  <p className="mt-1 max-w-[220px] text-xs text-[var(--color-muted)]">
                    Upload photographs in Section 02 to preview and arrange them here.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3">
                  {/* First 5 Photos */}
                  {firstFivePhotos.map((photo, index) => {
                    const isCover = project.coverPhotoId === photo.id;
                    const url = previewUrls[photo.id];

                    return (
                      <div
                        key={photo.id}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
                          isCover ? "border-[#B99B70] ring-2 ring-[#B99B70]/30" : "border-[var(--color-line)]"
                        }`}
                      >
                        {/* Thumbnail Image */}
                        <div className="relative aspect-square w-full overflow-hidden bg-[var(--studio-warm-beige)]">
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

                          {/* Photo Index Badge */}
                          <span className="absolute top-1.5 left-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
                            #{index + 1}
                          </span>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => void handleRemovePhoto(photo.id)}
                            title="Remove photo"
                            aria-label={`Remove photo ${photo.fileName}`}
                            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white transition hover:bg-red-600"
                          >
                            ✕
                          </button>

                          {/* Cover Photo Badge */}
                          {isCover && (
                            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-[#B99B70] px-2 py-0.5 text-[9px] font-bold text-[#171717] shadow-sm">
                              Cover
                            </span>
                          )}
                        </div>

                        {/* Metadata & Controls */}
                        <div className="flex flex-1 flex-col justify-between p-2">
                          <div>
                            <p className="truncate text-[11px] font-medium text-[var(--color-ink)]" title={photo.fileName}>
                              {photo.fileName}
                            </p>
                            <p className="mt-0.5 text-[9px] text-[var(--color-muted)]">
                              {photo.width} × {photo.height}
                            </p>
                          </div>

                          {project.coverFinish === "photo" && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverPhoto(photo.id)}
                              className={`mt-1.5 w-full rounded py-1 text-[9px] font-semibold transition ${
                                isCover
                                  ? "bg-[#B99B70] text-[#171717]"
                                  : "border border-[var(--color-line)] bg-[var(--studio-ivory-white)] text-[var(--color-ink)] hover:border-[#B99B70]"
                              }`}
                            >
                              {isCover ? "Cover Photo" : "Set Cover"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 5+ / View All Tile */}
                  {remainingCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsManageModalOpen(true)}
                      aria-label={`View and manage ${remainingCount} more photographs`}
                      className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#B99B70] bg-[#FAF6F0] p-3 text-center transition hover:bg-[#F2EAE0]"
                    >
                      <span className="font-serif text-2xl font-bold text-[#B99B70]">
                        +{remainingCount}
                      </span>
                      <span className="mt-1 text-[11px] font-semibold text-[var(--color-ink)]">
                        View All ({project.photos.length})
                      </span>
                      <span className="mt-0.5 text-[9px] text-[var(--color-muted)]">
                        Manage & Reorder
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {project.photos.length > 5 && (
              <p className="mt-3 text-center text-[11px] text-[var(--color-muted)]">
                Showing first 5 of {project.photos.length} photos. Click &ldquo;+{remainingCount} View All&rdquo; to reorder.
              </p>
            )}
          </div>
        </div>

        {/* 4. Live View Call-to-Action Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--studio-midnight-black)] p-6 text-white sm:p-8">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl text-[#F5F0E8]">
              Ready to see your physical 3D photobook?
            </h3>
            <p className="mt-1 text-xs text-white/60 sm:text-sm">
              Click Live View to generate your {project.pageCount}-page album and interact with realistic page turning.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLiveView}
            disabled={isGenerating || uploading || project.photos.length === 0}
            className="rounded-full bg-[#B99B70] px-8 py-4 text-sm font-semibold text-[#171717] shadow-lg transition hover:bg-[#D0B48A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGenerating ? "Generating Album..." : "Generate & Open Live View ▶"}
          </button>
        </div>
      </section>

      {/* 5. Photo Management & Reordering Popup Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-3xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-line)] p-6 sm:px-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B99B70]">
                  Photo Library & Sequence
                </p>
                <h3 className="font-serif text-2xl text-[var(--color-ink)]">
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
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line)] text-sm font-bold text-[var(--color-ink)] transition hover:bg-gray-100"
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
                              : "border-[var(--color-line)] hover:border-gray-400"
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
                          <p className="truncate text-xs font-medium text-[var(--color-ink)]" title={photo.fileName}>
                            {photo.fileName}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[var(--color-muted)]">
                            {photo.width} × {photo.height} px
                          </p>
                        </div>

                        {/* Reorder Arrows for Touch/Accessibility */}
                        <div className="mt-2 flex items-center justify-between gap-1 border-t border-[var(--color-line)] pt-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleReorderPhotos(index, index - 1)}
                            title="Move earlier"
                            aria-label={`Move photo ${index + 1} earlier`}
                            className="rounded px-2 py-1 text-[10px] font-semibold border border-[var(--color-line)] transition hover:bg-gray-100 disabled:opacity-25"
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
                                  : "border border-[var(--color-line)] hover:border-[#B99B70]"
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
                            className="rounded px-2 py-1 text-[10px] font-semibold border border-[var(--color-line)] transition hover:bg-gray-100 disabled:opacity-25"
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
            <div className="flex items-center justify-between border-t border-[var(--color-line)] p-5 sm:px-8">
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

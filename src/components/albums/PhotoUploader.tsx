
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { albumConfig } from "@/config/album.config";
import {
  deleteAlbumPhoto,
  getAlbumPhoto,
  saveAlbumPhoto,
} from "@/lib/album-photo-storage";
import { saveAlbumProject } from "@/lib/album-storage";
import type { AlbumPhoto, AlbumProject } from "@/types/album";

type PhotoUploaderProps = {
  project: AlbumProject;
  onProjectChange: (project: AlbumProject) => void;
  onAddToPage: (photoId: string) => void;
};

export function PhotoUploader({
  project,
  onProjectChange,
  onAddToPage,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);

  const visiblePhotos = project.photos.slice(0, 3);
  const remainingPhotos = Math.max(0, project.photos.length - 3);

  useEffect(() => {
    let cancelled = false;
    const createdUrls: string[] = [];

    async function loadPreviews() {
      const entries = await Promise.all(
        project.photos.map(async (photo) => {
          const blob = await getAlbumPhoto(project.id, photo.id);
          if (!blob) return null;

          const url = URL.createObjectURL(blob);
          createdUrls.push(url);

          return [photo.id, url] as const;
        }),
      );

      if (cancelled) {
        createdUrls.forEach(URL.revokeObjectURL);
        return;
      }

      setPreviewUrls(
        Object.fromEntries(
          entries.filter(
            (entry): entry is readonly [string, string] => entry !== null,
          ),
        ),
      );
    }

    loadPreviews().catch(() => {
      if (!cancelled) {
        setError("Some saved photographs could not be loaded.");
      }
    });

    return () => {
      cancelled = true;
      createdUrls.forEach(URL.revokeObjectURL);
    };
  }, [project.id, project.photos]);

  async function getImageDimensions(file: File) {
    const image = await createImageBitmap(file);

    const dimensions = {
      width: image.width,
      height: image.height,
    };

    image.close();
    return dimensions;
  }

  async function handleFiles(fileList: FileList | File[]) {
    if (uploading) return;

    setError("");

    const files = Array.from(fileList);

    if (files.length === 0) return;

    const remainingSlots = albumConfig.maxPhotos - project.photos.length;

    if (remainingSlots <= 0) {
      setError(`You can upload a maximum of ${albumConfig.maxPhotos} photos.`);
      return;
    }

    if (files.length > remainingSlots) {
      setError(
        `You can add only ${remainingSlots} more photo(s) to this album.`,
      );
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      if (!albumConfig.allowedFormats.includes(file.type as never)) {
        setError(`${file.name}: only JPEG, PNG and WebP images are allowed.`);
        return;
      }

      if (file.size > albumConfig.maxFileSizeMB * 1024 * 1024) {
        setError(
          `${file.name}: the maximum file size is ${albumConfig.maxFileSizeMB} MB.`,
        );
        return;
      }

      if (file.size === 0) {
        setError(`${file.name}: this file is empty.`);
        return;
      }

      validFiles.push(file);
    }

    setUploading(true);

    const addedPhotos: AlbumPhoto[] = [];
    const addedIds: string[] = [];
    const newPreviewUrls: Record<string, string> = {};

    try {
      for (const file of validFiles) {
        const dimensions = await getImageDimensions(file);
        const photoId = crypto.randomUUID();

        await saveAlbumPhoto(project.id, photoId, file);
        addedIds.push(photoId);

        addedPhotos.push({
          id: photoId,
          fileName: file.name,
          url: "",
          width: dimensions.width,
          height: dimensions.height,
          fileSize: file.size,
          uploadedAt: Date.now(),
        });

        newPreviewUrls[photoId] = URL.createObjectURL(file);
      }

      const updatedProject: AlbumProject = {
        ...project,
        photos: [...project.photos, ...addedPhotos],
        updatedAt: Date.now(),
      };

      try {
        saveAlbumProject(updatedProject);
      } catch (saveError) {
        await Promise.all(
          addedIds.map((photoId) => deleteAlbumPhoto(project.id, photoId)),
        );
        throw saveError;
      }

      setPreviewUrls((current) => ({
        ...current,
        ...newPreviewUrls,
      }));

      onProjectChange(updatedProject);
    } catch (uploadError) {
      Object.values(newPreviewUrls).forEach(URL.revokeObjectURL);

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

  async function removePhoto(photoId: string) {
    setError("");

    const updatedProject: AlbumProject = {
      ...project,
      photos: project.photos.filter((photo) => photo.id !== photoId),
      pages: project.pages.map((page) => ({
        ...page,
        photos: page.photos.filter(
          (placement) => placement.photoId !== photoId,
        ),
      })),
      coverPhotoId:
        project.coverPhotoId === photoId ? null : project.coverPhotoId,
      updatedAt: Date.now(),
    };

    try {
      saveAlbumProject(updatedProject);
      onProjectChange(updatedProject);

      const url = previewUrls[photoId];

      if (url) {
        URL.revokeObjectURL(url);
      }

      setPreviewUrls((current) => {
        const next = { ...current };
        delete next[photoId];
        return next;
      });

      await deleteAlbumPhoto(project.id, photoId);
    } catch {
      setError("Unable to remove this photograph. Please try again.");
    }
  }

  return (
    <>
      <section className="rounded-3xl border border-[var(--color-line)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-[var(--color-ink)]">
              Your photo library
            </h2>

            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Upload and manage your album photographs.
            </p>
          </div>

          <span className="rounded-full bg-[var(--studio-warm-beige)] px-3 py-1.5 text-xs font-semibold text-[var(--studio-deep-charcoal)]">
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
          className={`mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed px-4 py-4 transition-colors ${
            dragging
              ? "border-[var(--studio-champagne-gold)] bg-[var(--studio-warm-beige)]"
              : "border-[var(--color-line)] bg-[var(--studio-ivory-white)]"
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {uploading ? "Uploading photographs..." : "Add photographs"}
            </p>

            <p className="mt-1 text-xs text-[var(--color-muted)]">
              JPEG, PNG or WebP · Maximum {albumConfig.maxFileSizeMB} MB each
            </p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || project.photos.length >= albumConfig.maxPhotos}
            className="rounded-full bg-[var(--studio-midnight-black)] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--studio-deep-charcoal)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "+ Upload photos"}
          </button>
        </div>

        {error && (
          <p
            className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        {project.photos.length > 0 ? (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">
                Uploaded photos
              </h3>

              <span className="text-xs text-[var(--color-muted)]">
                {project.photos.length} photos
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {visiblePhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--studio-warm-beige)]"
                >
                  <div className="aspect-square">
                    {previewUrls[photo.id] ? (
                      <img
                        src={previewUrls[photo.id]}
                        alt={photo.fileName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-xs text-[var(--color-muted)]">
                        Loading...
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddToPage(photo.id)}
                    disabled={uploading}
                    className="w-full bg-white px-2 py-2 text-[11px] font-semibold text-[var(--color-ink)] transition hover:bg-[var(--studio-warm-beige)] disabled:opacity-50"
                  >
                    + Add to page
                  </button>
                </div>
              ))}
            </div>

            {remainingPhotos > 0 && (
              <button
                type="button"
                onClick={() => setShowLibrary(true)}
                className="mt-4 w-full rounded-xl border border-[var(--studio-champagne-gold)] bg-[var(--studio-ivory-white)] px-4 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--studio-warm-beige)]"
              >
                +{remainingPhotos} more photos · View all
              </button>
            )}

            {project.photos.length <= 3 && (
              <p className="mt-3 text-center text-xs text-[var(--color-muted)]">
                All uploaded photos are shown above.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-[var(--studio-ivory-white)] px-4 py-6 text-center text-sm text-[var(--color-muted)]">
            No photographs uploaded yet. Choose photos to start building your album.
          </p>
        )}
      </section>

      {showLibrary && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLibrary(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-library-title"
            className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] px-5 py-5 sm:px-7">
              <div>
                <h2
                  id="photo-library-title"
                  className="font-serif text-2xl text-[var(--color-ink)]"
                >
                  All photographs
                </h2>

                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {project.photos.length} photos in your album library
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                aria-label="Close photo library"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] text-xl text-[var(--color-ink)] transition hover:bg-[var(--studio-warm-beige)]"
              >
                ×
              </button>
            </header>

            <div className="overflow-y-auto p-5 sm:p-7">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {project.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group overflow-hidden rounded-xl border border-[var(--color-line)] bg-white"
                  >
                    <div className="relative aspect-square bg-[var(--studio-warm-beige)]">
                      {previewUrls[photo.id] ? (
                        <img
                          src={previewUrls[photo.id]}
                          alt={photo.fileName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-2 text-center text-xs text-[var(--color-muted)]">
                          Loading preview...
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <p
                        className="truncate text-xs font-medium text-[var(--color-ink)]"
                        title={photo.fileName}
                      >
                        {photo.fileName}
                      </p>

                      <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                        {photo.width} × {photo.height} px
                      </p>

                      <button
                        type="button"
                        onClick={() => onAddToPage(photo.id)}
                        disabled={uploading}
                        className="mt-3 w-full rounded-lg bg-[var(--studio-midnight-black)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--studio-deep-charcoal)] disabled:opacity-50"
                      >
                        Add to current page
                      </button>

                      <button
                        type="button"
                        onClick={() => void removePhoto(photo.id)}
                        disabled={uploading}
                        className="mt-2 w-full rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-[var(--color-line)] px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading || project.photos.length >= albumConfig.maxPhotos}
                className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-xs font-semibold text-[var(--color-ink)] transition hover:bg-[var(--studio-warm-beige)] disabled:opacity-50"
              >
                + Upload more
              </button>

              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="rounded-full bg-[var(--studio-midnight-black)] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--studio-deep-charcoal)]"
              >
                Done
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

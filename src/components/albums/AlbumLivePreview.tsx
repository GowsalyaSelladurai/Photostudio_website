"use client";

import { Album3DBook } from "./Album3DBook";

type AlbumLivePreviewProps = {
  projectId: string;
};

/**
 * StudioFrame Album Live 3D Preview
 * Backwards-compatible wrapper delegating to the realistic Album3DBook viewer.
 */
export function AlbumLivePreview({ projectId }: AlbumLivePreviewProps) {
  return <Album3DBook projectId={projectId} />;
}


import { AlbumLivePreview } from "@/components/albums/AlbumLivePreview";

export default async function AlbumLivePreviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <AlbumLivePreview projectId={projectId} />;
}

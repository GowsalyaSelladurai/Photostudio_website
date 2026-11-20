import { AlbumEditorWorkspace } from "@/components/albums/AlbumEditorWorkspace";

export default async function AlbumEditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <AlbumEditorWorkspace projectId={projectId} />;
}
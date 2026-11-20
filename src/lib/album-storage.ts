
import type { AlbumProject } from "@/types/album";
import { getWeddingAlbumDemoProject } from "./wedding-album-demo";

const STORAGE_KEY = "studioframe-album-projects";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getAlbumProjects(): AlbumProject[] {
  if (!isBrowser()) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    const projects: unknown = JSON.parse(stored);

    return Array.isArray(projects) ? projects as AlbumProject[] : [];
  } catch {
    console.error("Unable to read saved album projects.");
    return [];
  }
}

export function getAlbumProject(
  projectId: string,
): AlbumProject | null {
  const found = getAlbumProjects().find((project) => project.id === projectId);
  if (found) return found;

  // Provide photorealistic luxury wedding album demo for direct preview
  if (projectId === "wedding" || projectId === "demo" || !found) {
    return getWeddingAlbumDemoProject(projectId);
  }
  return null;
}

export function saveAlbumProject(project: AlbumProject): void {
  if (!isBrowser()) {
    throw new Error("Album storage is unavailable.");
  }

  const projects = getAlbumProjects();

  const existingIndex = projects.findIndex(
    (item) => item.id === project.id,
  );

  const updatedProject: AlbumProject = {
    ...project,
    updatedAt: Date.now(),
  };

  if (existingIndex >= 0) {
    projects[existingIndex] = updatedProject;
  } else {
    projects.push(updatedProject);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    throw new Error(
      "Unable to save the album project. Browser storage may be full.",
    );
  }
}

export function deleteAlbumProject(projectId: string): void {
  if (!isBrowser()) return;

  const projects = getAlbumProjects().filter(
    (project) => project.id !== projectId,
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

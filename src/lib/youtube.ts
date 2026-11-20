const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function assertVideoId(videoId: string) {
  if (!VIDEO_ID_PATTERN.test(videoId)) {
    throw new Error(`Invalid YouTube video ID: "${videoId}"`);
  }
  return videoId;
}

/** Public watch page for a video. Used by every "Watch on YouTube" link. */
export function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${assertVideoId(videoId)}`;
}

/** Privacy-enhanced embed URL (no cookies until the visitor presses play). */
export function youtubeEmbedUrl(videoId: string, autoplay = false) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    ...(autoplay ? { autoplay: "1" } : {}),
  });
  return `https://www.youtube-nocookie.com/embed/${assertVideoId(videoId)}?${params.toString()}`;
}

/** Standard 480x360 thumbnail that exists for every YouTube video. */
export function youtubeThumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${assertVideoId(videoId)}/hqdefault.jpg`;
}

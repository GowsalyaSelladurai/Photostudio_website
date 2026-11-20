export type FilmBanner = {
  id: string;
  /** Video file under /public (played when the visitor presses Play). */
  videoSrc: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Poster frame shown until the visitor presses play. */
  poster: string;
  posterAlt: string;
  /** Short label for the banner switcher. */
  tabLabel: string;
};

export type ReferenceVideo = {
  id: string;
  /** YouTube video ID — the watch link and thumbnail are both derived from it. */
  videoId: string;
  title: string;
  category: string;
  channel: string;
  description: string;
};

export type HeroVideo = {
  id: string;
  /** Video file under /public. */
  src: string;
  /** Poster frame shown while the video loads. */
  poster: string;
  title: string;
};

export type FilmCategory = {
  /** Matches the `id` of the banner/category tab it belongs to. */
  bannerId: string;
  title: string;
  description: string;
  highlights: string[];
  /** Caption for the category's video card (the video is the banner's `videoSrc`). */
  videoTitle: string;
  videoCaption: string;
};

// Embed URL shape: https://developers.google.com/youtube/player_parameters
const YOUTUBE_EMBED_BASE = 'https://www.youtube.com/embed/';
const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function isValidYouTubeVideoId(value: string | undefined | null): boolean {
  const v = value?.trim();
  return !!v && VIDEO_ID_PATTERN.test(v);
}

export function youtubeIframeSrc(videoId: string): string {
  return `${YOUTUBE_EMBED_BASE}${videoId}`;
}

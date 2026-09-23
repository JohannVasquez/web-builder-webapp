// Reconocimiento puro de URLs de video, sin tocar el DOM, para poder probarlo sin navegador.

export type VideoKind = 'youtube' | 'vimeo' | 'file';

export interface ParsedVideoUrl {
  readonly kind: VideoKind;
  // Solo viene definida para 'youtube' y 'vimeo': la URL lista para un <iframe>.
  readonly embedUrl: string | null;
  // La URL original recortada; para 'file' es la que va directo en <video src>.
  readonly src: string;
}

const YOUTUBE_PATTERN =
  /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/i;
const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/i;

export function parseVideoUrl(url: string): ParsedVideoUrl {
  const trimmed = url.trim();
  if (trimmed === '') {
    return { kind: 'file', embedUrl: null, src: '' };
  }

  const youtubeMatch = YOUTUBE_PATTERN.exec(trimmed);
  if (youtubeMatch !== null) {
    return {
      kind: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      src: trimmed,
    };
  }

  const vimeoMatch = VIMEO_PATTERN.exec(trimmed);
  if (vimeoMatch !== null) {
    return {
      kind: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      src: trimmed,
    };
  }

  return { kind: 'file', embedUrl: null, src: trimmed };
}

import { parseVideoUrl } from './videoUrl';

describe('parseVideoUrl', () => {
  it('reconoce YouTube en su forma watch?v=', () => {
    const result = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.kind).toBe('youtube');
    expect(result.embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('reconoce YouTube en su forma corta youtu.be/', () => {
    const result = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ');
    expect(result.kind).toBe('youtube');
    expect(result.embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('reconoce Vimeo', () => {
    const result = parseVideoUrl('https://vimeo.com/123456789');
    expect(result.kind).toBe('vimeo');
    expect(result.embedUrl).toBe('https://player.vimeo.com/video/123456789');
  });

  it('trata un archivo .mp4 propio como archivo', () => {
    const result = parseVideoUrl('https://bucket.example.com/videos/promo.mp4');
    expect(result.kind).toBe('file');
    expect(result.embedUrl).toBeNull();
    expect(result.src).toBe('https://bucket.example.com/videos/promo.mp4');
  });

  it('una URL vacía no revienta', () => {
    const result = parseVideoUrl('');
    expect(result.kind).toBe('file');
    expect(result.embedUrl).toBeNull();
    expect(result.src).toBe('');
  });

  it('una URL basura no revienta y se trata como archivo', () => {
    const result = parseVideoUrl('esto no es una url');
    expect(result.kind).toBe('file');
    expect(result.embedUrl).toBeNull();
    expect(result.src).toBe('esto no es una url');
  });
});

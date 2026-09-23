// Atributos de carga para una imagen de bloque. `eager` se reserva para lo que está sobre
// el pliegue (la portada): diferir eso empeora el LCP en vez de mejorarlo.
export interface ImageLoadingAttributes {
  readonly loading: 'lazy' | 'eager';
  readonly decoding: 'async';
  readonly fetchPriority: 'high' | 'auto';
}

export const imageLoading = (eager = false): ImageLoadingAttributes => ({
  loading: eager ? 'eager' : 'lazy',
  decoding: 'async',
  fetchPriority: eager ? 'high' : 'auto',
});

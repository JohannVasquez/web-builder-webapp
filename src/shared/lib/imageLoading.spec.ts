import { imageLoading } from './imageLoading';

describe('imageLoading', () => {
  it('difiere por defecto: la mayoría de las imágenes están bajo el pliegue', () => {
    expect(imageLoading()).toEqual({
      loading: 'lazy',
      decoding: 'async',
      fetchPriority: 'auto',
    });
  });

  it('prioriza lo que está sobre el pliegue, para no empeorar el LCP', () => {
    expect(imageLoading(true)).toEqual({
      loading: 'eager',
      decoding: 'async',
      fetchPriority: 'high',
    });
  });
});

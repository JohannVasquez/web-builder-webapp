import { refreshAsyncData, useAsyncData } from './useAsyncData';

describe('useAsyncData (el store, sin React)', () => {
  it('exporta el hook y el refresco', () => {
    expect(typeof useAsyncData).toBe('function');
    expect(typeof refreshAsyncData).toBe('function');
  });

  it('refrescar una clave que no existe no lanza', () => {
    expect(() => refreshAsyncData('no-existe')).not.toThrow();
  });
});

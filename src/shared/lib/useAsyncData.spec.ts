/** @jest-environment jsdom */

import { act, renderHook, waitFor } from '@testing-library/react';
import { refreshAsyncData, revalidateAsyncData, useAsyncData } from './useAsyncData';

describe('useAsyncData (el store, sin React)', () => {
  it('exporta el hook y el refresco', () => {
    expect(typeof useAsyncData).toBe('function');
    expect(typeof refreshAsyncData).toBe('function');
  });

  it('refrescar una clave que no existe no lanza', () => {
    expect(() => refreshAsyncData('no-existe')).not.toThrow();
    expect(() => revalidateAsyncData('no-existe')).not.toThrow();
  });
});

describe('revalidateAsyncData', () => {
  it('vuelve a pedir los datos sin dejar de mostrar los anteriores mientras llegan', async () => {
    let version = 0;
    const load = jest.fn(() => Promise.resolve(++version));
    const { result } = renderHook(() => useAsyncData('spec:revalidate', load));

    await waitFor(() => expect(result.current.data).toBe(1));

    act(() => revalidateAsyncData('spec:revalidate'));
    expect(result.current.data).toBe(1);
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.data).toBe(2));
    expect(result.current.isLoading).toBe(false);
    expect(load).toHaveBeenCalledTimes(2);
  });
});

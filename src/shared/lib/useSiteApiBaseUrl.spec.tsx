/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { SiteApiBaseUrlProvider, useSiteApiBaseUrl } from './useSiteApiBaseUrl';

jest.mock('@/shared/config/api', () => ({
  getPublicApiBaseUrl: () => 'https://api.publica',
}));

const withBase = (
  baseUrl: string | undefined,
): ((props: { children: ReactNode }) => ReactElement) =>
  function Wrapper({ children }) {
    return <SiteApiBaseUrlProvider baseUrl={baseUrl}>{children}</SiteApiBaseUrlProvider>;
  };

describe('useSiteApiBaseUrl', () => {
  it('fuera de una demo es la API pública, como siempre', () => {
    expect(renderHook(() => useSiteApiBaseUrl()).result.current).toBe(
      'https://api.publica',
    );
    expect(
      renderHook(() => useSiteApiBaseUrl(), { wrapper: withBase(undefined) }).result
        .current,
    ).toBe('https://api.publica');
  });

  it('en una demo las acciones pasan por el servidor del sitio', () => {
    expect(
      renderHook(() => useSiteApiBaseUrl(), { wrapper: withBase('/demo') }).result
        .current,
    ).toBe('/demo');
  });
});

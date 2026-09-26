import { revalidateAsyncData } from '@/shared/lib/useAsyncData';

// Toda clave de demos que se pidió en esta sesión del panel. Una acción sobre una demo cambia
// la lista (estado, vencimiento), su ficha y a veces las de otras propuestas (convertir
// descarta las hermanas), así que se vuelven a pedir todas.
const demoKeys = new Set<string>();

const track = (key: string): string => {
  demoKeys.add(key);
  return key;
};

export const demoListCacheKey = (path: string): string => track(`admin:demos:${path}`);

export const demoDetailCacheKey = (demoId: string): string =>
  track(`admin:demo:${demoId}`);

export const demoVisitsCacheKey = (demoId: string, page: number): string =>
  track(`admin:demo:${demoId}:visits:${String(page)}`);

// Sin vaciar lo que se ve: la pantalla sigue mostrando los datos anteriores hasta que llegan
// los nuevos.
export const refreshDemoData = (): void => {
  for (const key of demoKeys) {
    revalidateAsyncData(key);
  }
};

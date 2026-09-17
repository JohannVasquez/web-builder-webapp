import type { BlogService } from '@/modules/Blog/application/BlogService';
import type { StoreService } from '@/modules/Store/application/StoreService';

export interface SectionComponentProps {
  readonly sectionProps: Readonly<Record<string, unknown>>;
  // Blog del tenant, ya resuelto. Ningún otro bloque lo necesita porque recibe sus datos
  // resueltos en `sectionProps`; `LatestPosts` es la excepción, porque tiene que pedirle
  // publicaciones al blog EN el render. Se inyecta acá (en vez de construirlo con
  // `blogServiceFactory` dentro del propio bloque) porque un componente de `presentation`
  // no puede depender de `infrastructure` (regla `boundaries/dependencies`): quien construye
  // el servicio es la página en `src/app`, que no está sujeta a esa regla de capas.
  readonly blogService?: BlogService;
  // Igual que `blogService`, pero para `FeaturedProducts`: el único bloque que necesita
  // pedirle productos a la tienda EN el render.
  readonly storeService?: StoreService;
}

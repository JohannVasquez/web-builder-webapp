// Lógica pura del editor de menú de navegación (Pantalla 5): valida cada enlace con el mismo
// criterio que `NavigationLinkInputSchema` en el backend, y reordena la lista igual que los
// bloques, pero por índice porque un enlace del menú no trae un id propio del servidor.

export interface NavLinkDraft {
  readonly label: string;
  readonly href: string;
}

const HREF_FORMAT_ERROR =
  'Usa una dirección de tu sitio (empieza con /) o una URL completa';

export const validateNavLinkLabel = (label: string): string | null => {
  const trimmed = label.trim();
  if (trimmed === '') {
    return 'El texto del enlace no puede quedar vacío';
  }
  if (trimmed.length > 100) {
    return 'El texto es demasiado largo (máximo 100 caracteres).';
  }
  return null;
};

export const validateNavLinkHref = (href: string): string | null => {
  const trimmed = href.trim();
  if (trimmed === '') {
    return 'El enlace no puede quedar vacío';
  }
  if (trimmed.length > 255) {
    return 'El enlace es demasiado largo (máximo 255 caracteres).';
  }
  if (trimmed.startsWith('/') || /^https?:\/\//.test(trimmed)) {
    return null;
  }
  return HREF_FORMAT_ERROR;
};

// La dirección de una página propia dentro del menú: "home" vive en la raíz del sitio.
export const pageHref = (slug: string): string => (slug === 'home' ? '/' : `/${slug}`);

export const moveLinkUp = <T>(links: readonly T[], index: number): T[] => {
  if (index <= 0) {
    return [...links];
  }
  const next = [...links];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  return next;
};

export const moveLinkDown = <T>(links: readonly T[], index: number): T[] => {
  if (index === -1 || index >= links.length - 1) {
    return [...links];
  }
  const next = [...links];
  [next[index], next[index + 1]] = [next[index + 1], next[index]];
  return next;
};

export const reorderLinksByDrag = <T>(
  links: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] => {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    fromIndex >= links.length ||
    toIndex < 0 ||
    toIndex >= links.length
  ) {
    return [...links];
  }
  const next = [...links];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

// Traduce el `path` de un issue de validación del backend ("links.2.href") a algo que ubique
// el enlace dentro del formulario, ya que el índice crudo no le dice nada a quien lo lee.
export const describeNavigationIssuePath = (path: string): string => {
  const match = /^links\.(\d+)\.(label|href)$/.exec(path);
  if (match === null) {
    return path;
  }
  const index = Number(match[1]) + 1;
  const field = match[2] === 'label' ? 'texto' : 'enlace';
  return `Enlace ${String(index)} (${field})`;
};

export type CreateTenantMode = 'empty' | 'template' | 'duplicate';

// Propuesta de dirección (slug) a partir del nombre del cliente: minúsculas, sin tildes ni
// ñ, y guiones donde no hay letras ni números. Coincide con lo que el backend exige
// (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) para que la propuesta nunca llegue rechazada.
export const proposeSlug = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

import { mediaSrc } from './mediaSrc';

describe('mediaSrc', () => {
  it('arma la dirección estable a partir de la clave', () => {
    expect(mediaSrc('c0ffee.jpg')).toBe('/api/media/c0ffee.jpg');
  });

  it('escapa la clave en vez de pegarla cruda en la ruta', () => {
    expect(mediaSrc('con espacio.jpg')).toBe('/api/media/con%20espacio.jpg');
  });

  it('deja pasar una URL externa pegada a mano', () => {
    // Reescribirla la rompería: no está en nuestro bucket.
    expect(mediaSrc('https://ejemplo.cl/foto.jpg')).toBe('https://ejemplo.cl/foto.jpg');
  });

  const sinClave: [string | null | undefined, string][] = [
    [null, 'nula'],
    [undefined, 'ausente'],
    ['', 'vacía'],
    ['   ', 'en blanco'],
  ];
  it.each(sinClave)('%s no produce dirección (%s)', (key) => {
    expect(mediaSrc(key)).toBeNull();
  });
});

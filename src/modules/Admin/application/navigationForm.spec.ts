import {
  describeNavigationIssuePath,
  moveLinkDown,
  moveLinkUp,
  pageHref,
  reorderLinksByDrag,
  validateNavLinkHref,
  validateNavLinkLabel,
} from './navigationForm';

describe('validateNavLinkLabel', () => {
  it('rechaza un texto vacío', () => {
    expect(validateNavLinkLabel('   ')).toBe('El texto del enlace no puede quedar vacío');
  });

  it('rechaza un texto demasiado largo', () => {
    expect(validateNavLinkLabel('a'.repeat(101))).toContain('demasiado largo');
  });

  it('acepta un texto normal', () => {
    expect(validateNavLinkLabel('Servicios')).toBeNull();
  });
});

describe('validateNavLinkHref', () => {
  it('rechaza un enlace vacío', () => {
    expect(validateNavLinkHref('')).toBe('El enlace no puede quedar vacío');
  });

  it('acepta una página propia', () => {
    expect(validateNavLinkHref('/nosotros')).toBeNull();
  });

  it('acepta el ancla de una sección', () => {
    expect(validateNavLinkHref('/servicios#precios')).toBeNull();
  });

  it('acepta una URL completa', () => {
    expect(validateNavLinkHref('https://instagram.com/mi-negocio')).toBeNull();
  });

  it('rechaza cualquier otra cosa con el mismo mensaje que el backend', () => {
    expect(validateNavLinkHref('nosotros')).toBe(
      'Usa una dirección de tu sitio (empieza con /) o una URL completa',
    );
    expect(validateNavLinkHref('ftp://algo.cl')).toBe(
      'Usa una dirección de tu sitio (empieza con /) o una URL completa',
    );
  });

  it('rechaza un enlace demasiado largo', () => {
    expect(validateNavLinkHref(`/${'a'.repeat(255)}`)).toContain('demasiado largo');
  });
});

describe('pageHref', () => {
  it('la página home vive en la raíz', () => {
    expect(pageHref('home')).toBe('/');
  });

  it('cualquier otra página cuelga de su slug', () => {
    expect(pageHref('servicios')).toBe('/servicios');
  });
});

describe('moveLinkUp / moveLinkDown', () => {
  const links = ['a', 'b', 'c', 'd'];

  it('sube un enlace intercambiándolo con el anterior', () => {
    expect(moveLinkUp(links, 2)).toEqual(['a', 'c', 'b', 'd']);
  });

  it('subir el primero no hace nada', () => {
    expect(moveLinkUp(links, 0)).toEqual(links);
  });

  it('baja un enlace intercambiándolo con el siguiente', () => {
    expect(moveLinkDown(links, 1)).toEqual(['a', 'c', 'b', 'd']);
  });

  it('bajar el último no hace nada', () => {
    expect(moveLinkDown(links, 3)).toEqual(links);
  });
});

describe('reorderLinksByDrag', () => {
  const links = ['a', 'b', 'c', 'd'];

  it('mueve el enlace arrastrado a la posición soltada', () => {
    expect(reorderLinksByDrag(links, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('mueve hacia atrás igual de bien', () => {
    expect(reorderLinksByDrag(links, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
  });

  it('soltar en el mismo lugar no cambia nada', () => {
    expect(reorderLinksByDrag(links, 1, 1)).toEqual(links);
  });

  it('un índice fuera de rango no cambia nada', () => {
    expect(reorderLinksByDrag(links, -1, 2)).toEqual(links);
    expect(reorderLinksByDrag(links, 1, 99)).toEqual(links);
  });
});

describe('describeNavigationIssuePath', () => {
  it('traduce el path de un issue de href', () => {
    expect(describeNavigationIssuePath('links.2.href')).toBe('Enlace 3 (enlace)');
  });

  it('traduce el path de un issue de label', () => {
    expect(describeNavigationIssuePath('links.0.label')).toBe('Enlace 1 (texto)');
  });

  it('un path que no reconoce lo devuelve tal cual', () => {
    expect(describeNavigationIssuePath('links')).toBe('links');
  });
});

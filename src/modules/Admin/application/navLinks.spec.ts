import { visibleNavLinks, isOwnerOnlyPath } from './navLinks';

describe('visibleNavLinks', () => {
  it('la dueña ve claves de acceso y usuarios además de las secciones comunes', () => {
    const hrefs = visibleNavLinks('owner').map((link) => link.href);
    expect(hrefs).toEqual(['/', '/claves', '/usuarios', '/actividad']);
  });

  it('una persona editora no ve claves de acceso ni usuarios', () => {
    const hrefs = visibleNavLinks('editor').map((link) => link.href);
    expect(hrefs).toEqual(['/', '/actividad']);
    expect(hrefs).not.toContain('/claves');
    expect(hrefs).not.toContain('/usuarios');
  });
});

describe('isOwnerOnlyPath', () => {
  it('marca /claves y /usuarios como exclusivas de la dueña', () => {
    expect(isOwnerOnlyPath('/claves')).toBe(true);
    expect(isOwnerOnlyPath('/usuarios')).toBe(true);
  });

  it('no marca las secciones compartidas', () => {
    expect(isOwnerOnlyPath('/')).toBe(false);
    expect(isOwnerOnlyPath('/actividad')).toBe(false);
    expect(isOwnerOnlyPath('/algo-que-no-existe')).toBe(false);
  });
});

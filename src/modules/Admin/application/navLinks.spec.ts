import { visibleNavLinks, isOwnerOnlyPath, isStaffOnlyPath } from './navLinks';

describe('visibleNavLinks', () => {
  it('la dueña ve claves de acceso y usuarios además de las secciones comunes', () => {
    const hrefs = visibleNavLinks('owner').map((link) => link.href);
    expect(hrefs).toEqual([
      '/',
      '/demos',
      '/claves',
      '/usuarios',
      '/cobros',
      '/actividad',
    ]);
  });

  it('una persona editora no ve claves de acceso ni usuarios, pero sí demos', () => {
    const hrefs = visibleNavLinks('editor').map((link) => link.href);
    expect(hrefs).toEqual(['/', '/demos', '/actividad']);
    expect(hrefs).not.toContain('/claves');
    expect(hrefs).not.toContain('/usuarios');
  });

  it('un usuario cliente no ve la sección de demos', () => {
    const hrefs = visibleNavLinks('client').map((link) => link.href);
    expect(hrefs).toEqual(['/', '/actividad']);
    expect(hrefs).not.toContain('/demos');
  });
});

describe('isStaffOnlyPath', () => {
  it('marca la sección de demos y sus fichas', () => {
    expect(isStaffOnlyPath('/demos')).toBe(true);
    expect(isStaffOnlyPath('/demos/018f6f1a-0000-7000-8000-000000000001')).toBe(true);
  });

  it('no marca las secciones compartidas ni rutas que solo empiezan parecido', () => {
    expect(isStaffOnlyPath('/')).toBe(false);
    expect(isStaffOnlyPath('/actividad')).toBe(false);
    expect(isStaffOnlyPath('/demostraciones')).toBe(false);
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

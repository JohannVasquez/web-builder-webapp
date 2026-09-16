import { insertDuplicateAfter, moveSectionDown, moveSectionUp } from './sectionOrdering';

describe('sectionOrdering', () => {
  const ids = [10, 20, 30, 40];

  it('sube un bloque intercambiándolo con el anterior', () => {
    expect(moveSectionUp(ids, 30)).toEqual([10, 30, 20, 40]);
  });

  it('baja un bloque intercambiándolo con el siguiente', () => {
    expect(moveSectionDown(ids, 20)).toEqual([10, 30, 20, 40]);
  });

  it('subir el primero no hace nada', () => {
    expect(moveSectionUp(ids, 10)).toEqual(ids);
  });

  it('bajar el último no hace nada', () => {
    expect(moveSectionDown(ids, 40)).toEqual(ids);
  });

  it('un id que no está en la lista no hace nada', () => {
    expect(moveSectionUp(ids, 999)).toEqual(ids);
    expect(moveSectionDown(ids, 999)).toEqual(ids);
  });

  it('duplicar inserta el nuevo id justo después del original', () => {
    expect(insertDuplicateAfter(ids, 20, 99)).toEqual([10, 20, 99, 30, 40]);
  });

  it('duplicar el último lo inserta al final', () => {
    expect(insertDuplicateAfter(ids, 40, 99)).toEqual([10, 20, 30, 40, 99]);
  });

  it('duplicar un id inexistente agrega el nuevo al final', () => {
    expect(insertDuplicateAfter(ids, 999, 99)).toEqual([10, 20, 30, 40, 99]);
  });
});

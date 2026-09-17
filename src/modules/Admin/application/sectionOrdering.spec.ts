import {
  dropPlacement,
  insertDuplicateAfter,
  moveSectionDown,
  moveSectionUp,
  reorderByDrag,
} from './sectionOrdering';

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

describe('dropPlacement', () => {
  it('la mitad superior del bloque objetivo inserta antes', () => {
    expect(dropPlacement(0)).toBe('before');
    expect(dropPlacement(0.49)).toBe('before');
  });

  it('la mitad inferior del bloque objetivo inserta después', () => {
    expect(dropPlacement(0.5)).toBe('after');
    expect(dropPlacement(1)).toBe('after');
  });
});

describe('reorderByDrag', () => {
  const ids = [10, 20, 30, 40];

  it('arrastrar un bloque antes de otro lo deja justo delante', () => {
    expect(reorderByDrag(ids, 40, 20, 'before')).toEqual([10, 40, 20, 30]);
  });

  it('arrastrar un bloque después de otro lo deja justo detrás', () => {
    expect(reorderByDrag(ids, 10, 30, 'after')).toEqual([20, 30, 10, 40]);
  });

  it('soltar un bloque sobre sí mismo no cambia el orden', () => {
    expect(reorderByDrag(ids, 20, 20, 'before')).toEqual(ids);
  });

  it('un id que no está en la lista no cambia el orden', () => {
    expect(reorderByDrag(ids, 999, 20, 'before')).toEqual(ids);
    expect(reorderByDrag(ids, 20, 999, 'before')).toEqual(ids);
  });

  it('arrastrar el primero después del último lo manda al final', () => {
    expect(reorderByDrag(ids, 10, 40, 'after')).toEqual([20, 30, 40, 10]);
  });
});

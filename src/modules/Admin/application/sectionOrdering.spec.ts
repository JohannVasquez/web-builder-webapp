import {
  dropPlacement,
  insertDuplicateAfter,
  moveSectionDown,
  moveSectionUp,
  reorderByDrag,
} from './sectionOrdering';

describe('sectionOrdering', () => {
  const ids = ['018f6f1a-0000-7000-8000-000000000010', '018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000030', '018f6f1a-0000-7000-8000-000000000040'];

  it('sube un bloque intercambiándolo con el anterior', () => {
    expect(moveSectionUp(ids, '018f6f1a-0000-7000-8000-000000000030')).toEqual(['018f6f1a-0000-7000-8000-000000000010', '018f6f1a-0000-7000-8000-000000000030', '018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000040']);
  });

  it('baja un bloque intercambiándolo con el siguiente', () => {
    expect(moveSectionDown(ids, '018f6f1a-0000-7000-8000-000000000020')).toEqual(['018f6f1a-0000-7000-8000-000000000010', '018f6f1a-0000-7000-8000-000000000030', '018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000040']);
  });

  it('subir el primero no hace nada', () => {
    expect(moveSectionUp(ids, '018f6f1a-0000-7000-8000-000000000010')).toEqual(ids);
  });

  it('bajar el último no hace nada', () => {
    expect(moveSectionDown(ids, '018f6f1a-0000-7000-8000-000000000040')).toEqual(ids);
  });

  it('un id que no está en la lista no hace nada', () => {
    expect(moveSectionUp(ids, '018f6f1a-0000-7000-8000-000000000999')).toEqual(ids);
    expect(moveSectionDown(ids, '018f6f1a-0000-7000-8000-000000000999')).toEqual(ids);
  });

  it('duplicar inserta el nuevo id justo después del original', () => {
    expect(insertDuplicateAfter(ids, '018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000099')).toEqual(['018f6f1a-0000-7000-8000-000000000010', '018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000099', '018f6f1a-0000-7000-8000-000000000030', '018f6f1a-0000-7000-8000-000000000040']);
  });

  it('duplicar el último lo inserta al final', () => {
    expect(insertDuplicateAfter(ids, '018f6f1a-0000-7000-8000-000000000040', '018f6f1a-0000-7000-8000-000000000099')).toEqual(['018f6f1a-0000-7000-8000-000000000010', '018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000030', '018f6f1a-0000-7000-8000-000000000040', '018f6f1a-0000-7000-8000-000000000099']);
  });

  it('duplicar un id inexistente agrega el nuevo al final', () => {
    expect(insertDuplicateAfter(ids, '018f6f1a-0000-7000-8000-000000000999', '018f6f1a-0000-7000-8000-000000000099')).toEqual(['018f6f1a-0000-7000-8000-000000000010', '018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000030', '018f6f1a-0000-7000-8000-000000000040', '018f6f1a-0000-7000-8000-000000000099']);
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
  const ids = ['018f6f1a-0000-7000-8000-000000000010', '018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000030', '018f6f1a-0000-7000-8000-000000000040'];

  it('arrastrar un bloque antes de otro lo deja justo delante', () => {
    expect(reorderByDrag(ids, '018f6f1a-0000-7000-8000-000000000040', '018f6f1a-0000-7000-8000-000000000020', 'before')).toEqual(['018f6f1a-0000-7000-8000-000000000010', '018f6f1a-0000-7000-8000-000000000040', '018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000030']);
  });

  it('arrastrar un bloque después de otro lo deja justo detrás', () => {
    expect(reorderByDrag(ids, '018f6f1a-0000-7000-8000-000000000010', '018f6f1a-0000-7000-8000-000000000030', 'after')).toEqual(['018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000030', '018f6f1a-0000-7000-8000-000000000010', '018f6f1a-0000-7000-8000-000000000040']);
  });

  it('soltar un bloque sobre sí mismo no cambia el orden', () => {
    expect(reorderByDrag(ids, '018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000020', 'before')).toEqual(ids);
  });

  it('un id que no está en la lista no cambia el orden', () => {
    expect(reorderByDrag(ids, '018f6f1a-0000-7000-8000-000000000999', '018f6f1a-0000-7000-8000-000000000020', 'before')).toEqual(ids);
    expect(reorderByDrag(ids, '018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000999', 'before')).toEqual(ids);
  });

  it('arrastrar el primero después del último lo manda al final', () => {
    expect(reorderByDrag(ids, '018f6f1a-0000-7000-8000-000000000010', '018f6f1a-0000-7000-8000-000000000040', 'after')).toEqual(['018f6f1a-0000-7000-8000-000000000020', '018f6f1a-0000-7000-8000-000000000030', '018f6f1a-0000-7000-8000-000000000040', '018f6f1a-0000-7000-8000-000000000010']);
  });
});

import { formatProps, parseProps } from './propsEditor';

describe('propsEditor', () => {
  it('parsea un JSON válido y lo devuelve como objeto', () => {
    const result = parseProps('{"title": "Hola", "count": 2}');
    expect(result).toEqual({ ok: true, value: { title: 'Hola', count: 2 } });
  });

  it('un objeto vacío es válido', () => {
    expect(parseProps('{}')).toEqual({ ok: true, value: {} });
  });

  it('un JSON con sintaxis inválida se rechaza con un mensaje en español y con la posición', () => {
    const result = parseProps('{"a":1,}');
    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('se esperaba un error');
    }
    expect(result.error).toContain('posición 7');
    expect(result.error).not.toMatch(/Unexpected/);
  });

  it('un JSON incompleto se rechaza con un mensaje claro aunque no traiga posición', () => {
    const result = parseProps('');
    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('se esperaba un error');
    }
    expect(result.error).toContain('incompleto');
  });

  it('un arreglo se rechaza porque no es un objeto', () => {
    const result = parseProps('[1, 2, 3]');
    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('se esperaba un error');
    }
    expect(result.error).toMatch(/objeto/i);
  });

  it('un número suelto se rechaza porque no es un objeto', () => {
    const result = parseProps('42');
    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('se esperaba un error');
    }
    expect(result.error).toMatch(/objeto/i);
  });

  it('formatea props como JSON legible con dos espacios de indentación', () => {
    expect(formatProps({ title: 'Hola' })).toBe('{\n  "title": "Hola"\n}');
  });
});

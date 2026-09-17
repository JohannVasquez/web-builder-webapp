import { formatClp } from './money';

describe('formatClp', () => {
  it('formatea miles con punto y sin decimales', () => {
    expect(formatClp(29990)).toBe('$29.990');
  });

  it('formatea 0', () => {
    expect(formatClp(0)).toBe('$0');
  });

  it('formatea montos menores a mil sin separador', () => {
    expect(formatClp(500)).toBe('$500');
  });
});

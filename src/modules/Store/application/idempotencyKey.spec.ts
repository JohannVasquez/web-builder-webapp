import { createIdempotencyKeyTracker } from './idempotencyKey';

describe('createIdempotencyKeyTracker', () => {
  const tracker = (): ReturnType<typeof createIdempotencyKeyTracker> => {
    let count = 0;
    return createIdempotencyKeyTracker(() => {
      count += 1;
      return `clave-${String(count)}`;
    });
  };

  it('la misma compra repetida reusa la clave', () => {
    const keyFor = tracker();
    const purchase = { items: [{ productId: '018f6f1a-0000-7000-8000-000000000001', quantity: 2 }] };

    expect(keyFor(purchase)).toBe('clave-1');
    expect(keyFor({ items: [{ productId: '018f6f1a-0000-7000-8000-000000000001', quantity: 2 }] })).toBe('clave-1');
  });

  it('una compra corregida recibe una clave nueva', () => {
    const keyFor = tracker();

    keyFor({ items: [{ productId: '018f6f1a-0000-7000-8000-000000000001', quantity: 2 }] });

    expect(keyFor({ items: [{ productId: '018f6f1a-0000-7000-8000-000000000001', quantity: 1 }] })).toBe('clave-2');
  });
});

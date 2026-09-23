import { renderToStaticMarkup } from 'react-dom/server';
import { CouponForm } from './CouponForm';
import type { Coupon } from '../domain/StoreApi';

jest.mock('./useAdminApi', () => ({
  useAdminApi: () => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    remove: jest.fn(),
  }),
}));

describe('CouponForm', () => {
  it('renders form and displays initial values', () => {
    const coupon: Coupon = {
      id: '018f6f1a-0000-7000-8000-000000000001',
      code: 'PROMO10',
      discountType: 'percentage',
      value: 10,
      minimumCents: null,
      startsAt: null,
      endsAt: null,
      maxUses: null,
      usedCount: 0,
      isActive: true,
    };

    const html = renderToStaticMarkup(
      <CouponForm tenantId={'018f6f1a-0000-7000-8000-000000000001'} coupon={coupon} onClose={() => {}} />,
    );

    expect(html).toContain('Editar Cupón');
    expect(html).toContain('PROMO10');
    expect(html).toContain('10');
  });

  it('renders empty form for new coupon', () => {
    const html = renderToStaticMarkup(
      <CouponForm tenantId={'018f6f1a-0000-7000-8000-000000000001'} coupon={null} onClose={() => {}} />,
    );

    expect(html).toContain('Crear Cupón');
  });
});

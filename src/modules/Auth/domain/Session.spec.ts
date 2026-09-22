import { SessionSchema, MeUserSchema } from './Session';

describe('SessionSchema', () => {
  it('parsea una sesión con el rol de quien entró', () => {
    const parsed = SessionSchema.parse({
      token: 'tok',
      user: { id: '018f6f1a-0000-7000-8000-000000000001', email: 'ana@test.cl', name: 'Ana', role: 'owner' },
    });

    expect(parsed.user.role).toBe('owner');
  });

  it('acepta el rol editor', () => {
    const parsed = SessionSchema.parse({
      token: 'tok',
      user: { id: '018f6f1a-0000-7000-8000-000000000002', email: 'ben@test.cl', name: 'Ben', role: 'editor' },
    });

    expect(parsed.user.role).toBe('editor');
  });

  it('rechaza un rol que no existe', () => {
    const result = SessionSchema.safeParse({
      token: 'tok',
      user: { id: '018f6f1a-0000-7000-8000-000000000001', email: 'ana@test.cl', name: 'Ana', role: 'superadmin' },
    });

    expect(result.success).toBe(false);
  });
});

describe('MeUserSchema', () => {
  it('parsea la respuesta de /api/admin/me, que no trae email', () => {
    const parsed = MeUserSchema.parse({ id: '018f6f1a-0000-7000-8000-000000000001', name: 'Ana', role: 'owner' });

    expect(parsed).toEqual({ id: '018f6f1a-0000-7000-8000-000000000001', name: 'Ana', role: 'owner' });
  });
});

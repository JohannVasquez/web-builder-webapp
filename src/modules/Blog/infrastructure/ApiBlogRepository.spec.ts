import { cookies } from 'next/headers';
import { ApiBlogRepository } from './ApiBlogRepository';

jest.mock('next/headers', () => ({
  draftMode: jest.fn().mockResolvedValue({ isEnabled: false }),
  cookies: jest.fn(),
}));

const DEMO_TOKEN = `demo_${'3c'.repeat(32)}`;

const SUMMARY = {
  slug: 'hola',
  title: 'Hola',
  excerpt: '',
  coverImageUrl: 'https://bucket.example/portada.jpg?sig=1',
  coverImageKey: 'tenant/portada.jpg',
  authorName: 'Ana',
  publishedAt: '2026-01-01T00:00:00.000Z',
  tags: [],
  readingMinutes: 1,
};

const POST = {
  ...SUMMARY,
  content: [],
  seoTitle: null,
  seoDescription: null,
  ogImageUrl: null,
  related: [{ ...SUMMARY, slug: 'otra' }],
};

describe('ApiBlogRepository en una demo de prospecto', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(Response.json({ post: POST }));
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('descarta la clave de portada (también de las relacionadas) para usar la URL firmada', async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: () => ({ name: 'demo_token', value: DEMO_TOKEN }),
    });

    const post = await new ApiBlogRepository('http://api', 'demo-luna.cl').findBySlug(
      'hola',
    );

    expect(post?.coverImageKey).toBeNull();
    expect(post?.coverImageUrl).toBe(SUMMARY.coverImageUrl);
    expect(post?.related[0]?.coverImageKey).toBeNull();
  });

  it('un cliente normal conserva la clave', async () => {
    (cookies as jest.Mock).mockResolvedValue({ get: () => undefined });

    const post = await new ApiBlogRepository('http://api', 'acme.cl').findBySlug('hola');

    expect(post?.coverImageKey).toBe(SUMMARY.coverImageKey);
  });
});

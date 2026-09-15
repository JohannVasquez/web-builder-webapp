import { renderToStaticMarkup } from 'react-dom/server';
import { Footer } from './Footer';
import { DEFAULT_GLOBAL_SETTINGS, type GlobalSettings } from '../domain/GlobalSettings';

describe('Footer', () => {
  const baseSettings: GlobalSettings = {
    ...DEFAULT_GLOBAL_SETTINGS,
    siteName: 'Acme Co.',
  };

  it('only shows the social links that have a value', () => {
    const settings: GlobalSettings = {
      ...baseSettings,
      instagramUrl: 'https://instagram.com/acme',
      facebookUrl: '',
      tiktokUrl: '',
    };

    const html = renderToStaticMarkup(<Footer settings={settings} />);

    expect(html).toContain('aria-label="Instagram"');
    expect(html).not.toContain('aria-label="Facebook"');
    expect(html).not.toContain('aria-label="TikTok"');
  });

  it('does not render the "Síguenos" title when every social field is empty', () => {
    const html = renderToStaticMarkup(<Footer settings={baseSettings} />);

    expect(html).not.toContain('Síguenos');
  });

  it('uses customLinkLabel as the aria-label for the custom link', () => {
    const settings: GlobalSettings = {
      ...baseSettings,
      customLinkUrl: 'https://example.com/press',
      customLinkLabel: 'Prensa',
    };

    const html = renderToStaticMarkup(<Footer settings={settings} />);

    expect(html).toContain('aria-label="Prensa"');
  });

  it('falls back to "Enlace" when customLinkLabel is empty', () => {
    const settings: GlobalSettings = {
      ...baseSettings,
      customLinkUrl: 'https://example.com/press',
      customLinkLabel: '',
    };

    const html = renderToStaticMarkup(<Footer settings={settings} />);

    expect(html).toContain('aria-label="Enlace"');
  });

  it('shows the logo image instead of the site name when logoLight is set', () => {
    const settings: GlobalSettings = {
      ...baseSettings,
      brand: {
        ...baseSettings.brand,
        assets: {
          ...baseSettings.brand.assets,
          logoLight: 'https://cdn.example.com/logo.png',
        },
      },
    };

    const html = renderToStaticMarkup(<Footer settings={settings} />);

    expect(html).toContain('<img');
    expect(html).toContain('https://cdn.example.com/logo.png');
    expect(html).not.toContain('<p class="text-lg font-bold">Acme Co.</p>');
  });
});

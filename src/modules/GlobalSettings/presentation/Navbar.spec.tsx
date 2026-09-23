import { renderToStaticMarkup } from 'react-dom/server';
import { Navbar } from './Navbar';
import { DEFAULT_GLOBAL_SETTINGS, type GlobalSettings } from '../domain/GlobalSettings';

describe('Navbar', () => {
  const baseSettings: GlobalSettings = {
    ...DEFAULT_GLOBAL_SETTINGS,
    siteName: 'Acme Co.',
  };

  it('shows the site name when there is no logo', () => {
    const html = renderToStaticMarkup(<Navbar settings={baseSettings} links={[]} />);

    expect(html).toContain('Acme Co.');
    expect(html).not.toContain('<img');
  });

  it('shows the logo image with the site name as alt when logoLight is set', () => {
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

    const html = renderToStaticMarkup(<Navbar settings={settings} links={[]} />);

    expect(html).toContain('<img');
    expect(html).toContain('alt="Acme Co."');
    expect(html).toContain('https://cdn.example.com/logo.png');
  });

  it('renders both logos with theme-specific classes when logoDark is also set', () => {
    const settings: GlobalSettings = {
      ...baseSettings,
      brand: {
        ...baseSettings.brand,
        assets: {
          ...baseSettings.brand.assets,
          logoLight: 'https://cdn.example.com/logo-light.png',
          logoDark: 'https://cdn.example.com/logo-dark.png',
        },
      },
    };

    const html = renderToStaticMarkup(<Navbar settings={settings} links={[]} />);

    expect(html).toContain('logo-light.png');
    expect(html).toContain('logo-dark.png');
    expect(html).toContain('dark:hidden');
    expect(html).toContain('dark:block');
  });

  it('shows the theme toggle when colorMode is system', () => {
    const settings: GlobalSettings = {
      ...baseSettings,
      brand: { ...baseSettings.brand, colorMode: 'system' },
    };

    const html = renderToStaticMarkup(<Navbar settings={settings} links={[]} />);

    expect(html).toContain('Cambiar a modo oscuro');
  });

  it('hides the theme toggle when colorMode is light', () => {
    const settings: GlobalSettings = {
      ...baseSettings,
      brand: { ...baseSettings.brand, colorMode: 'light' },
    };

    const html = renderToStaticMarkup(<Navbar settings={settings} links={[]} />);

    expect(html).not.toContain('Cambiar a modo');
  });
});

import type { ReactElement } from 'react';
import type { Brand } from '../domain/Brand';
import { resolveBrandTheme, textScaleTokens, type ThemeTokens } from '../domain/theme';

interface BrandStyleProps {
  readonly brand: Brand;
  readonly headingVariable: string;
  readonly bodyVariable: string;
}

const declarations = (tokens: ThemeTokens): string =>
  Object.entries(tokens)
    .map(([name, value]) => `${name}:${value};`)
    .join('');

// Los tokens van en un <style> del servidor, no en `style=`, porque hay dos temas y :root manda.
export function BrandStyle({
  brand,
  headingVariable,
  bodyVariable,
}: BrandStyleProps): ReactElement {
  const theme = resolveBrandTheme(brand.palette);
  const scale = textScaleTokens(brand.typography.scale);
  const fonts = `--font-heading:var(${headingVariable});--font-body:var(${bodyVariable});`;

  const css = [
    `:root{${declarations(theme.light)}${declarations(scale)}${fonts}}`,
    `.dark{${declarations(theme.dark)}}`,
  ].join('');

  return <style data-brand-tokens="">{css}</style>;
}

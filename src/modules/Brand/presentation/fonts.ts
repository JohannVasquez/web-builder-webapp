import {
  Inter,
  Playfair_Display,
  Montserrat,
  Open_Sans,
  Poppins,
  DM_Serif_Display,
  DM_Sans,
  Space_Grotesk,
  Bebas_Neue,
  Roboto,
  Lora,
  Source_Sans_3,
  Oswald,
  Lato,
  Nunito,
  Archivo_Black,
  Archivo,
} from 'next/font/google';

export interface LoadedFontPairing {
  // Nombre de la variable CSS, no el className: lo consume `var(--font-heading)`.
  readonly headingVariableName: string;
  readonly bodyVariableName: string;
}

export const DEFAULT_PAIRING_ID = 'inter';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-inter',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-playfair-display',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-montserrat',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-open-sans',
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-dm-serif-display',
  weight: ['400'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-dm-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-space-grotesk',
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-bebas-neue',
  weight: ['400'],
});

const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-roboto',
});

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-lora',
});

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-source-sans-3',
});

const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-oswald',
});

const lato = Lato({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-lato',
  weight: ['400', '700'],
});

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-nunito',
});

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-archivo-black',
  weight: ['400'],
});

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-archivo',
});

const VAR_NAMES = {
  inter: '--font-inter',
  playfairDisplay: '--font-playfair-display',
  montserrat: '--font-montserrat',
  openSans: '--font-open-sans',
  poppins: '--font-poppins',
  dmSerifDisplay: '--font-dm-serif-display',
  dmSans: '--font-dm-sans',
  spaceGrotesk: '--font-space-grotesk',
  bebasNeue: '--font-bebas-neue',
  roboto: '--font-roboto',
  lora: '--font-lora',
  sourceSans3: '--font-source-sans-3',
  oswald: '--font-oswald',
  lato: '--font-lato',
  nunito: '--font-nunito',
  archivoBlack: '--font-archivo-black',
  archivo: '--font-archivo',
} as const;

// Se aplican los 17 al <html>: cada className solo declara una variable CSS, y el archivo
// de fuente se descarga únicamente cuando el pairing elegido lo usa de verdad.
export const ALL_FONT_VARIABLE_CLASSNAMES = [
  inter,
  playfairDisplay,
  montserrat,
  openSans,
  poppins,
  dmSerifDisplay,
  dmSans,
  spaceGrotesk,
  bebasNeue,
  roboto,
  lora,
  sourceSans3,
  oswald,
  lato,
  nunito,
  archivoBlack,
  archivo,
]
  .map((font) => font.variable)
  .join(' ');

const FONT_PAIRINGS: Record<string, LoadedFontPairing> = {
  inter: {
    headingVariableName: VAR_NAMES.inter,
    bodyVariableName: VAR_NAMES.inter,
  },
  'playfair-inter': {
    headingVariableName: VAR_NAMES.playfairDisplay,
    bodyVariableName: VAR_NAMES.inter,
  },
  'montserrat-open-sans': {
    headingVariableName: VAR_NAMES.montserrat,
    bodyVariableName: VAR_NAMES.openSans,
  },
  'poppins-inter': {
    headingVariableName: VAR_NAMES.poppins,
    bodyVariableName: VAR_NAMES.inter,
  },
  'dm-serif-dm-sans': {
    headingVariableName: VAR_NAMES.dmSerifDisplay,
    bodyVariableName: VAR_NAMES.dmSans,
  },
  'space-grotesk-inter': {
    headingVariableName: VAR_NAMES.spaceGrotesk,
    bodyVariableName: VAR_NAMES.inter,
  },
  'bebas-roboto': {
    headingVariableName: VAR_NAMES.bebasNeue,
    bodyVariableName: VAR_NAMES.roboto,
  },
  'lora-source-sans': {
    headingVariableName: VAR_NAMES.lora,
    bodyVariableName: VAR_NAMES.sourceSans3,
  },
  'oswald-lato': {
    headingVariableName: VAR_NAMES.oswald,
    bodyVariableName: VAR_NAMES.lato,
  },
  nunito: {
    headingVariableName: VAR_NAMES.nunito,
    bodyVariableName: VAR_NAMES.nunito,
  },
  'archivo-black-archivo': {
    headingVariableName: VAR_NAMES.archivoBlack,
    bodyVariableName: VAR_NAMES.archivo,
  },
};

export function resolveFontPairing(id: string): LoadedFontPairing {
  return FONT_PAIRINGS[id] ?? FONT_PAIRINGS[DEFAULT_PAIRING_ID];
}

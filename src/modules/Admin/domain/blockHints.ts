// Ayuda para el editor de `props` en JSON (Pantalla 2): qué campos acepta cada tipo de
// bloque. Escrito a mano leyendo el `z.object({...})` de cada componente en
// `src/modules/Page/presentation/sections/`. No es una validación, solo texto de ayuda.

// Casi todos los bloques mezclan estos dos grupos de props opcionales además de los suyos.
const BACKGROUND_HINT =
  'backgroundColor (color CSS), backgroundImageUrl (URL de imagen), backgroundOverlayColor (color del velo sobre la imagen)';
const LAYOUT_HINT =
  'paddingY ("compact"/"normal"/"spacious"), contentWidth ("tight"/"narrow"/"medium"/"normal"/"wide"/"full"), textAlign ("left"/"center"/"right"), animation ("none"/"fade"/"slide"), hideOn (null, "mobile" o "desktop")';

export const BLOCK_PROPS_HINTS: Readonly<Record<string, string>> = {
  Hero:
    'eyebrow (texto sobre el título), title, titleAccent (segunda línea destacada), subtitle, ' +
    'ctaLabel/ctaHref (botón principal), secondaryCtaLabel/secondaryCtaHref (botón secundario), ' +
    'imageUrl o images (arreglo de URLs, rotan como carrusel), overlayColor, textColor, accentColor. ' +
    `También: ${LAYOUT_HINT}.`,
  Features:
    'eyebrow, title, accentColor, variant ("card" o "plain"), items (arreglo de {icon, imageUrl, title, description}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  CallToAction:
    'title, subtitle, buttonLabel, buttonHref, textColor. ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  TextBlock:
    'title, content (texto principal), imageUrl, imageAlt. ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  ContactForm:
    'title, subtitle, accentColor, channels (arreglo de canales de contacto: teléfono, WhatsApp, email, horario). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Stats:
    'title, textColor, accentColor, items (arreglo de {value, label}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  ServiceCards:
    'title, subtitle, accentColor, viewAllLabel/viewAllHref, ' +
    'items (arreglo de {icon, title, description, checklist (arreglo de textos), linkLabel, linkHref}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  SplitHighlights:
    'eyebrow, title, accentColor, imageUrl, imageAlt, imagePosition ("left" o "right"), ' +
    'items (arreglo de {icon, title, description}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Testimonials:
    'title, accentColor, items (arreglo de {badgeLabel, quote, rating (1 a 5), authorName, authorLocation}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  LocationMap:
    'title, subtitle, accentColor, address, lat, lng, mapLabel (texto del enlace a Google Maps). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
  Columns:
    'title, subtitle, accentColor, columns (1 a 4 elementos: {imageUrl, imageAlt, eyebrow, title, content}). ' +
    `También: ${BACKGROUND_HINT}; ${LAYOUT_HINT}.`,
};

export const blockPropsHint = (type: string): string =>
  BLOCK_PROPS_HINTS[type] ?? 'Este tipo de bloque no tiene ayuda de props registrada.';

import type { ReactElement } from 'react';
import type { ColorMode } from '../domain/Brand';

export const THEME_STORAGE_KEY = 'web-builder.theme';

interface ThemeScriptProps {
  readonly colorMode: ColorMode;
}

// Corre antes de pintar: evita el parpadeo de tema y marca que hay JS, para que las
// animaciones de entrada nazcan ocultas en vez de esconderse después del primer pintado.
const script = (mode: ColorMode, storageKey: string): string => `
(function(){try{
var mode=${JSON.stringify(mode)};
var chosen=mode==='system'?(localStorage.getItem(${JSON.stringify(storageKey)})||'system'):mode;
var dark=chosen==='dark'||(chosen==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.classList.toggle('dark',dark);
if(window.IntersectionObserver){document.documentElement.dataset.js='on';}
}catch(e){}})();`;

export function ThemeScript({ colorMode }: ThemeScriptProps): ReactElement {
  return (
    <script
      // El script tiene que correr antes del primer paint; no hay forma sin inyectarlo inline.
      dangerouslySetInnerHTML={{ __html: script(colorMode, THEME_STORAGE_KEY) }}
    />
  );
}

import type { ReactElement } from 'react';
import type { ColorMode } from '../domain/Brand';

export const THEME_STORAGE_KEY = 'web-builder.theme';

interface ThemeScriptProps {
  readonly colorMode: ColorMode;
}

// Corre antes de pintar para que no se vea el parpadeo de tema claro antes del oscuro.
const script = (mode: ColorMode, storageKey: string): string => `
(function(){try{
var mode=${JSON.stringify(mode)};
var chosen=mode==='system'?(localStorage.getItem(${JSON.stringify(storageKey)})||'system'):mode;
var dark=chosen==='dark'||(chosen==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.classList.toggle('dark',dark);
}catch(e){}})();`;

export function ThemeScript({ colorMode }: ThemeScriptProps): ReactElement {
  return (
    <script
      // El script tiene que correr antes del primer paint; no hay forma sin inyectarlo inline.
      dangerouslySetInnerHTML={{ __html: script(colorMode, THEME_STORAGE_KEY) }}
    />
  );
}

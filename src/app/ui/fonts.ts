// Before the calls, so the Latin faces come last: where ranges overlap the
// browser takes the face declared last, and Latin's file is the preloaded one.
import '../styles/fonts.scss';

import localFont from 'next/font/local';

// Faces from Fontsource 5.3.0, committed with their OFL licences under
// `../styles/fonts/` so a build needs no network — every subset Google Fonts
// served, one `@font-face` per subset, so a page fetches only what its text
// uses. Latin is declared here, where `next/font` preloads it and sizes a
// fallback from it; the rest is `fonts.scss`.
//
// The declared family name must be the const's name: Turbopack's variable
// names the family after the binding, and `fonts.scss` joins it by that name.

const merriweather = localFont({
  src: [
    {
      path: '../styles/fonts/merriweather-latin-300-normal.woff2',
      weight: '300',
    },
    {
      path: '../styles/fonts/merriweather-latin-400-normal.woff2',
      weight: '400',
    },
    {
      path: '../styles/fonts/merriweather-latin-700-normal.woff2',
      weight: '700',
    },
  ],
  style: 'normal',
  variable: '--font-merriweather',
  adjustFontFallback: 'Times New Roman',
  declarations: [
    { prop: 'font-family', value: 'merriweather' },
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    },
  ],
});

const jetbrainsMono = localFont({
  src: '../styles/fonts/jetbrains-mono-latin-wght-normal.woff2',
  weight: '100 800',
  style: 'normal',
  variable: '--font-mono',
  declarations: [
    { prop: 'font-family', value: 'jetbrainsMono' },
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    },
  ],
});

export const fontVariables = `${merriweather.variable} ${jetbrainsMono.variable}`;

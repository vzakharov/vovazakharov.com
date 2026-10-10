import localFont from 'next/font/local';

// Faces from Fontsource 5.3.0, committed with their OFL licences under
// `../styles/fonts/` so a build needs no network. `next/font/local` takes only
// literals, hence the repeated ranges.
//
// A family is two calls, one per subset, so Cyrillic is fetched only for a page
// that has some. Both declare the family name, which must be the Latin call's
// const name: Turbopack's variable names the family after the binding. Only the
// Latin call preloads and sizes a fallback — the Cyrillic file has no Latin
// glyphs to size one from.

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

const merriweatherCyrillic = localFont({
  src: [
    {
      path: '../styles/fonts/merriweather-cyrillic-300-normal.woff2',
      weight: '300',
    },
    {
      path: '../styles/fonts/merriweather-cyrillic-400-normal.woff2',
      weight: '400',
    },
    {
      path: '../styles/fonts/merriweather-cyrillic-700-normal.woff2',
      weight: '700',
    },
  ],
  style: 'normal',
  variable: '--font-merriweather-cyrillic',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: 'merriweather' },
    {
      prop: 'unicode-range',
      value: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
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

const jetbrainsMonoCyrillic = localFont({
  src: '../styles/fonts/jetbrains-mono-cyrillic-wght-normal.woff2',
  weight: '100 800',
  style: 'normal',
  variable: '--font-mono-cyrillic',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: 'jetbrainsMono' },
    {
      prop: 'unicode-range',
      value: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
    },
  ],
});

/**
 * For `<html>`. The Cyrillic variables go unread; listing them is what uses
 * the binding `next/font` requires each call to have.
 */
export const fontVariables = [
  merriweather,
  merriweatherCyrillic,
  jetbrainsMono,
  jetbrainsMonoCyrillic,
]
  .map((font) => font.variable)
  .join(' ');

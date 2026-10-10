import localFont from 'next/font/local';

// The faces are committed under `../styles/fonts/`, copied from Fontsource
// 5.3.0 beside their OFL licences, so a build never reaches the network for
// them and a font changes only when someone replaces a file. `next/font/local`
// takes only literals, hence the ranges repeated per call rather than shared.
//
// Each font is one family split across two calls, one per subset, each call's
// `unicode-range` letting the browser fetch Cyrillic only on a page that has
// some. Both calls name the family in `declarations`, which `next/font` leaves
// unhashed — and that name must be the Latin call's const name: the variable
// Turbopack writes names the family after the binding, not the declaration.
// The Latin call owns the variable and the metric-matched fallback; the
// Cyrillic file has no Latin glyphs to measure a fallback from.

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
 * Every font's classes, for `<html>`. The Cyrillic calls' variables are read
 * by nothing; their classes are here so each call's `@font-face` rules are
 * pulled into the page.
 */
export const fontVariables = [
  merriweather,
  merriweatherCyrillic,
  jetbrainsMono,
  jetbrainsMonoCyrillic,
]
  .map((font) => font.variable)
  .join(' ');

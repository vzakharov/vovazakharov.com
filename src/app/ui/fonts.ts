import localFont from 'next/font/local';

// Faces from Fontsource 5.3.0, committed with their OFL licences under
// `../styles/fonts/` so a build needs no network — every subset Google Fonts
// served, so text in any of them keeps its face. `next/font/local` takes only
// literals, hence the repeated ranges.
//
// A family is one call per subset, so a page fetches only the subsets its text
// uses. All declare the family name, which must be the Latin call's const name:
// Turbopack's variable names the family after the binding. Where ranges
// overlap the browser takes the face declared last, so Latin comes last, as in
// Google's own sheet. Only the Latin call preloads and sizes a fallback — the
// other files lack the Latin glyphs a fallback is sized from.

const merriweatherCyrillicExt = localFont({
  src: [
    {
      path: '../styles/fonts/merriweather-cyrillic-ext-300-normal.woff2',
      weight: '300',
    },
    {
      path: '../styles/fonts/merriweather-cyrillic-ext-400-normal.woff2',
      weight: '400',
    },
    {
      path: '../styles/fonts/merriweather-cyrillic-ext-700-normal.woff2',
      weight: '700',
    },
  ],
  style: 'normal',
  variable: '--font-merriweather-cyrillic-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: 'merriweather' },
    {
      prop: 'unicode-range',
      value:
        'U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F',
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

const merriweatherVietnamese = localFont({
  src: [
    {
      path: '../styles/fonts/merriweather-vietnamese-300-normal.woff2',
      weight: '300',
    },
    {
      path: '../styles/fonts/merriweather-vietnamese-400-normal.woff2',
      weight: '400',
    },
    {
      path: '../styles/fonts/merriweather-vietnamese-700-normal.woff2',
      weight: '700',
    },
  ],
  style: 'normal',
  variable: '--font-merriweather-vietnamese',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: 'merriweather' },
    {
      prop: 'unicode-range',
      value:
        'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB',
    },
  ],
});

const merriweatherLatinExt = localFont({
  src: [
    {
      path: '../styles/fonts/merriweather-latin-ext-300-normal.woff2',
      weight: '300',
    },
    {
      path: '../styles/fonts/merriweather-latin-ext-400-normal.woff2',
      weight: '400',
    },
    {
      path: '../styles/fonts/merriweather-latin-ext-700-normal.woff2',
      weight: '700',
    },
  ],
  style: 'normal',
  variable: '--font-merriweather-latin-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: 'merriweather' },
    {
      prop: 'unicode-range',
      value:
        'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
    },
  ],
});

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

const jetbrainsMonoCyrillicExt = localFont({
  src: '../styles/fonts/jetbrains-mono-cyrillic-ext-wght-normal.woff2',
  weight: '100 800',
  style: 'normal',
  variable: '--font-mono-cyrillic-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: 'jetbrainsMono' },
    {
      prop: 'unicode-range',
      value:
        'U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F',
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

const jetbrainsMonoGreek = localFont({
  src: '../styles/fonts/jetbrains-mono-greek-wght-normal.woff2',
  weight: '100 800',
  style: 'normal',
  variable: '--font-mono-greek',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: 'jetbrainsMono' },
    {
      prop: 'unicode-range',
      value:
        'U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF',
    },
  ],
});

const jetbrainsMonoVietnamese = localFont({
  src: '../styles/fonts/jetbrains-mono-vietnamese-wght-normal.woff2',
  weight: '100 800',
  style: 'normal',
  variable: '--font-mono-vietnamese',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: 'jetbrainsMono' },
    {
      prop: 'unicode-range',
      value:
        'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB',
    },
  ],
});

const jetbrainsMonoLatinExt = localFont({
  src: '../styles/fonts/jetbrains-mono-latin-ext-wght-normal.woff2',
  weight: '100 800',
  style: 'normal',
  variable: '--font-mono-latin-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: 'jetbrainsMono' },
    {
      prop: 'unicode-range',
      value:
        'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
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

/**
 * For `<html>`. Only the Latin calls' variables are read; listing the rest is
 * what uses the binding `next/font` requires each call to have.
 */
export const fontVariables = [
  merriweatherCyrillicExt,
  merriweatherCyrillic,
  merriweatherVietnamese,
  merriweatherLatinExt,
  merriweather,
  jetbrainsMonoCyrillicExt,
  jetbrainsMonoCyrillic,
  jetbrainsMonoGreek,
  jetbrainsMonoVietnamese,
  jetbrainsMonoLatinExt,
  jetbrainsMono,
]
  .map((font) => font.variable)
  .join(' ');

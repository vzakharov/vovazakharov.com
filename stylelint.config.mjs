/** @type {import('stylelint').Config} */
const config = {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: ['.next/**', 'out/**', 'node_modules/**'],
  rules: {
    // CSS-module class and keyframe names are camelCase here, which the
    // standard config's kebab-case patterns reject.
    'selector-class-pattern': null,
    'keyframes-name-pattern': null,
    // CSS-modules syntax the standard config does not know about.
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global', 'local'] },
    ],
    'property-no-unknown': [true, { ignoreProperties: ['composes'] }],
  },
};

export default config;

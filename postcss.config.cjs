module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      // Kept in step with `theme.breakpoints` in src/app/styles/theme.ts and
      // the `$breakpoint-*` variables in src/shared/styles/_mantine.scss.
      variables: {
        'mantine-breakpoint-xs': '30em',
        'mantine-breakpoint-sm': '40em',
        'mantine-breakpoint-md': '48em',
        'mantine-breakpoint-lg': '64em',
        'mantine-breakpoint-xl': '80em',
      },
    },
  },
};

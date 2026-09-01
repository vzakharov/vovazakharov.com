// `noUncheckedSideEffectImports` requires a declaration for any import with no
// bindings, and Next ships none for plain stylesheets — the bundler resolves them,
// TypeScript cannot. Declaring the one extension it owns keeps the flag's coverage
// for every other side-effect import.
declare module '*.css';

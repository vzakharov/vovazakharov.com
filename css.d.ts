// Next ships no declaration for plain stylesheets, which `noUncheckedSideEffectImports`
// demands of any binding-less import. Declaring only the extension its bundler owns
// keeps the flag's coverage for every other side-effect import.
declare module '*.css';

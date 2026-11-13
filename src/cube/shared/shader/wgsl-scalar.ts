import vm from 'node:vm';

/**
 * Runs the scalar functions of a WGSL listing in Node, so a test can hold a
 * TypeScript twin to the shader text itself and not to a second reading of
 * it. It covers the WGSL such functions are written in — `f32` arguments and
 * results, `let`/`var`, `if`, `for`, the scalar built-ins — and nothing with
 * vectors, which come out as nonsense or throw.
 */

const clamp = (x: number, low: number, high: number): number =>
  Math.min(Math.max(x, low), high);

const { sin, cos, sqrt, exp, log, pow, abs, floor, min, max, tanh, atan2 } =
  Math;

const BUILT_INS = {
  sin,
  cos,
  sqrt,
  exp,
  log,
  pow,
  abs,
  floor,
  min,
  max,
  tanh,
  atan2,
  clamp,
  fract: (x: number): number => x - floor(x),
  mix: (a: number, b: number, t: number): number => a + (b - a) * t,
  smoothstep: (from: number, to: number, x: number): number => {
    const t = clamp((x - from) / (to - from), 0, 1);
    return t * t * (3 - 2 * t);
  },
  select: (no: number, yes: number, when: boolean): number => (when ? yes : no),
  f32: (x: number): number => x,
  vec2f: (...parts: number[]): number[] => parts,
  vec3f: (...parts: number[]): number[] => parts,
};

/** `listing` as the JavaScript the scalar subset of WGSL reads as. */
const asScript = (listing: string): string =>
  listing
    .replaceAll(/\bfn\b/g, 'function')
    .replaceAll(/->\s*\w+/g, '')
    .replaceAll(/:\s*(?:f32|i32|u32|bool|vec[2-4]f)\b/g, '')
    .replaceAll(/\blet\b/g, 'const')
    .replaceAll(/\bvar\b/g, 'let')
    .replaceAll(/(\d)u\b/g, '$1');

/**
 * A caller of `listing`'s functions by name: `call('bore', 0.3)` is what the
 * shader's `bore(0.3)` returns, in double precision.
 */
export function scalarWgsl(
  listing: string,
): (name: string, ...args: number[]) => number {
  const sandbox = { ...BUILT_INS };
  vm.createContext(sandbox);
  vm.runInContext(asScript(listing), sandbox);
  return (name, ...args) => {
    const result: unknown = vm.runInContext(
      `${name}(${args.map(String).join(', ')})`,
      sandbox,
    );
    if (typeof result !== 'number') {
      throw new TypeError(`${name} did not return a number`);
    }
    return result;
  };
}

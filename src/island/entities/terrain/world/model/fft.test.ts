import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Complex, fft, fft2, ifft, ifft2 } from './fft';

const value = (j: number, s: number) =>
  Math.sin(j * 12.9898 + s * 78.233) * 3.5;

/** A deterministic complex signal of `length` values. */
function signal(length: number, salt: number): Complex {
  return {
    re: Float64Array.from({ length }, (_, j) => value(j, salt)),
    im: Float64Array.from({ length }, (_, j) => value(j, salt + 1)),
  };
}

const copy = ({ re, im }: Complex): Complex => ({
  re: [...re],
  im: [...im],
});

/** The direct `O(n²)` DFT over `points` of an `n`-point grid, either sign. */
function naive(
  { re, im }: Complex,
  sign: number,
  phase: (j: number, k: number) => number,
) {
  const n = re.length;
  const out = { re: new Float64Array(n), im: new Float64Array(n) };
  for (let k = 0; k < n; k += 1) {
    for (let j = 0; j < n; j += 1) {
      const angle = sign * 2 * Math.PI * phase(j, k);
      const [xr, xi] = [re[j] ?? 0, im[j] ?? 0];
      out.re[k] =
        (out.re[k] ?? 0) + xr * Math.cos(angle) - xi * Math.sin(angle);
      out.im[k] =
        (out.im[k] ?? 0) + xr * Math.sin(angle) + xi * Math.cos(angle);
    }
  }
  return out;
}

function assertClose(a: Complex, b: Complex, tolerance: number) {
  for (let j = 0; j < a.re.length; j += 1) {
    assert.ok(Math.abs((a.re[j] ?? 0) - (b.re[j] ?? 0)) < tolerance, `re ${j}`);
    assert.ok(Math.abs((a.im[j] ?? 0) - (b.im[j] ?? 0)) < tolerance, `im ${j}`);
  }
}

describe('fft', () => {
  it('matches the naive DFT on n = 1 … 64', () => {
    for (const n of [1, 2, 4, 8, 32, 64]) {
      const x = signal(n, n);
      const expected = naive(x, -1, (j, k) => (j * k) / n);
      fft(x);
      assertClose(x, expected, 1e-9);
    }
  });

  it('inverts: ifft(fft(x)) is x', () => {
    const x = signal(1024, 3);
    const y = copy(x);
    fft(y);
    ifft(y);
    assertClose(y, x, 1e-12);
  });

  it('refuses a length not a power of two', () => {
    assert.throws(() => {
      fft(signal(12, 0));
    });
  });
});

describe('fft2', () => {
  it('matches the naive 2D DFT on 8 × 8', () => {
    const n = 8;
    const x = signal(n * n, 5);
    const expected = naive(x, -1, (a, b) => {
      const [x0, y0, kx, ky] = [
        a % n,
        Math.floor(a / n),
        b % n,
        Math.floor(b / n),
      ];
      return (kx * x0 + ky * y0) / n;
    });
    fft2(x, n);
    assertClose(x, expected, 1e-9);
  });

  it('inverts: ifft2(fft2(x)) is x on 64 × 64', () => {
    const x = signal(64 * 64, 9);
    const y = copy(x);
    fft2(y, 64);
    ifft2(y, 64);
    assertClose(y, x, 1e-12);
  });
});

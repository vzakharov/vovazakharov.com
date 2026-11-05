// Sanity check: fold in half on the diagonal, fold the top layer's corner
// down, then lift the other half to 60 degrees.
export const steps = [
  { line: { p: [0, 0], q: [1, 1] }, moving: [0.2, 0.8], dir: "valley" },
  { line: { p: [0.5, 0], q: [1, 0.5] }, moving: [0.9, 0.1], select: { at: [0.85, 0.12], top: 1 }, dir: "valley" },
  { line: { p: [0, 0], q: [1, 1] }, moving: [0.6, 0.4], select: { at: [0.6, 0.3], bottom: 1 }, dir: "mountain", angle: 60 },
];

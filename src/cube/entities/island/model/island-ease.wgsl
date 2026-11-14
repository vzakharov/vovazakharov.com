// The smooth steps and joins the island's shape is built from, each the twin
// of the TypeScript of its name in island-height.ts.

fn sq(v: f32) -> f32 {
  return v * v;
}

/// `k`-wide smooth `max(a, 0)`.
fn softPlus(a: f32, k: f32) -> f32 {
  return k * (max(a / k, 0.0) + log(1.0 + exp(-abs(a / k))));
}

fn softMin(a: f32, b: f32, k: f32) -> f32 {
  return a - softPlus(a - b, k);
}

fn softMax(a: f32, b: f32, k: f32) -> f32 {
  return a + softPlus(b - a, k);
}

/// A smooth step from 0 to 1 about `v` = 0, finite however large `v` is.
fn eased(v: f32) -> f32 {
  return 0.5 + 0.5 * tanh(clamp(v, -20.0, 20.0));
}

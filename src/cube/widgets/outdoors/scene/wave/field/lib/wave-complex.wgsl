// Complex arithmetic over a wave field's spectra, a pair of floats each.

fn times(a: vec2f, b: vec2f) -> vec2f {
  return vec2f(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

/// Two real fields' spectra as one complex one: `a + i b`.
fn paired(a: vec2f, b: vec2f) -> vec2f {
  return vec2f(a.x - b.y, a.y + b.x);
}

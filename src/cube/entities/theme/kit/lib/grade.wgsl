// From the lit scene to the pixel: the air between, and what a floor's lens
// does to the frame.

import super::core::{Surf, Lens, mirroring};
import package::cube::shared::shader::hash::{hashOf, unitOf};

/// The colour seen through air of colour `air` that swallows a thing
/// `reach` metres off by about two thirds, and the point's mirror dimmed
/// as its light is.
fn haze(colour: vec3f, s: Surf, air: vec3f, reach: f32) -> vec3f {
  let through = exp(-s.far / reach);
  mirroring.strength *= through;
  return mix(air, colour, through);
}

/// The film's curve: scene light `x`, none of it negative, to the share of
/// white it prints, past 1 for the brightest.
fn filmic(x: vec3f) -> vec3f {
  return (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
}

/// Scene light to display colour: a filmic shoulder, then the display's gamma.
fn tonemap(colour: vec3f) -> vec3f {
  let mapped = filmic(max(colour, vec3f(0.0)));
  return pow(clamp(mapped, vec3f(0.0), vec3f(1.0)), vec3f(1.0 / 2.2));
}

/// The scene as a glass lens takes it: the frame plus `glow` of its bright
/// parts' spread, its red and blue pulled `fringe` of the way apart toward
/// the corners.
fn through(l: Lens, glow: f32, fringe: f32) -> vec3f {
  let off = (l.uv - 0.5) * fringe * dot(l.uv - 0.5, l.uv - 0.5) * 4.0;
  let scene =
    vec3f(sceneAt(l.uv + off).r, sceneAt(l.uv).g, sceneAt(l.uv - off).b);
  return scene + glowAt(l.uv) * glow;
}

/// Film grain in [-1, 1], new 24 times a second.
fn grain(l: Lens) -> f32 {
  let frame = u32(l.time * 24.0);
  let word = hashOf(hashOf(u32(l.pixel.x), u32(l.pixel.y)), frame);
  return unitOf(word) * 2.0 - 1.0;
}

/// 1 in the middle of the screen, falling to `1 - depth` in its corners.
fn vignette(l: Lens, depth: f32) -> f32 {
  return 1.0 - depth * smoothstep(0.25, 0.75, length(l.uv - 0.5));
}

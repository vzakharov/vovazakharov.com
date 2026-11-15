/**
 * The ground's relief below a mesh's cell, as a WGSL function of its
 * arguments alone, drawn by light: it reads the ripples' table, whose waves
 * repeat over `RIPPLE_PERIOD`, as ridges standing still.
 */
export const GROUND_WGSL = `
/**
 * The ground's unit normal at \`place\` — a position modulo \`RIPPLE_PERIOD\`
 * on each axis — over a mesh whose own unit normal is \`normal\`, seen by a
 * pixel \`footprint\` metres wide: ridges of every length from tens of metres
 * to a hand's width, each as steep as the next and \`rough\` in all, a ridge
 * under a few pixels long left out.
 */
fn groundNormal(place: vec3f, normal: vec3f, footprint: f32, rough: f32) -> vec3f {
  var slope = vec3f(0.0);
  for (var i = 0; i < RIPPLE_COUNT; i++) {
    let wave = RIPPLES[i];
    let scale = exp2(f32(i / RIPPLES_PER_BAND)) / RIPPLE_PERIOD;
    let number = 6.283185307 * scale * wave.xyz;
    let flat = number - normal * dot(number, normal);
    let along = length(flat);
    let metres = 6.283185307 / max(along, 1e-6);
    let seen = smoothstep(2.0, 6.0, metres / footprint);
    let phase = 6.283185307 * dot(wave.xyz, fract(place * scale)) + wave.w;
    // A ridge is a sine folded at its crest.
    slope += flat * (seen * sign(sin(phase)) * cos(phase) / max(along, 1e-6));
  }
  // Sixty-four waves of unit slope come to a root mean square of 5.66.
  return normalize(normal - slope * (rough / 5.66));
}
`;

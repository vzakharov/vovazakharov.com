// The swell's train of waves as it meets the island: when crests pass and
// what shape a wave takes, the twins of the closed forms in swell.ts, which
// `swell.test.ts` runs this against.

import super::swell::swellDrift;
import super::swell_numbers::{HOUR_SECONDS, RADIANS_A_TURN, WAVES, PERIOD, BORE_FACE, BORE_FACE_SPAN, BORE_FALL, BORE_MEAN};

/// How many crests have passed a point whose own time is `tau` seconds.
fn turnsAt(tau: f32) -> f32 {
  return WAVES * tau / HOUR_SECONDS + swellDrift(tau);
}

/// The moment, in a point's own time, that crest `n` passes it.
fn crestOf(n: f32) -> f32 {
  var tau = n * PERIOD;
  for (var i = 0; i < 5; i++) {
    tau = (n - swellDrift(tau)) * PERIOD;
  }
  return tau;
}

/// A wave that has felt the bottom, at `phase` turns after its crest: crests
/// sharpened and troughs flattened by `sharp` in [0, 1), the height from crest
/// to trough staying 2 (Abreu et al. 2010, skewed with no asymmetry).
fn peaked(phase: f32, sharp: f32) -> f32 {
  let blunt = sqrt(1.0 - sharp * sharp);
  let swing = cos(RADIANS_A_TURN * phase);
  return blunt * (swing - sharp / (1.0 + blunt)) / (1.0 - sharp * swing);
}

/// A broken wave at `phase` turns after its front passed: highest just behind
/// the front, falling away, then the next front's steep face.
fn bore(phase: f32) -> f32 {
  let face = clamp((phase - BORE_FACE) / BORE_FACE_SPAN, 0.0, 1.0);
  let rise = face * face * (3.0 - 2.0 * face);
  let fall = exp(-BORE_FALL * phase);
  return 2.1 * (fall + (1.0 - fall) * rise - BORE_MEAN);
}

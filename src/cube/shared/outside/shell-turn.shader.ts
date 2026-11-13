// Generated from shell-turn.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '../shader/wgsl';
import { TURN_NUMBERS } from './turn';

export const SHELL_TURN = wgsl(
  'cube/shared/outside/shell-turn',
  /* wgsl */ `
/// A way in the room frame as the shell frame has it.
fn turnedToShell(way: vec3f) -> vec3f {
  let flat = ROOM_TO_SHELL * way.xz;
  return vec3f(flat.x, way.y, flat.y);
}

/// A way in the shell frame as the room frame has it.
fn turnedToRoom(way: vec3f) -> vec3f {
  let flat = SHELL_TO_ROOM * way.xz;
  return vec3f(flat.x, way.y, flat.y);
}

/// A point of the room frame, in metres from the north-west corner of floor
/// 1's room, in the shell frame, from the cube's north-west corner.
fn toShell(p: vec3f) -> vec3f {
  let flat = ROOM_TO_SHELL * (p.xz - TURN_ABOUT) + TURN_ABOUT;
  return vec3f(flat.x, p.y, flat.y);
}

/// A point of the shell frame in the room frame.
fn toRoom(p: vec3f) -> vec3f {
  let flat = SHELL_TO_ROOM * (p.xz - TURN_ABOUT) + TURN_ABOUT;
  return vec3f(flat.x, p.y, flat.y);
}
`,
  TURN_NUMBERS,
);

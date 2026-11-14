// Generated from hallway.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, STUFF } from '../../../kit';
import { HOUSEHOLD } from '../../household';

export const HALLWAY_SHADER = wgsl(
  'cube/entities/theme/dwelling/hallway/config/hallway',
  /* wgsl */ `
/// Metres between one door's middle and the next.
const DOOR_PITCH = 1.25;

/// What comes under door \`slot\` of the wall with word \`wall\`: nothing, a
/// lamp left on, or a television.
fn underDoor(wall: u32, slot: f32, time: f32) -> vec3f {
  let word = hashOf(wall, u32(slot) + 0x9u);
  let roll = unitOf(word);
  if (roll > 0.34) {
    return vec3f(0.0);
  }
  if (roll > 0.1) {
    return vec3f(1.0, 0.56, 0.2);
  }
  let frame = unitOf(hashOf(word, u32(time * 7.0)));
  return vec3f(0.3, 0.5, 1.0) * (0.25 + 0.9 * frame);
}

fn doored(s: Surf) -> Material {
  let along = alongWall(s);
  let slot = floor(along / DOOR_PITCH);
  let x = along - (slot + 0.5) * DOOR_PITCH;
  let y = s.p.y;
  let wall = wallWord(s);
  let word = hashOf(wall, u32(slot));

  let stripe = band(fract(along / 0.09) * 0.09, 0.045, 0.01);
  let ground = plaster(s, vec3f(0.03, 0.085, 0.055));
  let gold = vec3f(0.42, 0.29, 0.09);
  let yellowed =
    1.0 - 0.3 * smoothstep(1.2, ROOM.y, y) * fbm(s.uv * 1.7, s.seed ^ 0x91u, 3);
  let paper = mix(ground, gold, 0.8 * stripe) * yellowed;
  let skirting = within(y - 0.16, 0.004);
  let board = vec3f(0.42, 0.39, 0.31);

  let leaf = boxAway(vec2f(x, y - 0.5), vec2f(0.38, 1.52));
  let casing = boxAway(vec2f(x, y - 0.5), vec2f(0.455, 1.6));
  let onLeaf = within(leaf, 0.003);
  let onCasing = within(casing, 0.003);
  let column = abs(x) - 0.185;
  let panel =
    min(
      boxAway(vec2f(column, y - 1.4), vec2f(0.125, 0.5)),
      boxAway(vec2f(column, y - 0.45), vec2f(0.125, 0.27)),
    );
  let sunk = smoothstep(0.0, 0.018, -panel);
  let side = select(-1.0, 1.0, (word & 1u) == 0u);
  let knob = length(vec2f(x - side * 0.3, y - 1.0));
  let onKnob = within(knob - 0.028, 0.003);
  let rose = within(knob - 0.04, 0.003);
  let keyhole =
    within(boxAway(vec2f(x - side * 0.3, y - 0.9), vec2f(0.004, 0.012)), 0.002);

  let tint = unitOf(mix32(word));
  let cream = mix(vec3f(0.5, 0.46, 0.36), vec3f(0.44, 0.36, 0.22), tint * tint);
  let odd = unitOf(mix32(word ^ 0x33u)) > 0.93;
  let paint = select(cream, vec3f(0.16, 0.02, 0.02), odd);
  let brushed = fbm(vec2f(s.uv.x * 90.0, s.uv.y * 4.0), 0x92u, 2);
  let grime =
    1.0 - 0.35 * within(knob - 0.14, 0.12) * fbm(s.uv * 30.0, word, 2);
  let door = paint * (0.9 + 0.12 * brushed) * (1.0 - 0.18 * sunk) * grime;
  let brass = vec3f(0.5, 0.33, 0.08);

  let gap = onLeaf * within(y - 0.014, 0.003);
  let under = underDoor(wall, slot, s.time);
  var albedo = mix(paper, board, skirting);
  albedo = mix(albedo, cream * 0.92, onCasing);
  albedo = mix(albedo, door, onLeaf);
  albedo = mix(albedo, brass * 0.8, rose * onLeaf);
  albedo = mix(albedo, brass, onKnob);
  albedo = mix(albedo, vec3f(0.004), max(keyhole, gap));
  let emission = under * (2.2 * gap + 0.9 * keyhole);
  let gloss = mix(mix(0.06, 0.45, max(onCasing, skirting)), 0.8, onKnob);
  let height =
    0.6 * onCasing
      + 0.3 * skirting
      - 0.5 * onLeaf * (1.0 + sunk)
      + 2.0 * onKnob
      + 0.02 * brushed * onCasing
      + 0.03 * stripe;
  return
    embossed(s, Material(albedo, emission, gloss, vec3f(0.0)), height, 0.02);
}

/// Light from under the doors of the room's closed sides, as the floor takes it.
fn spilled(s: Surf) -> vec3f {
  let toSide = toSides(s);
  var sum = vec3f(0.0);
  for (var side = 0u; side < 4u; side++) {
    if (!closedAt(s, side) || toSide[side] > 1.2) {
      continue;
    }
    let along = select(s.p.x, s.p.z, (side & 1u) == 0u);
    let slot = floor(along / DOOR_PITCH);
    let x = abs(along - (slot + 0.5) * DOOR_PITCH);
    let away = toSide[side];
    let fan = within(x - 0.34 - 0.25 * away, 0.08 + 0.3 * away);
    sum += underDoor(sideWord(s, side), slot, s.time) * fan * exp(-away * 5.0);
  }
  return sum;
}

fn parquet(s: Surf) -> Material {
  let block = herringbone(s.uv, 0.09, 5, 0x93u);
  let grain = figure(block.at, 0x94u);
  let oak =
    mix(
      vec3f(0.1, 0.045, 0.018),
      vec3f(0.2, 0.1, 0.04),
      block.word,
    ) * (0.6 + 0.6 * grain);
  let joint = smoothstep(0.0, 0.003, block.edge);
  let worn = fbm(s.uv * 0.6, 0x95u, 3);
  let floor =
    Material(
      oak * mix(0.35, 1.0, joint),
      oak * spilled(s) * 1.6,
      (0.3 + 0.4 * worn) * joint,
      vec3f(0.0),
    );
  return
    embossed(
      s,
      floor,
      joint + 0.15 * grain + 2.0 * fbm(s.uv * 1.2, 0x96u, 2),
      0.0008,
    );
}

fn rosed(s: Surf) -> Material {
  let off = fromLamp(s, 1);
  let r = length(off);
  let turn = atan2(off.y, off.x);
  let petals = 0.5 + 0.5 * cos(turn * 12.0);
  let rose = within(r - 0.42 - 0.04 * petals, 0.01);
  let rings =
    rose * (0.5 + 0.5 * cos(r * 75.0)) + rose
      * 0.6
      * petals
      * smoothstep(0.2, 0.4, r);
  let coving = within(toNearestSide(s) - 0.1, 0.08);
  let white = plaster(s, vec3f(0.5, 0.47, 0.4)) * (1.0 - 0.45 * damp(s));
  let dome = within(r - 0.17, 0.006);
  let frosted = 0.75 + 0.25 * sqrt(max(1.0 - r * r / 0.03, 0.0));
  let glow = lamps().colour * (3.2 * dome * frosted * burning(s, lamps()));
  let albedo = mix(white, vec3f(0.55, 0.5, 0.4), dome);
  let lip = band(r, 0.18, 0.012);
  let ceiling =
    Material(
      mix(albedo, vec3f(0.4, 0.27, 0.08), lip),
      glow,
      0.6 * lip,
      vec3f(0.0),
    );
  return embossed(s, ceiling, rings + 1.5 * coving - 2.0 * dome, 0.012);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return doored(s);
    }
    case FLOOR, OWNED: {
      return parquet(s);
    }
    case CEILING: {
      return rosed(s);
    }
    case TRIM: {
      return polished(plaster(s, vec3f(0.46, 0.42, 0.33)), 0.4);
    }
    default: {
      return stuff(s);
    }
  }
}
`,
  CORE,
  HASH,
  FINISH,
  STUFF,
  HOUSEHOLD,
);

// The carpets the home hangs on its walls: knots in the dyes a roll picks,
// woven the same in all four quarters.

const NIGHT = vec3f(0.008, 0.01, 0.03);
const WOOL = vec3f(0.6, 0.48, 0.3);

// What a carpet's field is dyed: madder twice, since most were red.
const GROUNDS =
  array<vec3f, 6>(
    vec3f(0.3, 0.012, 0.01),
    vec3f(0.3, 0.012, 0.01),
    vec3f(0.13, 0.006, 0.014),
    vec3f(0.1, 0.03, 0.012),
    vec3f(0.008, 0.012, 0.06),
    vec3f(0.012, 0.06, 0.03),
  );

const DYES =
  array<vec3f, 5>(
    vec3f(0.5, 0.27, 0.03),
    vec3f(0.6, 0.15, 0.02),
    vec3f(0.008, 0.01, 0.03),
    vec3f(0.03, 0.13, 0.04),
    vec3f(0.1, 0.24, 0.38),
  );

/// One of the dyes carpet `roll` was woven with: neighbouring numbers are
/// always different dyes.
fn dye(i: u32, roll: u32) -> vec3f {
  return DYES[(i + (roll >> 12u)) % 5u];
}

/// The colour at knot `knot` of a carpet `size` knots, woven the same in
/// all four quarters as the factories wove them: a narrow border, a wide
/// one, a field, a medallion or three in the middle, sometimes a quarter of
/// one in each corner. Which of each, and in what dyes, is `roll`'s to say,
/// so no two carpets in the building are the same.
fn woven(knot: vec2i, size: vec2i, roll: u32) -> vec3f {
  let half = size / 2;
  let a = abs(knot - half);
  let gap = half - a;
  let inward = min(gap.x, gap.y);
  let run = select(a.x, a.y, gap.x < gap.y);
  let ground = GROUNDS[roll % 6u];
  let other = GROUNDS[(roll + 3u) % 6u];
  let slant = (a.x + a.y) % 12;
  let counter = ((a.x - a.y) % 12 + 12) % 12;

  if (inward < 2) {
    return NIGHT;
  }
  if (inward < 7) {
    let deep = inward - 2;
    switch (roll >> 3u) % 3u {
      case 0u: {
        return select(WOOL, ground, (slant % 6) < 3);
      }
      case 1u: {
        return select(dye(0u, roll), ground, abs(run % 10 - 5) > deep);
      }
      default: {
        return select(WOOL, dye(1u, roll), (run / 3 + deep / 3) % 2 == 0);
      }
    }
  }
  if (inward < 9) {
    return NIGHT;
  }
  if (inward < 21) {
    let deep = inward - 9;
    switch (roll >> 5u) % 3u {
      case 0u: {
        let hook = (min(slant, 11 - slant) + min(counter, 11 - counter)) % 5;
        return select(select(dye(0u, roll), WOOL, hook == 2), other, hook < 2);
      }
      case 1u: {
        let petal = abs(run % 12 - 6) + abs(deep - 6);
        if (petal < 2) {
          return WOOL;
        }
        if (petal < 4) {
          return dye(0u, roll);
        }
        return select(other, dye(1u, roll), petal == 5);
      }
      default: {
        let band = (deep + abs(run % 12 - 6)) % 6;
        return select(select(WOOL, dye(1u, roll), band < 4), other, band < 2);
      }
    }
  }
  if (inward < 23) {
    return WOOL;
  }

  let inner = half - 23;
  let kind = (roll >> 7u) % 4u;
  var q = vec2i(a.x / 2, a.y);
  if (kind == 2u) {
    q = vec2i(min(a.x, abs(a.x - inner.x * 3 / 5)), a.y);
  }
  let square = max(q.x, q.y);
  let diamond = q.x + q.y;
  var out = diamond;
  var reach = inner.y - 9;
  switch kind {
    case 0u: {
      reach = inner.y - 7;
    }
    case 1u: {
      out = max(square, diamond * 7 / 10);
    }
    case 3u: {
      out = min(square, diamond * 7 / 10);
    }
    default: {}
  }
  if (out < 3) {
    return WOOL;
  }
  if (out < reach) {
    switch (out / 3) % 4 {
      case 0: {
        return other;
      }
      case 1: {
        return WOOL;
      }
      case 2: {
        return dye(0u, roll);
      }
      default: {
        return dye(1u, roll);
      }
    }
  }
  if (out < reach + 3) {
    return WOOL;
  }

  if (((roll >> 9u) & 1u) == 1u) {
    let corner = (inner.x - a.x) / 2 + inner.y - a.y;
    if (corner < 12) {
      return select(other, dye(0u, roll), (corner / 3) % 2 == 0);
    }
    if (corner < 14) {
      return WOOL;
    }
  }

  switch (roll >> 10u) % 3u {
    case 0u: {
      // Small flowers, a lattice of them, each a cross of five knots.
      let flower = abs(a.x % 10 - 5) + abs(a.y % 10 - 5);
      if (flower < 2) {
        return select(dye(0u, roll), WOOL, flower == 0);
      }
      return select(ground, NIGHT, (a.x & a.y & 7) == 7);
    }
    case 1u: {
      // A trellis, a knot of wool where its lines cross.
      if (slant == 0 && counter == 0) {
        return WOOL;
      }
      return select(ground, dye(0u, roll), slant == 0 || counter == 0);
    }
    default: {
      // Roses in staggered rows, two leaves to each.
      let row = a.y / 12;
      let c = vec2i((a.x + 8 * (row % 2)) % 16 - 8, a.y % 12 - 6);
      let rose = abs(c.x) + abs(c.y);
      if (rose < 1) {
        return WOOL;
      }
      if (rose < 3) {
        return dye(1u, roll);
      }
      return select(ground, DYES[3], rose == 4 && c.x * c.y > 0);
    }
  }
}

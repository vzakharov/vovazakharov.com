import { GRADE, LIGHT, type Wgsl, wgsl } from '../../../kit';

/**
 * The light of a floor that keeps its lamps and its air but looks through a
 * lens of its own: `lamps()`, which is the WGSL `Lamps(...)` given, and a
 * `themeLight` of the rooms' lamps through air that swallows a thing
 * `visibility` metres off. Its theme writes `themeLens`.
 */
export const lit = (id: string, lamps: string, visibility: number): Wgsl =>
  wgsl(
    `${id}/lit`,
    /* wgsl */ `
fn lamps() -> Lamps {
  return ${lamps};
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  return haze(roomLight(s, m, lamps()), s, AIR, ${visibility.toFixed(1)});
}
`,
    LIGHT,
    GRADE,
  );

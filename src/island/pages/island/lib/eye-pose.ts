import { unitToLatLon } from '@/island/shared/globe';
import {
  type Eye,
  eyeAt,
  type GroundAt,
  headingOf,
  heightOverGround,
  seaHeightOf,
} from '@/island/features/eye';

import type { Pose } from './place-hash';
import type { Placed } from './where-line';

const DEGREE = Math.PI / 180;

/**
 * Where `eye` stands as a hash spells it, at the clock's `hours`, its height
 * over the ground `groundAt` draws rather than over the eye's lagging floor.
 */
export function poseOfEye(eye: Eye, hours: number, groundAt: GroundAt): Pose {
  const { lat, lon } = unitToLatLon(eye.at);
  const heading = headingOf(eye) / DEGREE;
  const { look } = eye;
  return {
    lat: lat / DEGREE,
    lon: lon / DEGREE,
    height: heightOverGround(eye, groundAt),
    heading: ((heading % 360) + 360) % 360,
    pitch: look / DEGREE,
    hours,
  };
}

/** Where `eye` stands in `world` as a `Where` spells it: its place, and its height over the sea. */
export const placeOfEye = (
  world: string,
  eye: Eye,
  hours: number,
  groundAt: GroundAt,
): Placed => ({
  place: { world, pose: poseOfEye(eye, hours, groundAt) },
  seaHeight: seaHeightOf(eye),
});

/**
 * An eye at rest in `pose`, its floor on the ground, so it stands as high over
 * the ground as `poseOfEye` measured; its look raised by the pose's pitch.
 */
export function eyeOfPose(pose: Pose, groundAt: GroundAt): Eye {
  const { lat, lon, height, heading, pitch } = pose;
  const eye = eyeAt(
    { lat: lat * DEGREE, lon: lon * DEGREE, height, heading: heading * DEGREE },
    groundAt,
  );
  const look = pitch * DEGREE;
  return { ...eye, look, aim: { ...eye.aim, look } };
}

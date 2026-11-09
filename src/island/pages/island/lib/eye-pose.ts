import { unitToLatLon } from '@/island/shared/globe';
import {
  type GlobeEye as Eye,
  globeEyeAt as eyeAt,
  type GlobeGroundAt as GroundAt,
  headingOf,
} from '@/island/features/eye';

import type { Pose } from './place-hash';

const DEGREE = Math.PI / 180;

/** Where `eye` stands as a hash spells it, at the clock's `hours`. */
export function poseOfEye(eye: Eye, hours: number): Pose {
  const { lat, lon } = unitToLatLon(eye.at);
  const heading = headingOf(eye) / DEGREE;
  return {
    lat: lat / DEGREE,
    lon: lon / DEGREE,
    height: eye.height,
    heading: ((heading % 360) + 360) % 360,
    pitch: eye.look / DEGREE,
    hours,
  };
}

/** An eye at rest in `pose`, its look raised by the pose's pitch. */
export function eyeOfPose(pose: Pose, groundAt: GroundAt): Eye {
  const eye = eyeAt(
    {
      lat: pose.lat * DEGREE,
      lon: pose.lon * DEGREE,
      height: pose.height,
      heading: pose.heading * DEGREE,
    },
    groundAt,
  );
  const look = pose.pitch * DEGREE;
  return { ...eye, look, aim: { ...eye.aim, look } };
}

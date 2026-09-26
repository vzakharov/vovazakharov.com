/** A position, in whatever unit the module holding it works in. */
export type Point = { x: number; y: number };
export type Circle = Point & { r: number };

/**
 * A stem that rises upright and bends over: how far its top stands sideways
 * from above its foot, as a fraction of its height.
 */
export type Bent = { stemBend: number };

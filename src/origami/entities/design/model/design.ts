import type { StepSpec, Vec3 } from '@/origami/shared/fold';

/** How the renderer shows a model. */
export type Shown = {
  /** Front and back of the sheet, as 0xRRGGBB. */
  readonly colors: { readonly front: number; readonly back: number };
  /** Engine coordinates → the renderer's, so the model stands the way it is
   * meant to be looked at. */
  readonly display: (point: Vec3) => Vec3;
};

/** A model: the steps that fold it and how the renderer shows it. */
export type Design = Shown & { readonly steps: readonly StepSpec[] };

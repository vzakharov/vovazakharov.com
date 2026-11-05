import type { StepSpec, Vec3 } from '@/origami/shared/fold';

/** A model: the steps that fold it and how the renderer shows it. */
export type Design = {
  readonly steps: readonly StepSpec[];
  /** Front and back of the sheet, as 0xRRGGBB. */
  readonly colors: { readonly front: number; readonly back: number };
  /** Engine coordinates → the renderer's, so the model stands the way it is
   * meant to be looked at. */
  readonly display: (point: Vec3) => Vec3;
};

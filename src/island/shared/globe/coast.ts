/**
 * The island's outline on the plane. Every ring is a closed outer boundary in
 * kilometres, `[east, north]` from the centre, counter-clockwise, the first
 * the main body; `kmPerPixel` is the scale of the drawing it was traced from.
 * Declared here rather than by the slice that traces it, because the slices
 * reading it may not import one another.
 */
export type Coast = {
  kmPerPixel: number;
  rings: Array<Array<[number, number]>>;
};

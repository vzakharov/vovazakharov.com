/**
 * Places on world #1 the play scripts visit, in degrees as the play hook's
 * `moveTo` takes them. Each was named on the trace's plane; `places.test`
 * holds them to `azimuthal.ts`'s mapping of that point.
 */

/** The inlet between Блаблания and Фейсис, the trace's narrowest; plane (515 km, 1 750 km). */
export const INLET = { lat: 25.683_935, lon: 5.075_975 } as const;

/** The strait and the pool at the inlet's head; plane (510 km, 1 250 km). */
export const INLET_HEAD = { lat: 21.194_931, lon: 4.888_499 } as const;

/** The beach at the inlet's head, looking north along the water; plane (499 km, 1 113.2 km). */
export const INLET_BEACH = { lat: 19.968_265, lon: 4.750_977 } as const;

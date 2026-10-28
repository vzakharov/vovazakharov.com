/** A cap's two seats underneath, left and right of its stem. */
export const SHELTER_SEATS = [0, 1] as const;

/** Which of a cap's seats underneath: left of its stem or right. */
export type ShelterSide = (typeof SHELTER_SEATS)[number];

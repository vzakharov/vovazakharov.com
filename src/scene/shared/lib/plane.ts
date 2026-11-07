/** Where a thing stands across, in its module's units. */
export type Abscissa = { x: number };

/** Where a thing stands down or up, in its module's units. */
export type Ordinate = { y: number };

export type Point = Abscissa & Ordinate;

/** How many times its laid-out size a thing is drawn. */
export type Zooming = { zoom: number };

/** A point on the screen, and how many times its laid-out size a thing there is drawn. */
export type Zoomed = Point & Zooming;

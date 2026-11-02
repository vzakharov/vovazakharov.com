import {
  DICE_FACE,
  DICE_FACES,
  DICE_VIEW_BOX,
  type DiceSide,
} from './dice-shape';
import classes from './unsquatted-home.module.scss';

const FACE_CLASS = {
  back: classes['diceBack'],
  front: classes['diceFront'],
} satisfies Record<DiceSide, string | undefined>;

const PIPS_CLASS = {
  back: classes['dicePipsBack'],
  front: classes['dicePipsFront'],
} satisfies Record<DiceSide, string | undefined>;

/** A pair of dice thrown askew, the front one's pips in the accent. */
export function DiceIcon() {
  return (
    <svg
      className={classes['dice']}
      viewBox={DICE_VIEW_BOX}
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden
    >
      {DICE_FACES.map(({ side, rotate, at: [x, y], pips }) => (
        <g key={side} transform={rotate}>
          <rect
            className={FACE_CLASS[side]}
            {...{ x, y }}
            width={DICE_FACE.size}
            height={DICE_FACE.size}
            rx={DICE_FACE.radius}
          />
          <g className={PIPS_CLASS[side]}>
            {pips.map(([cx, cy]) => (
              <circle
                key={`${cx},${cy}`}
                {...{ cx, cy }}
                r={DICE_FACE.pipRadius}
              />
            ))}
          </g>
        </g>
      ))}
    </svg>
  );
}

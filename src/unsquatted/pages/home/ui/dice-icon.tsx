import classes from './unsquatted-home.module.scss';

/** A pair of dice thrown askew, the front one's pips in the accent. */
export function DiceIcon() {
  return (
    <svg
      className={classes['dice']}
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden
    >
      <g transform="rotate(-14 8 13)">
        <rect
          className={classes['diceBack']}
          x={2.5}
          y={7.5}
          width={11}
          height={11}
          rx={3}
        />
        <g className={classes['dicePipsBack']}>
          <circle cx={5.7} cy={10.7} r={1} />
          <circle cx={8} cy={13} r={1} />
          <circle cx={10.3} cy={15.3} r={1} />
        </g>
      </g>
      <g transform="rotate(12 16 10)">
        <rect
          className={classes['diceFront']}
          x={10.5}
          y={4.5}
          width={11}
          height={11}
          rx={3}
        />
        <g className={classes['dicePipsFront']}>
          <circle cx={13.6} cy={7.6} r={1} />
          <circle cx={18.4} cy={7.6} r={1} />
          <circle cx={13.6} cy={12.4} r={1} />
          <circle cx={18.4} cy={12.4} r={1} />
        </g>
      </g>
    </svg>
  );
}

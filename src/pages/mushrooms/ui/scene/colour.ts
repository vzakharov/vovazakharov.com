import * as Phaser from 'phaser';

/** `from` blended toward `to` by `t`, channel by channel. */
export function mix(from: number, to: number, t: number): number {
  const a = Phaser.Display.Color.IntegerToColor(from);
  const b = Phaser.Display.Color.IntegerToColor(to);
  return Phaser.Display.Color.GetColor(
    a.red + (b.red - a.red) * t,
    a.green + (b.green - a.green) * t,
    a.blue + (b.blue - a.blue) * t,
  );
}

/** `colour` turned round the colour wheel by `nudge`, a fraction of a turn. */
export function nudgeHue(colour: number, nudge: number): number {
  const { h, s, v } = Phaser.Display.Color.IntegerToColor(colour);
  return Phaser.Display.Color.HSVToRGB((h + nudge + 1) % 1, s, v).color;
}

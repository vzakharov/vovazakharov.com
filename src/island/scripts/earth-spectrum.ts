/**
 * Measures Earth's amplitude per degree and fits it a knee-and-slope envelope
 * (call 4): `A(l)` of #0's series, fitted `(knee² + l²)^(−slope/2)` in `ln A`
 * twice — bins equal in `log l`, and every degree equal (call 7) — and printed
 * beside the probe's envelope, its amplitude alone fitted. The two sources agree to
 * the printed digits.
 *
 * Usage: pnpm spectrum:island [--source row|target]
 *   row     the committed row #0, decoded (default; offline)
 *   target  the unquantized fit target, from Natural Earth (cached in tmp/)
 */
import { parseArgs } from 'node:util';
import { z } from 'zod';

import {
  LAND_DEGREE,
  pinnedSeries,
  sphereTransform,
} from '@/island/entities/terrain';

import {
  degreeAmplitudes,
  type EnvelopeFit,
  equalWeights,
  fitEnvelope,
  holdEnvelope,
  logWeights,
} from './lib/envelope-fit';
import { EARTH_CLIP_METRES, earthFit } from './lib/fit-earth';

const { values } = parseArgs({
  options: { source: { type: 'string', default: 'row' } },
});
const { source } = z
  .object({ source: z.enum(['row', 'target']) })
  .parse(values);

const say = (line: string) => process.stdout.write(`${line}\n`);

async function earthSeries(): Promise<Float64Array> {
  if (source === 'target') {
    const target = await earthFit(sphereTransform(2 * LAND_DEGREE + 1));
    return target.series(sphereTransform(LAND_DEGREE), EARTH_CLIP_METRES);
  }
  const row = await pinnedSeries('0');
  if (!row) throw new Error('row #0 is not pinned');
  return row;
}

const amplitudes = degreeAmplitudes(await earthSeries(), LAND_DEGREE);
const fits: Array<[string, EnvelopeFit]> = [
  ['bins equal in log l', fitEnvelope(amplitudes, logWeights(LAND_DEGREE))],
  ['every degree equal', fitEnvelope(amplitudes, equalWeights(LAND_DEGREE))],
];

say(`#0 from the ${source}, degree ${String(LAND_DEGREE)}`);
say('\n| Weighting | Knee | Slope | Residual (ln A) |');
say('| --------- | ---: | ----: | --------------: |');
for (const [name, fit] of fits) {
  say(
    `| ${name} | ${fit.knee.toFixed(2)} | ${fit.slope.toFixed(3)} | ${fit.residual.toFixed(3)} |`,
  );
}

const probe = holdEnvelope(amplitudes, logWeights(LAND_DEGREE), 6, 2);
const model = ({ knee, slope, amplitude }: EnvelopeFit, l: number) =>
  amplitude * (knee * knee + l * l) ** (-slope / 2);
const ratio = (fit: EnvelopeFit, l: number, a: number) =>
  (model(fit, l) / a).toFixed(2);
say(
  `\nA(l) in metres; each envelope's A over the measured, the probe's ` +
    `(knee 6, slope 2) scaled in log bins, residual ${probe.residual.toFixed(3)}`,
);
say('|   l |   A(l) | Log bins | Every degree | Probe knee 6 |');
say('| --: | -----: | -------: | -----------: | -----------: |');
const [logFit, equalFit] = fits.map(([, fit]) => fit);
if (!logFit || !equalFit) throw new Error('both fits are made above');
for (const l of [1, 2, 3, 4, 6, 8, 10, 15, 20, 30, 50, 100, 200, 300, 511]) {
  const a = amplitudes[l] ?? 0;
  say(
    `| ${String(l)} | ${a.toPrecision(3)} | ${ratio(logFit, l, a)} | ` +
      `${ratio(equalFit, l, a)} | ${ratio(probe, l, a)} |`,
  );
}

import { z } from 'zod';

import type { View } from './render-page.ts';

export const DEFAULT_VIEWS =
  'three-quarter=-35,30;side=0,8;head-on=90,12;top=0,90';
const DEFAULT_ZOOM = 1.05;

const ViewSpec = z
  .tuple([
    z.string().min(1),
    z.tuple([z.number(), z.number()]).rest(z.number()),
  ])
  .transform(
    ([name, [az, el, zoom]]): View => ({
      name,
      az,
      el,
      zoom: zoom ?? DEFAULT_ZOOM,
    }),
  );

/** `"name=az,el[,zoom];…"`, as `--views` takes it. */
export function parseViews(spec: string): View[] {
  return spec.split(';').map((one) => {
    const [name = '', angles = ''] = one.split('=');
    return ViewSpec.parse([name, angles.split(',').map(Number)]);
  });
}

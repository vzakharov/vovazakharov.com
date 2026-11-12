/// <reference types="@webgpu/types" />

import { OUTDOOR_SHADERS } from '../lib/outdoor-shaders';
import { SCENE_FORMAT } from './bloom';
import { drawing, type LayerMaker } from './outdoor-layer';

/**
 * The sky: the backdrop every other layer is drawn over, and the painter of
 * the sky map. The stand-in's sky never changes, so its map is painted once.
 */
export const skyLayer: LayerMaker = async ({
  device,
  skyMap,
  mips,
  shader,
  pipeline,
}) => {
  const sky = await shader('sky', OUTDOOR_SHADERS.sky);
  const backdrop = await pipeline({
    label: 'sky',
    module: sky,
    depth: 'backdrop',
    vertex: 'backdropVertex',
  });
  const painter = await device.createRenderPipelineAsync({
    label: 'sky map',
    layout: 'auto',
    vertex: { module: sky, entryPoint: 'backdropVertex' },
    fragment: {
      module: sky,
      entryPoint: 'mapFragment',
      targets: [{ format: SCENE_FORMAT }],
    },
  });
  const chain = mips(skyMap);
  const [top] = chain.levels;
  if (top === undefined) throw new Error('The sky map has no levels');
  let painted = false;
  return {
    ...drawing(backdrop, 3),
    prepare: (encoder) => {
      if (painted) return;
      painted = true;
      const pass = encoder.beginRenderPass({
        colorAttachments: [{ view: top, loadOp: 'clear', storeOp: 'store' }],
      });
      pass.setPipeline(painter);
      pass.draw(3);
      pass.end();
      chain.fill(encoder);
    },
  };
};

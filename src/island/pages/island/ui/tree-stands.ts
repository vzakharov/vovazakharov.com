import {
  AddEquation,
  Color,
  CustomBlending,
  DoubleSide,
  FrontSide,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshBasicNodeMaterial,
  MeshLambertNodeMaterial,
  OneMinusSrcColorFactor,
  ZeroFactor,
} from 'three/webgpu';

import { TREE_KINDS, type TreeKind } from '../model/tree-placing';
import { TREE_DETAILS, type TreeDetail } from './tree-mesh-parts';
import { treeGeometry } from './tree-meshes';
import { FOOT_ATTRIBUTE, treeNodes } from './tree-nodes';

/**
 * Trees a mesh of each detail holds at most, per kind: closed canopy asks some
 * 10,000 far broadleaves of the fine look and as many `least` ones of the
 * swift.
 */
const CAPACITY: Readonly<Record<TreeDetail, number>> = {
  near: 600,
  mid: 4400,
  far: 12_000,
  least: 12_000,
};

/** What a mesh of any detail holds at most of a kind that is no tree: none is drawn past the nearest tier's reach. */
const SMALL_CAPACITY = 4400;

/** The kinds that are no trees: the low growth among them, and what lies on the floor under them. */
export const SMALL: Readonly<Partial<Record<TreeKind, 'low' | 'floor'>>> = {
  bush: 'low',
  tuft: 'low',
  log: 'floor',
  shade: 'floor',
};

/** One kind's plants at one detail, as instances. */
type Stand = {
  readonly mesh: InstancedMesh;
  readonly foot: InstancedBufferAttribute;
  readonly capacity: number;
};

/**
 * A shade's material: it draws nothing of its own and takes from the ground
 * behind it the share of light its colour says, so the ground keeps its own
 * colours under it.
 */
function shadeMaterial() {
  const material = new MeshBasicNodeMaterial({
    vertexColors: true,
    side: DoubleSide,
    transparent: true,
    depthWrite: false,
    fog: false,
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: ZeroFactor,
    blendDst: OneMinusSrcColorFactor,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  return material;
}

/**
 * The instanced meshes the plants draw as, one per kind and detail under one
 * group, every one placed by `treeNodes`. `dress` lights a material as the
 * land is lit.
 */
export function treeStands(dress: (material: MeshLambertNodeMaterial) => void) {
  const group = new Group();
  group.visible = false;
  const { drawnAt, centre, seconds } = treeNodes();
  const materials = TREE_KINDS.map((kind) => {
    if (kind === 'shade') {
      const material = shadeMaterial();
      material.positionNode = drawnAt;
      return material;
    }
    const material = new MeshLambertNodeMaterial({
      vertexColors: true,
      side: kind === 'conifer' ? DoubleSide : FrontSide,
    });
    material.positionNode = drawnAt;
    dress(material);
    return material;
  });
  const stands = TREE_KINDS.map((kind, k) =>
    TREE_DETAILS.map((detail): Stand => {
      const capacity =
        SMALL[kind] === undefined
          ? CAPACITY[detail]
          : Math.min(CAPACITY[detail], SMALL_CAPACITY);
      const geometry = treeGeometry(kind, detail);
      const foot = new InstancedBufferAttribute(
        new Float32Array(capacity * 4),
        4,
      );
      geometry.setAttribute(FOOT_ATTRIBUTE, foot);
      const mesh = new InstancedMesh(geometry, materials[k], capacity);
      mesh.setColorAt(0, new Color(1, 1, 1));
      mesh.frustumCulled = false;
      mesh.count = 0;
      group.add(mesh);
      return { mesh, foot, capacity };
    }),
  );
  return {
    group,
    stands,
    centre,
    seconds,
    dispose: () => {
      for (const { mesh } of stands.flat()) mesh.geometry.dispose();
      for (const material of materials) material.dispose();
    },
  };
}

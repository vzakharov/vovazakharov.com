/**
 * The page `render.ts` drives: a three.js scene that draws a folded model as
 * lit paper — two-sided colour, a fibre texture, soft shadows and an edge on
 * every piece, so stacked layers read as layers. Bundled by esbuild into one
 * inline script; runs in the browser only.
 *
 * It sets `show(input)` on the global, which draws one model from one view
 * synchronously, and `ready` once that exists.
 */
import {
  ACESFilmicToneMapping,
  BackSide,
  Box3,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  FrontSide,
  Group,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import type { Design } from '@/origami/shared/designs';
import type { Snapshot, Vec3 } from '@/origami/shared/fold';

/** Where the camera stands: azimuth and elevation in degrees, and a distance
 * as a multiple of what just fits the model. */
export type View = {
  readonly az: number;
  readonly el: number;
  readonly zoom: number;
};

/** A model and where it is looked at from. */
export type Framing = { readonly model: Snapshot; readonly view: View };

/** What `show` draws: the model in the renderer's coordinates, the design's
 * `display` already applied. */
export type RenderInput = Framing & { readonly colors: Design['colors'] };

const BACKDROP = 0xe9_e4_da;
const KEY_OFFSET = new Vector3(-1.2, 2.2, 1.6);
/** Above this elevation the camera looks straight down, and "up" would be
 * parallel to the view. */
const TOP_DOWN_DEGREES = 89;

const renderer = new WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.toneMapping = ACESFilmicToneMapping;
document.body.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(BACKDROP);
scene.environment = new PMREMGenerator(renderer).fromScene(
  new RoomEnvironment(),
  0.04,
).texture;
scene.environmentIntensity = 0.35;

const key = new DirectionalLight(0xff_f4_e6, 2.4);
key.castShadow = true;
key.shadow.mapSize.set(4096, 4096);
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.002;
key.shadow.radius = 3;
Object.assign(key.shadow.camera, {
  left: -1.5,
  bottom: -1.5,
  right: 1.5,
  top: 1.5,
  near: 0.1,
  far: 8,
});
scene.add(key, key.target);
const fill = new DirectionalLight(0xdf_e8_ff, 0.6);
fill.position.set(1.5, 0.8, -1);
scene.add(fill, new HemisphereLight(0xff_ff_ff, 0xb8_ad_9a, 0.5));

const model = new Group();
scene.add(model);
const ground = new Mesh(
  new PlaneGeometry(20, 20),
  new ShadowMaterial({ opacity: 0.28 }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const camera = new PerspectiveCamera(30, innerWidth / innerHeight, 0.01, 50);

/** A seeded noise of fibres, so every render of a model looks the same. */
function fibre(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('render-page: no 2d context');
  let seed = 7;
  const random = () => {
    seed = (seed * 16_807) % 2_147_483_647;
    return seed / 2_147_483_647;
  };
  const image = context.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const grey = 235 + random() * 20;
    image.data.set([grey, grey, grey, 255], i * 4);
  }
  context.putImageData(image, 0, 0);
  context.globalAlpha = 0.05;
  for (let i = 0; i < 1500; i++) {
    context.strokeStyle = random() > 0.5 ? '#fff' : '#999';
    const x = random() * size;
    const y = random() * size;
    const angle = random() * 2 * Math.PI;
    const reach = 4 + random() * 14;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(angle) * reach, y + Math.sin(angle) * reach);
    context.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

const texture = fibre();
/** Fibres per sheet width. */
const TEXTURE_REPEAT = 3;

/** The model's z is up; three's y is. A proper rotation, so a piece's
 * winding — and with it which side is the paper's front — carries over. */
const toThree = ([x, y, z]: Vec3) => new Vector3(x, z, -y);

function paperMesh(
  piece: Snapshot['pieces'][number],
  front: MeshStandardMaterial,
  back: MeshStandardMaterial,
  edge: LineBasicMaterial,
): Group {
  const corners = piece.world.map((point) => toThree(point));
  const positions: number[] = [];
  const uvs: number[] = [];
  // A fan: every piece is convex, and its paper polygon runs counter-clockwise.
  for (let i = 1; i < corners.length - 1; i++) {
    for (const k of [0, i, i + 1]) {
      const corner = corners.at(k);
      const [u, v] = piece.paper.at(k) ?? [0, 0];
      if (!corner) throw new Error(`render-page: piece ${piece.id} has a gap`);
      positions.push(corner.x, corner.y, corner.z);
      uvs.push(u * TEXTURE_REPEAT, v * TEXTURE_REPEAT);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  const group = new Group();
  for (const material of [front, back]) {
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  const outline = [...corners, ...corners.slice(0, 1)];
  group.add(new Line(new BufferGeometry().setFromPoints(outline), edge));
  return group;
}

function place(view: View): void {
  const box = new Box3().setFromObject(model);
  const center = box.getCenter(new Vector3());
  const radius = box.getSize(new Vector3()).length() / 2;
  const az = (view.az * Math.PI) / 180;
  const el = (view.el * Math.PI) / 180;
  const distance =
    (radius / Math.tan((camera.fov * Math.PI) / 360)) * view.zoom;
  camera.position.set(
    center.x + distance * Math.cos(el) * Math.sin(az),
    center.y + distance * Math.sin(el),
    center.z + distance * Math.cos(el) * Math.cos(az),
  );
  // Looking straight down, the model's +y (three's −z) is up on screen.
  if (view.el > TOP_DOWN_DEGREES) camera.up.set(0, 0, -1);
  else camera.up.set(0, 1, 0);
  camera.lookAt(center);
  key.target.position.copy(center);
  key.position.copy(center).add(KEY_OFFSET);
  ground.position.y = box.min.y - 0.0015;
}

function show({ model: snapshot, view, colors }: RenderInput): true {
  model.clear();
  const front = new MeshStandardMaterial({
    color: colors.front,
    roughness: 0.82,
    map: texture,
    side: FrontSide,
  });
  const back = new MeshStandardMaterial({
    color: colors.back,
    roughness: 0.88,
    map: texture,
    side: BackSide,
  });
  const edge = new LineBasicMaterial({
    color: 0x00_00_00,
    transparent: true,
    opacity: 0.18,
  });
  for (const piece of snapshot.pieces) {
    model.add(paperMesh(piece, front, back, edge));
  }
  place(view);
  renderer.render(scene, camera);
  return true;
}

Object.assign(globalThis, { show, ready: true });

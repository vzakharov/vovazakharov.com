import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  type Ears,
  OPEN_AIR,
  outsideMix,
  SOUND_LAYERS,
  throughDoorway,
} from './mix';
import { FALLING, RADIUS, RISING, sceneOf } from './outdoors.test-kit';
import { gustAt } from './weather';

const scene = sceneOf();

/** Standing on the east shore, the sea ahead when facing east. */
const onShore = (yaw: number) => ({ at: [RADIUS, 0] as const, gaze: yaw });

const both = ({ leftEar, rightEar }: Ears): number =>
  Math.hypot(leftEar, rightEar);

/** The hum heard at `at`, facing `yaw`. */
const humAt = (at: readonly [number, number], yaw = 0): Ears =>
  outsideMix(scene, { at, gaze: yaw }, 0).layers.hum;

/** Every layer heard `x` metres east of the cube's middle. */
const eastBy = (x: number) =>
  outsideMix(scene, { at: [x, 0], gaze: 0 }, 0).layers;

describe('outsideMix', () => {
  it('keeps every level finite and at most 1, in the open', () => {
    for (let seconds = 0; seconds < 60; seconds += 1.7) {
      const mix = outsideMix(scene, onShore(seconds), seconds);
      assert.equal(mix.muffle, OPEN_AIR);
      for (const layer of SOUND_LAYERS) {
        for (const level of Object.values(mix.layers[layer])) {
          assert.ok(level >= 0 && level <= 1, layer);
        }
      }
    }
  });

  it('hisses as the sheet runs up and fizzes as it drains', () => {
    const up = outsideMix(scene, onShore(0), RISING).layers;
    const down = outsideMix(scene, onShore(0), FALLING).layers;
    assert.ok(both(up.hiss) > 4 * both(down.hiss));
    assert.ok(both(down.fizz) > 4 * both(up.fizz));
    assert.ok(both(up.roar) > 4 * both(down.roar));
  });

  it('puts the surf in the ear turned to the nearer shore', () => {
    // A step inland of the east shore, facing north: the sea is on the right.
    const inland = { at: [RADIUS - 6, 0] as const, gaze: -Math.PI / 2 };
    const { hiss } = outsideMix(scene, inland, RISING).layers;
    assert.ok(hiss.rightEar > 1.3 * hiss.leftEar);
    const turned = outsideMix(scene, { ...inland, gaze: Math.PI / 2 }, RISING);
    assert.ok(turned.layers.hiss.leftEar > 1.3 * turned.layers.hiss.rightEar);
  });

  it('is louder at the water than in the middle of the island', () => {
    const middle = outsideMix(scene, { at: [8, 8], gaze: 0 }, RISING).layers;
    const shore = outsideMix(scene, onShore(0), RISING).layers;
    assert.ok(both(shore.hiss) > 1.3 * both(middle.hiss));
    assert.ok(both(shore.roar) > 1.2 * both(middle.roar));
  });

  it('hums from where the cube is, and far less across the island', () => {
    assert.ok(both(humAt([3.3, 0])) > 6 * both(humAt([RADIUS, 0])));
    assert.ok(both(humAt([RADIUS, 0])) > 0);
    // The cube to the west of an eye facing north is on its left.
    const { leftEar, rightEar } = humAt([8, 0], -Math.PI / 2);
    assert.ok(leftEar > 1.5 * rightEar);
  });

  it('sounds different under the cube, and only there', () => {
    assert.ok(eastBy(0).under.leftEar > 0);
    assert.equal(eastBy(0).under.leftEar, eastBy(0).under.rightEar);
    assert.equal(eastBy(0).hum.leftEar, eastBy(0).hum.rightEar);
    assert.equal(eastBy(3).under.leftEar, 0);
    assert.ok(eastBy(0).wind.leftEar < eastBy(10).wind.leftEar);
  });

  it('puts the wind’s rumble in the ear turned to the wind', () => {
    const gusty = 58;
    assert.ok(gustAt(gusty) > 0.5);
    // The wind is from the west-south-west: on the left of an eye facing north.
    const north = outsideMix(scene, onShore(-Math.PI / 2), gusty).layers;
    assert.ok(north.buffet.leftEar > 2 * north.buffet.rightEar);
    const south = outsideMix(scene, onShore(Math.PI / 2), gusty).layers;
    assert.ok(south.buffet.rightEar > 2 * south.buffet.leftEar);
  });

  it('comes round with the hour', () => {
    const now = outsideMix(scene, onShore(1), 1234.5);
    const hourOn = outsideMix(scene, onShore(1), 1234.5 + 3600);
    for (const layer of SOUND_LAYERS) {
      assert.ok(
        Math.abs(now.layers[layer].leftEar - hourOn.layers[layer].leftEar) <
          1e-9,
        layer,
      );
    }
  });
});

describe('throughDoorway', () => {
  const outside = outsideMix(scene, onShore(0), RISING);
  const heard = (inward: number, rightward = 0, floorsBelow = 0) =>
    throughDoorway(outside, { inward, rightward, floorsBelow });

  it('lets in less, and duller, the further inside', () => {
    assert.ok(both(heard(4).layers.roar) < both(heard(0.5).layers.roar));
    assert.ok(heard(4).muffle < heard(0.5).muffle);
    assert.ok(heard(0.5).muffle < OPEN_AIR);
    assert.ok(both(heard(0).layers.hiss) <= both(outside.layers.hiss) + 1e-9);
  });

  it('comes from the doorway’s side', () => {
    const { roar } = heard(3, -1).layers;
    assert.ok(roar.leftEar > 1.5 * roar.rightEar);
    const ahead = heard(3, 0).layers.roar;
    assert.equal(ahead.leftEar, ahead.rightEar);
  });

  it('leaves the wind’s rumble outside', () => {
    const { buffet, under } = heard(3, -1).layers;
    assert.deepEqual(buffet, { leftEar: 0, rightEar: 0 });
    assert.deepEqual(under, { leftEar: 0, rightEar: 0 });
  });

  it('has no hum in the entrance hall, its filter shut from the sill on', () => {
    for (const inward of [0, 0.3, 3]) {
      const mix = heard(inward);
      assert.deepEqual(mix.layers.hum, { leftEar: 0, rightEar: 0 });
      assert.ok(mix.humMuffle < 100);
    }
    assert.equal(outside.humMuffle, OPEN_AIR);
  });

  it('keeps a hum on the floors below, open and fainter the deeper', () => {
    const first = heard(2, 0, 1);
    const second = heard(2, 0, 2);
    assert.ok(both(first.layers.hum) > 0);
    assert.ok(both(second.layers.hum) < both(first.layers.hum));
    assert.equal(first.humMuffle, OPEN_AIR);
  });

  it('fades floor by floor, from nowhere in particular', () => {
    const above = heard(2, -1, 0).layers;
    const below = heard(2, -1, 1).layers;
    assert.ok(both(below.roar) < 0.5 * both(above.roar));
    assert.equal(below.roar.leftEar, below.roar.rightEar);
    assert.ok(heard(2, -1, 1).muffle < heard(2, -1, 0).muffle);
  });
});

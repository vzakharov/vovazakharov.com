import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

import { MeadowSound } from './sound';

/**
 * A stand-in for Web Audio that counts the nodes built — every voice builds at
 * least one, so a count that holds still is a voice that was never made — and
 * the ones started on a suspended clock, which would all sound together the
 * moment it resumes; the levels set by a held voice, and the nodes stopped.
 */
const built = { nodes: 0, queued: 0, levels: 0, stopped: 0 };

class FakeParam {
  value = 0;
  setValueAtTime(): this {
    return this;
  }
  linearRampToValueAtTime(): this {
    return this;
  }
  exponentialRampToValueAtTime(): this {
    return this;
  }
  setTargetAtTime(): this {
    built.levels++;
    return this;
  }
}

class FakeNode {
  readonly gain = new FakeParam();
  readonly frequency = new FakeParam();
  private readonly context: FakeContext;
  constructor(context: FakeContext) {
    this.context = context;
    built.nodes++;
  }
  connect<T>(next: T): T {
    return next;
  }
  start(): void {
    if (this.context.state !== 'running') built.queued++;
  }
  stop(): void {
    built.stopped++;
  }
}

/** The pans every stereo panner was built at, in order. */
const pans: number[] = [];

class FakePanner extends FakeNode {
  constructor(context: FakeContext, { pan }: StereoPannerOptions) {
    super(context);
    pans.push(pan ?? 0);
  }
}

class FakeContext {
  state: AudioContextState = 'running';
  readonly currentTime = 0;
  readonly sampleRate = 8;
  readonly destination = {};
  createBuffer(): { getChannelData: () => Float32Array } {
    return { getChannelData: () => new Float32Array(24) };
  }
  async suspend(): Promise<void> {
    await this.becomes('suspended');
  }
  async resume(): Promise<void> {
    await this.becomes('running');
  }
  async close(): Promise<void> {
    await this.becomes('closed');
  }
  /** A real context changes state a turn after it is asked to. */
  private async becomes(state: AudioContextState): Promise<void> {
    await aTurn();
    this.state = state;
  }
}

async function aTurn(): Promise<void> {
  await new Promise((resolve) => {
    setImmediate(resolve);
  });
}

const page = {
  hidden: false,
  listener: undefined as (() => void) | undefined,
  addEventListener(_: string, listener: () => void): void {
    page.listener = listener;
  },
  removeEventListener(): void {
    page.listener = undefined;
  },
};

/** The tab going out of sight, or back, as the browser tells the page. */
function setHidden(hidden: boolean): void {
  page.hidden = hidden;
  page.listener?.();
}

/** What the synth reported: nothing, in a run where every call succeeds. */
const reported: unknown[] = [];

const globals = {
  reportError: (error: unknown) => reported.push(error),
  AudioContext: FakeContext,
  GainNode: FakeNode,
  OscillatorNode: FakeNode,
  AudioBufferSourceNode: FakeNode,
  BiquadFilterNode: FakeNode,
  DynamicsCompressorNode: FakeNode,
  StereoPannerNode: FakePanner,
  document: page,
};

beforeEach(() => {
  for (const [name, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, name, { value, configurable: true });
  }
  mock.timers.enable({ apis: ['setTimeout'] });
  built.nodes = 0;
  built.queued = 0;
  built.levels = 0;
  built.stopped = 0;
  pans.length = 0;
  page.hidden = false;
  reported.length = 0;
});

afterEach(() => {
  mock.timers.reset();
  assert.deepEqual(reported, []);
});

/** Every voice the scene can ask for, once each. */
function askForEverything(sound: MeadowSound): void {
  sound.pop();
  sound.boing(1);
  sound.note(72);
  sound.drum('kick');
  sound.drum('shaker');
  sound.grow();
  sound.sink();
  sound.nuhUh();
  sound.knock();
  sound.squeak();
  sound.takeOff('butterfly', 0);
  sound.takeOff('fly', -1);
  sound.takeOff('bee', 1);
  sound.shy('butterfly', 0.5);
  sound.step('left');
  sound.step('right');
  sound.whoosh();
  sound.shower(1, 1);
  sound.dusk(1);
}

function started(): MeadowSound {
  const sound = new MeadowSound();
  sound.start();
  return sound;
}

/** The nodes `start` builds for what `ask` queued before it, past a start with nothing queued. */
function builtOnStart(ask: (sound: MeadowSound) => void): number {
  built.nodes = 0;
  const silent = new MeadowSound();
  silent.start();
  const bare = built.nodes;
  silent.stop();

  built.nodes = 0;
  const sound = new MeadowSound();
  ask(sound);
  sound.start();
  const queued = built.nodes;
  sound.stop();
  return queued - bare;
}

describe('MeadowSound', () => {
  it('a voice asked for while sound is on is built', () => {
    const sound = started();
    const before = built.nodes;
    sound.pop();
    assert.ok(built.nodes > before);
    sound.stop();
  });

  it('the first tap before the synth exists is heard once it starts', () => {
    const sound = new MeadowSound();
    sound.pop();
    assert.equal(built.nodes, 0);
    sound.start();
    const withPop = built.nodes;
    sound.stop();

    built.nodes = 0;
    const silent = new MeadowSound();
    silent.start();
    assert.ok(withPop > built.nodes);
    silent.stop();
  });

  it('a chord of five asked for before the synth exists is built whole', () => {
    const note = builtOnStart((sound) => {
      sound.note(72);
    });
    const chord = builtOnStart((sound) => {
      for (let n = 0; n < 5; n++) sound.note(72);
    });
    assert.ok(note > 0);
    assert.equal(chord, 5 * note);
  });

  it('a sixth voice asked for before the synth exists drops the oldest', () => {
    const note = builtOnStart((sound) => {
      sound.note(72);
    });
    const pop = builtOnStart((sound) => {
      sound.pop();
    });
    // The two differ, so which of them was dropped shows in the count.
    assert.notEqual(pop, note);
    const six = builtOnStart((sound) => {
      sound.pop();
      for (let n = 0; n < 5; n++) sound.note(72);
    });
    assert.equal(six, 5 * note);
    const sixNotes = builtOnStart((sound) => {
      for (let n = 0; n < 6; n++) sound.note(72);
    });
    assert.equal(sixNotes, 5 * note);
  });

  it('a step is built while sound is on, and one walked before the synth exists never waits for it', () => {
    const sound = started();
    const before = built.nodes;
    sound.step('left');
    assert.ok(built.nodes > before);
    sound.stop();
    assert.equal(
      builtOnStart((early) => {
        early.step('right');
      }),
      0,
    );
  });

  it('a take-off and a shy sound where the insect is, across the stereo field', () => {
    const sound = started();
    sound.takeOff('fly', -0.75);
    sound.shy('bee', 0.4);
    assert.deepEqual(pans, [-0.75, 0.4]);
    sound.stop();
  });

  it('a browser with no Web Audio stays silent without throwing', () => {
    Object.defineProperty(globalThis, 'AudioContext', {
      value: undefined,
      configurable: true,
    });
    const sound = new MeadowSound();
    sound.start();
    askForEverything(sound);
    sound.stop();
    assert.equal(built.nodes, 0);
  });

  it('no voice is built while the tab is hidden', async () => {
    const sound = started();
    setHidden(true);
    await aTurn();
    const hidden = built.nodes;
    askForEverything(sound);
    assert.equal(built.nodes, hidden);
    setHidden(false);
    await aTurn();
    assert.equal(built.queued, 0, 'nothing queued plays on showing');
    sound.stop();
  });

  it('a shower is built once, and a frame at the same level builds and sets nothing', () => {
    const sound = started();
    const before = built.nodes;
    sound.shower(0.5, 0.5);
    const shower = built.nodes;
    assert.ok(shower > before);
    const levels = built.levels;
    sound.shower(0.5, 0.5);
    sound.shower(0.5, 0.5);
    assert.equal(built.nodes, shower);
    assert.equal(built.levels, levels);
    sound.shower(1, 1);
    assert.equal(built.nodes, shower, 'a new level builds nothing');
    assert.ok(built.levels > levels, 'a new level is set');
    sound.stop();
  });

  it('a dry meadow lets the shower go, and the next shower is built anew', () => {
    const sound = started();
    sound.shower(1, 1);
    const shower = built.nodes;
    const stopped = built.stopped;
    sound.shower(0, 0);
    assert.ok(built.stopped > stopped, 'its loops are stopped');
    const dry = built.nodes;
    sound.shower(0, 0);
    assert.equal(built.nodes, dry, 'a dry frame costs nothing');
    sound.shower(0.2, 0.2);
    assert.ok(built.nodes > shower);
    sound.stop();
  });

  it('a shower before the synth exists is not kept for it', () => {
    assert.equal(
      builtOnStart((early) => {
        early.shower(1, 1);
      }),
      0,
    );
  });

  it('a shower comes in as the tab shows again while it still rains', async () => {
    const sound = started();
    setHidden(true);
    await aTurn();
    const hidden = built.nodes;
    sound.shower(1, 1);
    assert.equal(built.nodes, hidden);
    setHidden(false);
    await aTurn();
    sound.shower(1, 1);
    assert.ok(built.nodes > hidden);
    sound.stop();
  });

  it('the crickets are built once at dusk, a still dusk sets nothing, and day lets them go', () => {
    const sound = started();
    const before = built.nodes;
    sound.dusk(0.5);
    const crickets = built.nodes;
    assert.ok(crickets > before);
    const levels = built.levels;
    sound.dusk(0.5);
    assert.equal(built.nodes, crickets);
    assert.equal(built.levels, levels);
    sound.dusk(1);
    assert.equal(built.nodes, crickets, 'a deeper dusk builds nothing');
    assert.ok(built.levels > levels, 'a deeper dusk is set');
    const stopped = built.stopped;
    sound.dusk(0);
    assert.ok(built.stopped > stopped, 'their loops are stopped');
    const day = built.nodes;
    sound.dusk(0);
    assert.equal(built.nodes, day, 'a day frame costs nothing');
    sound.stop();
  });

  it('no cricket chirps while the tab is hidden, and they come in as it shows again', async () => {
    const sound = started();
    setHidden(true);
    await aTurn();
    const hidden = built.nodes;
    sound.dusk(1);
    assert.equal(built.nodes, hidden);
    setHidden(false);
    await aTurn();
    sound.dusk(1);
    assert.ok(built.nodes > hidden);
    sound.stop();
  });

  it('no scheduled bird sings at dusk, and they sing again by day', () => {
    const sound = started();
    sound.dusk(1);
    const dusk = built.nodes;
    mock.timers.tick(60_000);
    assert.equal(built.nodes, dusk);
    sound.dusk(0);
    const day = built.nodes;
    mock.timers.tick(60_000);
    assert.ok(built.nodes > day);
    sound.stop();
  });

  it('a phrase of birds greets the morning, once, as the light turns back to day', () => {
    const sound = started();
    sound.dusk(1);
    sound.dusk(0.5);
    const before = built.nodes;
    sound.dusk(0.2);
    assert.ok(built.nodes > before, 'morning is greeted');
    const greeted = built.nodes;
    sound.dusk(0.1);
    sound.dusk(0.2);
    sound.dusk(0.25);
    assert.equal(built.nodes, greeted, 'once');
    sound.stop();
  });

  it('no bird sings while the tab is hidden', async () => {
    const sound = started();
    setHidden(true);
    await aTurn();
    const hidden = built.nodes;
    mock.timers.tick(60_000);
    assert.equal(built.nodes, hidden);
    sound.stop();
  });
});

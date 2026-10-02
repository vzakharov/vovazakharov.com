import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

import { MeadowSound } from './sound';

/**
 * A stand-in for Web Audio that counts the nodes built — every voice builds at
 * least one, so a count that holds still is a voice that was never made — and
 * the ones started on a suspended clock, which would all sound together the
 * moment it resumes.
 */
const built = { nodes: 0, queued: 0 };

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
    // A fake node makes no sound.
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
  localStorage: { getItem: () => null, setItem: () => null },
};

beforeEach(() => {
  for (const [name, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, name, { value, configurable: true });
  }
  mock.timers.enable({ apis: ['setTimeout'] });
  built.nodes = 0;
  built.queued = 0;
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
}

function started(): MeadowSound {
  const sound = new MeadowSound(false);
  sound.start();
  return sound;
}

/** The nodes `start` builds for what `ask` queued before it, past a start with nothing queued. */
function builtOnStart(ask: (sound: MeadowSound) => void): number {
  built.nodes = 0;
  const silent = new MeadowSound(false);
  silent.start();
  const bare = built.nodes;
  silent.stop();

  built.nodes = 0;
  const sound = new MeadowSound(false);
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
    const sound = new MeadowSound(false);
    sound.pop();
    assert.equal(built.nodes, 0);
    sound.start();
    const withPop = built.nodes;
    sound.stop();

    built.nodes = 0;
    const silent = new MeadowSound(false);
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
    const sound = new MeadowSound(false);
    sound.start();
    askForEverything(sound);
    sound.toggleMuted();
    sound.stop();
    assert.equal(built.nodes, 0);
  });

  it('no voice is built while muted, fading or suspended', async () => {
    const sound = started();
    sound.toggleMuted();
    const muted = built.nodes;
    askForEverything(sound);
    assert.equal(built.nodes, muted, 'during the fade');
    mock.timers.tick(1000);
    await aTurn();
    askForEverything(sound);
    assert.equal(built.nodes, muted, 'once suspended');
    sound.stop();
  });

  it('nothing asked for while muted plays on unmute', async () => {
    const sound = started();
    sound.toggleMuted();
    mock.timers.tick(1000);
    await aTurn();
    askForEverything(sound);
    const muted = built.nodes;
    sound.toggleMuted();
    await aTurn();
    assert.equal(built.queued, 0);
    assert.equal(built.nodes, muted);
    sound.pop();
    assert.ok(built.nodes > muted, 'a voice after unmute is heard');
    sound.stop();
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

  it('no bird sings while muted', () => {
    const sound = started();
    sound.toggleMuted();
    mock.timers.tick(1000);
    const muted = built.nodes;
    mock.timers.tick(60_000);
    assert.equal(built.nodes, muted);
    sound.stop();
  });
});

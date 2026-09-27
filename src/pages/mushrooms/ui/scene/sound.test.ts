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
  sound.chime(2);
  sound.grow();
  sound.sink();
  sound.nuhUh();
  sound.knock();
  sound.squeak();
  sound.takeOff('butterfly');
  sound.takeOff('fly');
  sound.takeOff('bee');
}

function started(): MeadowSound {
  const sound = new MeadowSound(false);
  sound.start();
  return sound;
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

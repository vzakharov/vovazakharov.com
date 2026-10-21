import { VARIANTS, type Variant } from './blind-test';

/** Short enough to hear as a cut, long enough not to click. */
const FADE_S = 0.015;
/** Past this, a silent track is pulled back onto the audible one. */
const DRIFT_S = 0.04;

type Track = { audio: HTMLAudioElement; gain: GainNode };

/**
 * Every variant of one song playing at once, only one of them audible, so a
 * switch is a gain change rather than a seek. The silent tracks drift, and
 * `resync` — called on a timer — pulls them back onto the audible one while
 * nobody can hear them move.
 */
export class BlindPlayer {
  private readonly context = new AudioContext();
  private tracks = new Map<Variant, Track>();
  private active: Variant = 'mix';

  load(urls: Record<Variant, string>) {
    this.unload();
    for (const variant of VARIANTS) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      audio.src = urls[variant];
      const gain = this.context.createGain();
      gain.gain.value = variant === this.active ? 1 : 0;
      this.context.createMediaElementSource(audio).connect(gain).connect(this.context.destination);
      this.tracks.set(variant, { audio, gain });
    }
  }

  async play() {
    await this.context.resume();
    const at = this.time;
    for (const { audio } of this.tracks.values()) audio.currentTime = at;
    await Promise.all([...this.tracks.values()].map(({ audio }) => audio.play()));
  }

  pause() {
    for (const { audio } of this.tracks.values()) audio.pause();
  }

  seek(seconds: number) {
    for (const { audio } of this.tracks.values()) audio.currentTime = seconds;
  }

  select(variant: Variant) {
    const now = this.context.currentTime;
    for (const [each, { gain }] of this.tracks) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(each === variant ? 1 : 0, now + FADE_S);
    }
    this.active = variant;
  }

  resync() {
    const lead = this.lead;
    if (lead === undefined || lead.paused) return;
    for (const [variant, { audio }] of this.tracks) {
      if (variant !== this.active && Math.abs(audio.currentTime - lead.currentTime) > DRIFT_S) {
        audio.currentTime = lead.currentTime;
      }
    }
  }

  get time() {
    return this.lead?.currentTime ?? 0;
  }

  get duration() {
    const seconds = this.lead?.duration;
    return seconds === undefined || Number.isNaN(seconds) ? 0 : seconds;
  }

  get playing() {
    return this.lead !== undefined && !this.lead.paused;
  }

  get ended() {
    return this.lead?.ended ?? false;
  }

  unload() {
    for (const { audio, gain } of this.tracks.values()) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      gain.disconnect();
    }
    this.tracks.clear();
  }

  close() {
    this.unload();
    void this.context.close();
  }

  private get lead() {
    return this.tracks.get(this.active)?.audio;
  }
}

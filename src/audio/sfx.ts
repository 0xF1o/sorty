/** Tiny procedural SFX - no audio files, nothing to download. */
export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  volume = 0.5;

  init(): void {
    if (this.ctx) { void this.ctx.resume(); return }
    try {
      const Ctor = window.AudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    } catch { this.ctx = null }
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain: number, slide = 0, delay = 0): void {
    const ctx = this.ctx;
    const out = this.master;
    if (!ctx || !out) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide !== 0) osc.frequency.linearRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(env).connect(out);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private noise(dur: number, gain: number, freq: number, delay = 0): void {
    const ctx = this.ctx;
    const out = this.master;
    if (!ctx || !out) return;
    const t0 = ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 1.2;
    const env = ctx.createGain();
    env.gain.value = gain;
    src.connect(filter).connect(env).connect(out);
    src.start(t0);
  }

  pickup(): void { this.tone(560, 0.07, 'triangle', 0.1, 140) }
  place(): void { this.noise(0.09, 0.18, 700); this.tone(150, 0.1, 'sine', 0.12, -50) }
  reject(): void { this.tone(140, 0.16, 'square', 0.07, -30) }
  coin(): void { this.tone(880, 0.06, 'triangle', 0.09, 220); this.tone(1320, 0.07, 'triangle', 0.07, 0, 0.05) }
  chime(): void { this.tone(660, 0.12, 'sine', 0.09); this.tone(990, 0.16, 'sine', 0.07, 0, 0.09) }
  tidy(): void { this.noise(0.14, 0.12, 1400); this.tone(440, 0.12, 'triangle', 0.07, 300) }
  tick(): void { this.tone(1200, 0.03, 'square', 0.04) }
}

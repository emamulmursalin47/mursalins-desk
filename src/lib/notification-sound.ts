/**
 * Notification sound using the Web Audio API.
 * Generates a pleasant two-tone chime — no external files needed.
 *
 * Browsers block audio before any user interaction (autoplay policy).
 * Call `primeAudio()` on the first user click/tap to unlock playback.
 */

let audioCtx: AudioContext | null = null;
let primed = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Call once on the first user gesture (click/tap) to unlock audio playback.
 * After this, `playNotificationSound()` will work reliably.
 */
export function primeAudio() {
  if (primed) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  // Play a silent buffer to fully unlock
  const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start(0);
  primed = true;
}

export function playNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Try to resume — will only work if user has interacted
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  // Skip if context is still locked (no user interaction yet)
  if (ctx.state !== "running") return;

  const now = ctx.currentTime;

  // Two-tone chime: E5 → G5 (pleasant, non-intrusive)
  const tones: [number, number][] = [
    [659.25, 0.15],
    [783.99, 0.22],
  ];

  let offset = 0;
  for (const [freq, dur] of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, now + offset);
    gain.gain.linearRampToValueAtTime(0.18, now + offset + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + offset);
    osc.stop(now + offset + dur);

    offset += dur * 0.75;
  }
}

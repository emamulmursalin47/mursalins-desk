/**
 * Notification sound using the Web Audio API.
 * Generates a pleasant two-tone chime — no external files needed.
 *
 * Browsers block audio before a valid user gesture (click, tap, keydown).
 * Call `primeAudio()` on user interaction to unlock playback.
 * NOTE: scroll is NOT a valid gesture — only click/touch/key work.
 */

let audioCtx: AudioContext | null = null;

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
 * Returns true if AudioContext is already running (no priming needed).
 */
export function isAudioReady(): boolean {
  return audioCtx?.state === "running";
}

/**
 * Call on user gestures (click/touch/keydown) to unlock the AudioContext.
 * Safe to call multiple times — no-ops if already running.
 */
export function primeAudio() {
  const ctx = getAudioContext();
  if (!ctx || ctx.state === "running") return;
  ctx.resume().catch(() => {});
}

/** Play the two-tone chime */
function scheduleTones(ctx: AudioContext) {
  const now = ctx.currentTime;

  const tones: [number, number][] = [
    [659.25, 0.15], // E5
    [783.99, 0.22], // G5
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

/**
 * Play notification sound if audio is unlocked.
 * If suspended, attempts resume first (may fail without prior user gesture).
 */
export function playNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "running") {
    scheduleTones(ctx);
    return;
  }

  if (ctx.state === "suspended") {
    ctx
      .resume()
      .then(() => {
        if (ctx.state === "running") {
          scheduleTones(ctx);
        }
      })
      .catch(() => {});
  }
}

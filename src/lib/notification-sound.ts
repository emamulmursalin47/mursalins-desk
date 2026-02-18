/**
 * Notification sound using the Web Audio API.
 * Generates a pleasant two-tone chime — no external files needed.
 *
 * Browsers block audio before a valid user gesture (click, tap, keydown).
 * Call `primeAudio()` on user interaction to unlock playback.
 * If a sound is requested while locked, it queues and plays on first gesture.
 * NOTE: scroll is NOT a valid gesture — only click/touch/key work.
 */

let audioCtx: AudioContext | null = null;
let pendingSound = false;

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
 * If a sound was queued while locked, plays it immediately after unlock.
 */
export function primeAudio() {
  const ctx = getAudioContext();
  if (!ctx || ctx.state === "running") {
    // Already running — play pending sound if any
    if (pendingSound && ctx?.state === "running") {
      pendingSound = false;
      scheduleTones(ctx);
    }
    return;
  }
  ctx
    .resume()
    .then(() => {
      if (ctx.state === "running" && pendingSound) {
        pendingSound = false;
        scheduleTones(ctx);
      }
    })
    .catch(() => {});
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
 * If suspended, queues the sound — it will play on next user gesture via primeAudio().
 */
export function playNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "running") {
    pendingSound = false;
    scheduleTones(ctx);
    return;
  }

  // Audio locked — queue the sound for when primeAudio() unlocks it
  pendingSound = true;
}

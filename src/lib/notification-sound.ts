/**
 * Lightweight notification sound using the Web Audio API.
 * No external files needed — generates a pleasant two-tone chime.
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

export function playNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // Two-tone chime: E5 → G5 (pleasant, non-intrusive)
  const tones: [number, number][] = [
    [659.25, 0.12],
    [783.99, 0.18],
  ];

  let offset = 0;
  for (const [freq, dur] of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, now + offset);
    gain.gain.linearRampToValueAtTime(0.15, now + offset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + offset);
    osc.stop(now + offset + dur);

    offset += dur * 0.8; // slight overlap for smoothness
  }
}

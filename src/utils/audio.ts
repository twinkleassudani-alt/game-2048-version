let audioCtx: AudioContext | null = null;
let isMuted = false;

export const setMutedState = (mute: boolean) => {
  isMuted = mute;
  if (!mute && audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
};

export const getMutedState = () => isMuted;

const initAudio = (): AudioContext | null => {
  if (isMuted) return null;
  
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    console.warn("AudioContext not supported in this browser.", e);
    return null;
  }
};

const createOscillator = (
  ctx: AudioContext,
  type: OscillatorType,
  freqStart: number,
  freqEnd: number,
  duration: number,
  gainStart: number,
  delay: number = 0
) => {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, ctx.currentTime + delay);
  if (freqEnd !== freqStart) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + delay + duration);
  }

  gainNode.gain.setValueAtTime(gainStart, ctx.currentTime + delay);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
};

export const playSlideSound = () => {
  const ctx = initAudio();
  if (!ctx) return;

  // Slide sound: Quick upward frequency sweep
  createOscillator(ctx, 'triangle', 260, 420, 0.08, 0.08);
};

export const playMergeSound = () => {
  const ctx = initAudio();
  if (!ctx) return;

  // Merge sound: Play two quick harmonious tones (perfect major third chime)
  createOscillator(ctx, 'sine', 392, 392, 0.05, 0.12, 0); // G4
  createOscillator(ctx, 'sine', 494, 494, 0.12, 0.12, 0.04); // B4
};

export const playWinSound = () => {
  const ctx = initAudio();
  if (!ctx) return;

  // Win sound: Upward arpeggio
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
  notes.forEach((freq, idx) => {
    createOscillator(ctx, 'sine', freq, freq, 0.2, 0.1, idx * 0.08);
  });
};

export const playGameOverSound = () => {
  const ctx = initAudio();
  if (!ctx) return;

  // Game over sound: Sad descending sweep
  createOscillator(ctx, 'sawtooth', 220, 90, 0.45, 0.06);
};

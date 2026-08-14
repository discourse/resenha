import { RING_SECONDS } from "./call-constants";

let sharedCtx = null;

async function getAudioContext() {
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioContext();
  }
  if (sharedCtx.state === "suspended") {
    await sharedCtx.resume();
  }
  return sharedCtx;
}

export async function playConnectedSound() {
  try {
    const ctx = await getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.value = 523.25; // C5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.value = 659.25; // E5
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.25);
  } catch {
    // audio not available
  }
}

export async function playDisconnectedSound() {
  try {
    const ctx = await getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.value = 659.25; // E5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.value = 523.25; // C5
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.25);
  } catch {
    // audio not available
  }
}

export async function playUserJoinedSound() {
  try {
    const ctx = await getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 659.25; // E5
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // audio not available
  }
}

export async function playUserLeftSound() {
  try {
    const ctx = await getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 523.25; // C5
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // audio not available
  }
}

export async function playMuteSound() {
  try {
    const ctx = await getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 392.0; // G4
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // audio not available
  }
}

export async function playUnmuteSound() {
  try {
    const ctx = await getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 440.0; // A4
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // audio not available
  }
}

export async function playDeafenSound() {
  try {
    const ctx = await getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.value = 392.0; // G4
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.07);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.value = 293.66; // D4
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.1, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.14);
  } catch {
    // audio not available
  }
}

export async function playUndeafenSound() {
  try {
    const ctx = await getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.value = 293.66; // D4
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.07);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.value = 392.0; // G4
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.1, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.14);
  } catch {
    // audio not available
  }
}

let ringtoneTimer = null;
let waitingTimer = null;

// The loops stop themselves at the ring window so no caller has to remember
// to. Explicit stops (answer, decline, hang up) come sooner.
const MAX_CALL_LOOP_MS = RING_SECONDS * 1000;

// Bumped on every start/stop so an in-flight start that was parked on an
// AudioContext await can tell it has been superseded and must not begin
// playing (e.g. a ringtone start that only unblocks once the user joins).
let callSoundGeneration = 0;

// All loop audio routes through this node so stopping can silence tones the
// scheduler already queued, not just cancel the next cycle.
let callLoopGain = null;

// Ringing is triggered by a MessageBus event, not a user gesture. Without a
// prior gesture the context may not only refuse to resume — resume() can sit
// pending until the next gesture, so awaiting it outright would start the
// sound at whatever the user does next. Race it against a short timeout and
// report the state we actually reached.
async function runningAudioContext() {
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioContext();
  }
  if (sharedCtx.state === "suspended") {
    await Promise.race([
      sharedCtx.resume().catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 300)),
    ]);
  }
  return sharedCtx.state === "running" ? sharedCtx : null;
}

// Warms up the shared AudioContext inside a user gesture so sounds scheduled
// after later awaits (e.g. once a call request round-trips) still play.
export function unlockAudio() {
  getAudioContext().catch(() => {});
}

/**
 * Start the looping incoming-call ringtone on the callee's device.
 *
 * @returns {Promise<boolean>} whether audio is actually playing
 */
export async function startRingtone() {
  stopCallSounds();
  const generation = ++callSoundGeneration;
  try {
    const ctx = await runningAudioContext();
    if (!ctx || generation !== callSoundGeneration) {
      return false;
    }

    const output = ctx.createGain();
    output.connect(ctx.destination);
    callLoopGain = output;

    let nextTime = ctx.currentTime + 0.05;
    const startedAt = Date.now();

    const schedule = () => {
      if (!ringtoneTimer || generation !== callSoundGeneration) {
        return;
      }
      if (Date.now() - startedAt >= MAX_CALL_LOOP_MS) {
        stopCallSounds();
        return;
      }

      const notes = [523.25, 659.25, 783.99, 1046.5];
      [0, 0.45].forEach((offset) => {
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = nextTime + offset + idx * 0.075;
          const dur = idx === 3 ? 0.22 : 0.12;
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.14, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.connect(gain).connect(output);
          osc.start(t);
          osc.stop(t + dur + 0.02);
        });
      });

      const motifDuration = 0.95;
      const totalCycle = motifDuration + 1.8;
      nextTime += totalCycle;

      ringtoneTimer = setTimeout(
        schedule,
        Math.max((totalCycle - 0.2) * 1000, 200)
      );
    };

    ringtoneTimer = true;
    schedule();
    return true;
  } catch {
    return false;
  }
}

/**
 * Start the looping waiting (ringback) tone on the caller's device.
 *
 * @param {number} [maxDurationMs] cap below the full ring window, e.g. when
 *   resuming partway through an already-running ring
 * @returns {Promise<boolean>} whether audio is actually playing
 */
export async function startWaitingSound(maxDurationMs = MAX_CALL_LOOP_MS) {
  stopCallSounds();
  const generation = ++callSoundGeneration;
  const capMs = Math.min(maxDurationMs, MAX_CALL_LOOP_MS);
  if (capMs <= 0) {
    return false;
  }
  try {
    const ctx = await runningAudioContext();
    if (!ctx || generation !== callSoundGeneration) {
      return false;
    }

    const output = ctx.createGain();
    output.connect(ctx.destination);
    callLoopGain = output;

    let nextTime = ctx.currentTime + 0.05;
    const startedAt = Date.now();

    const schedule = () => {
      if (!waitingTimer || generation !== callSoundGeneration) {
        return;
      }
      if (Date.now() - startedAt >= capMs) {
        stopCallSounds();
        return;
      }

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc1.frequency.value = 523.25;
      osc2.frequency.value = 659.25;
      gain1.gain.setValueAtTime(0.001, nextTime);
      gain1.gain.linearRampToValueAtTime(0.12, nextTime + 0.08);
      gain1.gain.exponentialRampToValueAtTime(0.001, nextTime + 1.1);
      gain2.gain.setValueAtTime(0.001, nextTime + 0.04);
      gain2.gain.linearRampToValueAtTime(0.12, nextTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, nextTime + 1.14);
      osc1.connect(gain1).connect(output);
      osc2.connect(gain2).connect(output);
      osc1.start(nextTime);
      osc2.start(nextTime + 0.04);
      osc1.stop(nextTime + 1.15);
      osc2.stop(nextTime + 1.2);

      const toneDuration = 1.2;
      const totalCycle = toneDuration + 2.2;
      nextTime += totalCycle;

      waitingTimer = setTimeout(
        schedule,
        Math.max((totalCycle - 0.2) * 1000, 200)
      );
    };

    waitingTimer = true;
    schedule();
    return true;
  } catch {
    return false;
  }
}

/**
 * Stop whichever call loop (ringtone or waiting tone) is active.
 */
export function stopCallSounds() {
  // Invalidates starts still parked on the AudioContext await, so a ringtone
  // blocked on a missing user gesture can't begin playing after the fact.
  callSoundGeneration++;

  if (ringtoneTimer) {
    clearTimeout(ringtoneTimer);
    ringtoneTimer = null;
  }
  if (waitingTimer) {
    clearTimeout(waitingTimer);
    waitingTimer = null;
  }

  // Cutting the loop's shared output silences tones already scheduled on the
  // context, which cancelling the next cycle alone would let ring out.
  if (callLoopGain) {
    try {
      callLoopGain.disconnect();
    } catch {
      // already disconnected
    }
    callLoopGain = null;
  }
}

export function schedulePlaybackResume(element, pendingPlaybackElements) {
  if (
    !element ||
    typeof document === "undefined" ||
    pendingPlaybackElements.has(element)
  ) {
    return;
  }

  pendingPlaybackElements.add(element);

  const resume = () => {
    try {
      element.play?.();
    } catch {
      // ignore subsequent failures
    }

    document.removeEventListener("pointerdown", resume);
    document.removeEventListener("keydown", resume);
    pendingPlaybackElements.delete(element);
  };

  document.addEventListener("pointerdown", resume, { once: true });
  document.addEventListener("keydown", resume, { once: true });
}

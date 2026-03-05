export default class AudioMonitor {
  static peerKey(roomId, userId) {
    return `${roomId}:${userId}`;
  }

  #monitors = new Map();

  #onSpeakingChange;
  #onVoiceActivity;

  constructor({ onSpeakingChange, onVoiceActivity }) {
    this.#onSpeakingChange = onSpeakingChange;
    this.#onVoiceActivity = onVoiceActivity;
  }

  ensure(roomId, userId, stream, isCurrentUser) {
    if (!roomId || !userId || !stream) {
      return;
    }

    const audioContextClass =
      typeof window !== "undefined" &&
      (window.AudioContext || window.webkitAudioContext);

    if (!audioContextClass) {
      return;
    }

    const key = AudioMonitor.peerKey(roomId, userId);
    const existing = this.#monitors.get(key);
    if (existing?.stream === stream) {
      return;
    }

    if (existing) {
      this.teardown(roomId, userId);
    }

    try {
      const audioContext = new audioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let rafId = null;
      let speaking = false;
      let stopSpeakingTimer = null;

      const sample = () => {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const deviation = dataArray[i] - 128;
          sum += deviation * deviation;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const isSpeaking = rms > 8;

        if (isSpeaking && isCurrentUser) {
          this.#onVoiceActivity();
        }

        if (isSpeaking) {
          if (stopSpeakingTimer) {
            clearTimeout(stopSpeakingTimer);
            stopSpeakingTimer = null;
          }
          if (!speaking) {
            speaking = true;
            this.#onSpeakingChange(roomId, userId, true);
          }
        } else if (speaking && !stopSpeakingTimer) {
          stopSpeakingTimer = setTimeout(() => {
            speaking = false;
            stopSpeakingTimer = null;
            this.#onSpeakingChange(roomId, userId, false);
          }, 500);
        }

        rafId =
          typeof window !== "undefined"
            ? window.requestAnimationFrame(sample)
            : null;
      };

      sample();

      this.#monitors.set(key, {
        stream,
        stop() {
          if (rafId && typeof window !== "undefined") {
            window.cancelAnimationFrame(rafId);
          }

          if (stopSpeakingTimer) {
            clearTimeout(stopSpeakingTimer);
            stopSpeakingTimer = null;
          }

          try {
            source.disconnect();
          } catch {
            // ignore
          }

          audioContext.close();
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to initialize audio monitor", error);
    }
  }

  teardown(roomId, userId) {
    if (!roomId || !userId) {
      return;
    }

    const key = AudioMonitor.peerKey(roomId, userId);
    const monitor = this.#monitors.get(key);
    if (!monitor) {
      return;
    }

    monitor.stop?.();
    this.#monitors.delete(key);
    this.#onSpeakingChange(roomId, userId, false);
  }

  teardownRoom(roomId) {
    Array.from(this.#monitors.keys()).forEach((key) => {
      if (key.startsWith(`${roomId}:`)) {
        const [, userId] = key.split(":");
        this.teardown(roomId, Number(userId));
      }
    });
  }

  destroyAll() {
    this.#monitors.forEach((monitor) => monitor?.stop?.());
    this.#monitors.clear();
  }
}

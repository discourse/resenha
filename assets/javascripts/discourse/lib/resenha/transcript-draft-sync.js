const SAVE_INTERVAL_MS = 10_000;

// Mirrors an in-progress transcript into a server-side topic draft so the
// recording survives a crashed tab and shows up in the user's drafts like
// any half-written topic. Saves ride a fixed cadence and only when entries
// changed; the draft key is new_topic-prefixed so core's drafts list and
// resume flow treat it as a normal new-topic draft.
//
// The composer owns the draft the moment the user opens it: from then on
// (or after a sequence conflict, which means some other client wrote it)
// background saves stop for good, so user edits are never clobbered by a
// regenerated transcript.
export default class TranscriptDraftSync {
  #save;
  #buildData;
  #isHeldByComposer;
  #timer = null;
  #saving = false;
  #dirty = false;
  #sequence = 0;
  #handedOff = false;
  #key = null;

  constructor({ save, buildData, isHeldByComposer }) {
    this.#save = save;
    this.#buildData = buildData;
    this.#isHeldByComposer = isHeldByComposer;
  }

  get key() {
    return this.#key;
  }

  get sequence() {
    return this.#sequence;
  }

  start(roomId, startedAt) {
    this.dispose();
    this.#key = `new_topic_resenha_${roomId}_${startedAt}`;
    this.#sequence = 0;
    this.#dirty = false;
    this.#handedOff = false;
    this.#timer = setInterval(() => this.flush(), SAVE_INTERVAL_MS);
  }

  markDirty() {
    this.#dirty = true;
  }

  // Stops the cadence and flushes what's pending. The key survives so the
  // finished draft can still be opened.
  async stop() {
    clearInterval(this.#timer);
    this.#timer = null;
    await this.flush();
  }

  dispose() {
    clearInterval(this.#timer);
    this.#timer = null;
    this.#key = null;
  }

  async flush() {
    if (!this.#key || this.#handedOff || this.#saving || !this.#dirty) {
      return;
    }
    if (this.#isHeldByComposer(this.#key)) {
      this.#handedOff = true;
      return;
    }

    const data = this.#buildData();
    if (!data) {
      return;
    }

    this.#saving = true;
    this.#dirty = false;
    try {
      const result = await this.#save(this.#key, this.#sequence, data);
      this.#sequence = result?.draft_sequence ?? this.#sequence;
    } catch (error) {
      if (error?.jqXHR?.status === 409) {
        this.#handedOff = true;
      } else {
        // Transient failure (network, logout race): retry next tick.
        this.#dirty = true;
      }
    } finally {
      this.#saving = false;
    }
  }
}

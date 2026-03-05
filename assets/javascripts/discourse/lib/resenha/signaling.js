import { ajax } from "discourse/lib/ajax";

export default class SignalingManager {
  static #candidateBatchDelayMs = 75;
  static #candidateBatchSize = 5;
  static #httpBatchDelayMs = 25;

  static peerKey(roomId, userId) {
    return `${roomId}:${userId}`;
  }

  static #buildPayload(messages) {
    if (messages.length === 1) {
      const [message] = messages;

      if (message.events.length === 1) {
        return {
          ...message.events[0],
          recipient_id: message.recipient_id,
        };
      }

      return {
        recipient_id: message.recipient_id,
        events: message.events,
      };
    }

    return {
      messages: messages.map((message) => ({
        recipient_id: message.recipient_id,
        events: message.events,
      })),
    };
  }

  #signalQueues = new Map();
  #signalFlushTimers = new Map();
  #httpSignalQueues = new Map();
  #httpSignalFlushTimers = new Map();

  #isActiveRoom;
  #hasPeer;

  constructor({ isActiveRoom, hasPeer }) {
    this.#isActiveRoom = isActiveRoom;
    this.#hasPeer = hasPeer;
  }

  async send(roomId, recipientId, payload) {
    if (!roomId || !recipientId || !payload) {
      return;
    }

    if (!this.#isActiveRoom(roomId)) {
      return;
    }

    if (!this.#hasPeer(roomId, recipientId)) {
      return;
    }

    if (payload.type === "candidate") {
      this.#queue(roomId, recipientId, payload);
      return;
    }

    await this.flushQueued(roomId, recipientId);
    await this.#postSignals(roomId, recipientId, [payload]);
  }

  #queue(roomId, recipientId, payload) {
    const key = SignalingManager.peerKey(roomId, recipientId);
    const queue = this.#signalQueues.get(key) || [];
    queue.push(payload);
    this.#signalQueues.set(key, queue);

    if (queue.length >= SignalingManager.#candidateBatchSize) {
      this.flushQueued(roomId, recipientId).catch((error) => {
        // eslint-disable-next-line no-console
        console.warn("[resenha] failed to flush signal queue", error);
      });
      return;
    }

    const existingTimer = this.#signalFlushTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.#signalFlushTimers.delete(key);
      this.flushQueued(roomId, recipientId).catch((error) => {
        // eslint-disable-next-line no-console
        console.warn("[resenha] failed to flush signal queue", error);
      });
    }, SignalingManager.#candidateBatchDelayMs);

    this.#signalFlushTimers.set(key, timer);
  }

  async flushQueued(roomId, recipientId) {
    const key = SignalingManager.peerKey(roomId, recipientId);
    const queue = this.#signalQueues.get(key);

    if (!queue?.length) {
      return;
    }

    this.#signalQueues.delete(key);

    const timer = this.#signalFlushTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.#signalFlushTimers.delete(key);
    }

    await this.#postSignals(roomId, recipientId, queue);
  }

  async #postSignals(roomId, recipientId, events) {
    if (!events?.length || !this.#isActiveRoom(roomId)) {
      return;
    }

    await this.#enqueueHttp(roomId, recipientId, events);
  }

  #enqueueHttp(roomId, recipientId, events) {
    if (!roomId || !recipientId || !events?.length) {
      return Promise.resolve();
    }

    let entry = this.#httpSignalQueues.get(roomId);

    if (!entry) {
      entry = {
        recipients: new Map(),
        pending: [],
      };

      this.#httpSignalQueues.set(roomId, entry);
    }

    const roomQueue = entry.recipients;
    const existingEvents = roomQueue.get(recipientId);

    if (existingEvents) {
      existingEvents.push(...events);
    } else {
      roomQueue.set(recipientId, [...events]);
    }

    const promise = new Promise((resolve, reject) => {
      entry.pending.push({ resolve, reject });
    });

    this.#scheduleHttpFlush(roomId);

    return promise;
  }

  #scheduleHttpFlush(roomId) {
    if (this.#httpSignalFlushTimers.has(roomId)) {
      return;
    }

    const timer = setTimeout(() => {
      this.#httpSignalFlushTimers.delete(roomId);
      this.#flushHttp(roomId).catch((error) => {
        // eslint-disable-next-line no-console
        console.warn("[resenha] failed to flush HTTP signal queue", error);
      });
    }, SignalingManager.#httpBatchDelayMs);

    this.#httpSignalFlushTimers.set(roomId, timer);
  }

  async #flushHttp(roomId) {
    const entry = this.#httpSignalQueues.get(roomId);
    if (!entry) {
      return;
    }

    if (!this.#isActiveRoom(roomId)) {
      entry.recipients?.clear?.();
      entry.pending.splice(0).forEach((pending) => pending.resolve?.());
      this.#httpSignalQueues.delete(roomId);
      return;
    }

    const roomQueue = entry.recipients;
    if (!roomQueue?.size) {
      entry.pending.splice(0).forEach((pending) => pending.resolve?.());
      return;
    }

    const messages = [];

    roomQueue.forEach((events, recipientId) => {
      if (!events?.length) {
        return;
      }

      messages.push({
        recipient_id: recipientId,
        events,
      });
    });

    roomQueue.clear();

    if (!messages.length) {
      entry.pending.splice(0).forEach((pending) => pending.resolve?.());
      return;
    }

    const payload = SignalingManager.#buildPayload(messages);

    // eslint-disable-next-line no-console
    console.log(
      `[resenha] 🚀 sending ${messages.length} batched signal recipient(s) in room ${roomId}`
    );

    try {
      await ajax(`/resenha/rooms/${roomId}/signal`, {
        type: "POST",
        data: { payload },
      });

      entry.pending.splice(0).forEach((pending) => pending.resolve?.());
    } catch (error) {
      entry.pending.splice(0).forEach((pending) => pending.reject?.(error));
      throw error;
    }
  }

  clearForPeer(roomId, recipientId) {
    const key = SignalingManager.peerKey(roomId, recipientId);
    const timer = this.#signalFlushTimers.get(key);

    if (timer) {
      clearTimeout(timer);
      this.#signalFlushTimers.delete(key);
    }

    this.#signalQueues.delete(key);
  }

  clearForRoom(roomId) {
    const prefix = `${roomId}:`;

    Array.from(this.#signalQueues.keys()).forEach((key) => {
      if (!key.startsWith(prefix)) {
        return;
      }

      const timer = this.#signalFlushTimers.get(key);

      if (timer) {
        clearTimeout(timer);
        this.#signalFlushTimers.delete(key);
      }

      this.#signalQueues.delete(key);
    });
  }

  clearHttpQueue(roomId) {
    const timer = this.#httpSignalFlushTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.#httpSignalFlushTimers.delete(roomId);
    }

    const entry = this.#httpSignalQueues.get(roomId);
    if (!entry) {
      return;
    }

    entry.recipients?.clear?.();
    entry.pending?.forEach((pending) => pending.resolve?.());
    entry.pending = [];
    this.#httpSignalQueues.delete(roomId);
  }

  destroy() {
    this.#signalFlushTimers.forEach((timer) => clearTimeout(timer));
    this.#signalFlushTimers.clear();
    this.#httpSignalFlushTimers.forEach((timer) => clearTimeout(timer));
    this.#httpSignalFlushTimers.clear();
    this.#httpSignalQueues.forEach((entry) => {
      entry?.pending?.forEach((pending) => pending.resolve?.());
    });
    this.#httpSignalQueues.clear();
    this.#signalQueues.clear();
  }
}

import { tracked } from "@glimmer/tracking";
import Service, { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { bind } from "discourse/lib/decorators";

// Participant broadcasts arrive in arbitrary database order, so every list
// that reaches the UI is normalized to one canonical order — otherwise
// sidebar rows and video tiles reshuffle on each broadcast.
function sortParticipants(participants) {
  return [...(participants || [])].sort((a, b) => {
    const nameA = (a?.username || "").toLowerCase();
    const nameB = (b?.username || "").toLowerCase();
    if (nameA !== nameB) {
      return nameA < nameB ? -1 : 1;
    }
    return Number(a?.id) - Number(b?.id);
  });
}

export default class ResenhaRoomsService extends Service {
  @service currentUser;
  @service messageBus;
  @service siteSettings;
  @service site;

  @tracked rooms = [];
  @tracked canCreateRoom = false;

  #roomsById = new Map();
  #roomsBySlug = new Map();
  #roomSubscriptions = new Map();
  #roomHandlers = new Map();

  constructor() {
    super(...arguments);
    if (!this.siteSettings.resenha_enabled) {
      return;
    }

    // Anonymous visitors only bootstrap when Resenha is open to everyone; the
    // server then returns just the public rooms.
    if (!this.currentUser && !this.site.resenha_public_access) {
      return;
    }

    this.ready = this.#bootstrap();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.messageBus.unsubscribe(
      "/resenha/rooms/index",
      this.handleDirectoryEvent
    );
    this.#roomSubscriptions.forEach((callback, roomId) => {
      this.messageBus.unsubscribe(`/resenha/rooms/${roomId}`, callback);
    });
    this.#roomSubscriptions.clear();
    this.#roomHandlers.clear();
  }

  roomById(id) {
    return this.#roomsById.get(id);
  }

  roomBySlug(slug) {
    return this.#roomsBySlug.get(slug);
  }

  async #bootstrap() {
    const payload = await ajax("/resenha/rooms.json");
    this.canCreateRoom = payload.can_create_room ?? false;
    this.#hydrateRooms(payload.rooms);

    // Subscribing from the snapshot's message-bus position replays anything
    // published while the payload was in flight; subscribing without one
    // would silently drop those events.
    this.messageBus.subscribe(
      "/resenha/rooms/index",
      this.handleDirectoryEvent,
      payload.index_message_bus_last_id ?? -1
    );

    return this.rooms;
  }

  #hydrateRooms(roomPayloads) {
    this.rooms = roomPayloads;
    this.#roomsById.clear();
    this.#roomsBySlug.clear();

    roomPayloads.forEach((room) => {
      room.active_participants = sortParticipants(room.active_participants);
      this.#roomsById.set(room.id, room);
      this.#roomsBySlug.set(room.slug, room);
      this.#ensureRoomSubscription(room.id, room.message_bus_last_id);
    });
  }

  @bind
  handleDirectoryEvent(message) {
    if (message.type === "destroyed") {
      this.#roomsById.delete(message.room.id);
      this.#roomsBySlug.delete(message.room.slug);
      this.#teardownRoomSubscription(message.room.id);
    } else {
      message.room.active_participants = sortParticipants(
        message.room.active_participants
      );
      this.#roomsById.set(message.room.id, message.room);
      this.#roomsBySlug.set(message.room.slug, message.room);
      this.#ensureRoomSubscription(
        message.room.id,
        message.room.message_bus_last_id
      );
    }

    this.rooms = Array.from(this.#roomsById.values());

    if (message.type === "updated") {
      this.#forwardToRoomHandlers(message.room.id, {
        type: "room_updated",
        room_id: message.room.id,
        room: message.room,
      });
    }
  }

  registerRoomHandler(roomId, callback) {
    let handlers = this.#roomHandlers.get(roomId);
    if (!handlers) {
      handlers = new Set();
      this.#roomHandlers.set(roomId, handlers);
    }
    handlers.add(callback);
  }

  unregisterRoomHandler(roomId, callback) {
    const handlers = this.#roomHandlers.get(roomId);
    if (!handlers) {
      return;
    }
    handlers.delete(callback);
    if (handlers.size === 0) {
      this.#roomHandlers.delete(roomId);
    }
  }

  handleRoomBroadcast(payload) {
    const room = this.#roomsById.get(payload.room_id);
    if (!room) {
      return;
    }

    if (payload.type === "participants") {
      this.#setRoomParticipants(room.id, payload.participants || []);
    } else if (payload.type === "role_change") {
      this.setParticipantRole(payload.room_id, payload.user_id, payload.role);
    }

    this.#forwardToRoomHandlers(payload.room_id, payload);
  }

  #ensureRoomSubscription(roomId, lastId) {
    if (this.#roomSubscriptions.has(roomId)) {
      return;
    }

    const channel = `/resenha/rooms/${roomId}`;
    const callback = (message) => this.handleRoomBroadcast(message);
    this.messageBus.subscribe(channel, callback, lastId ?? -1);
    this.#roomSubscriptions.set(roomId, callback);
  }

  #teardownRoomSubscription(roomId) {
    const callback = this.#roomSubscriptions.get(roomId);
    if (callback) {
      const channel = `/resenha/rooms/${roomId}`;
      this.messageBus.unsubscribe(channel, callback);
      this.#roomSubscriptions.delete(roomId);
    }
    this.#roomHandlers.delete(roomId);
  }

  #forwardToRoomHandlers(roomId, payload) {
    const handlers = this.#roomHandlers.get(roomId);
    if (!handlers) {
      return;
    }
    handlers.forEach((callback) => callback(payload));
  }

  addParticipant(roomId, participant) {
    if (!participant?.id) {
      return;
    }

    const room = this.#roomsById.get(roomId);
    if (!room) {
      return;
    }

    const existing = room.active_participants || [];
    if (existing.some((p) => p?.id === participant.id)) {
      return;
    }

    room.active_participants = sortParticipants([
      ...existing,
      { ...participant, is_speaking: participant.is_speaking || false },
    ]);
    this.rooms = [...this.rooms];
  }

  removeParticipant(roomId, userId) {
    const targetId = Number(userId);
    if (!targetId) {
      return;
    }

    const room = this.#roomsById.get(roomId);
    if (!room || !Array.isArray(room.active_participants)) {
      return;
    }

    const filtered = room.active_participants.filter(
      (participant) => Number(participant?.id) !== targetId
    );

    if (filtered.length === room.active_participants.length) {
      return;
    }

    room.active_participants = filtered;
    this.rooms = [...this.rooms];
  }

  setParticipantSpeaking(roomId, userId, speaking) {
    const targetId = Number(userId);
    if (!targetId) {
      return;
    }

    const room = this.#roomsById.get(roomId);
    if (!room || !Array.isArray(room.active_participants)) {
      return;
    }

    let changed = false;
    room.active_participants = room.active_participants.map((participant) => {
      const participantId = Number(participant?.id);
      if (!participantId || participantId !== targetId) {
        return participant;
      }

      if (!!participant.is_speaking === speaking) {
        return participant;
      }

      changed = true;
      return {
        ...participant,
        is_speaking: speaking,
      };
    });

    if (changed) {
      this.rooms = [...this.rooms];
    }
  }

  setParticipantMuted(roomId, userId, muted) {
    const targetId = Number(userId);
    if (!targetId) {
      return;
    }

    const room = this.#roomsById.get(roomId);
    if (!room || !Array.isArray(room.active_participants)) {
      return;
    }

    let changed = false;
    room.active_participants = room.active_participants.map((participant) => {
      const participantId = Number(participant?.id);
      if (!participantId || participantId !== targetId) {
        return participant;
      }

      if (!!participant.is_muted === muted) {
        return participant;
      }

      changed = true;
      return {
        ...participant,
        is_muted: muted,
      };
    });

    if (changed) {
      this.rooms = [...this.rooms];
    }
  }

  setParticipantIdleState(roomId, userId, idleState) {
    const targetId = Number(userId);
    if (!targetId) {
      return;
    }

    const room = this.#roomsById.get(roomId);
    if (!room || !Array.isArray(room.active_participants)) {
      return;
    }

    let changed = false;
    room.active_participants = room.active_participants.map((participant) => {
      const participantId = Number(participant?.id);
      if (!participantId || participantId !== targetId) {
        return participant;
      }

      if (participant.idle_state === idleState) {
        return participant;
      }

      changed = true;
      return {
        ...participant,
        idle_state: idleState,
      };
    });

    if (changed) {
      this.rooms = [...this.rooms];
    }
  }

  setParticipantVideoState(roomId, userId, fields) {
    const targetId = Number(userId);
    if (!targetId || !fields) {
      return;
    }

    const room = this.#roomsById.get(roomId);
    if (!room || !Array.isArray(room.active_participants)) {
      return;
    }

    let changed = false;
    room.active_participants = room.active_participants.map((participant) => {
      const participantId = Number(participant?.id);
      if (!participantId || participantId !== targetId) {
        return participant;
      }

      const unchanged = Object.entries(fields).every(
        ([key, value]) => !!participant[key] === !!value
      );
      if (unchanged) {
        return participant;
      }

      changed = true;
      return {
        ...participant,
        ...fields,
      };
    });

    if (changed) {
      this.rooms = [...this.rooms];
    }
  }

  setParticipantRole(roomId, userId, role) {
    const targetId = Number(userId);
    if (!targetId) {
      return;
    }

    const room = this.#roomsById.get(roomId);
    if (!room || !Array.isArray(room.active_participants)) {
      return;
    }

    let changed = false;
    room.active_participants = room.active_participants.map((participant) => {
      const participantId = Number(participant?.id);
      if (!participantId || participantId !== targetId) {
        return participant;
      }

      if (participant.role === role) {
        return participant;
      }

      changed = true;
      return {
        ...participant,
        role,
      };
    });

    if (changed) {
      this.rooms = [...this.rooms];
    }
  }

  setParticipantDeafened(roomId, userId, deafened) {
    const targetId = Number(userId);
    if (!targetId) {
      return;
    }

    const room = this.#roomsById.get(roomId);
    if (!room || !Array.isArray(room.active_participants)) {
      return;
    }

    let changed = false;
    room.active_participants = room.active_participants.map((participant) => {
      const participantId = Number(participant?.id);
      if (!participantId || participantId !== targetId) {
        return participant;
      }

      if (!!participant.is_deafened === deafened) {
        return participant;
      }

      changed = true;
      return {
        ...participant,
        is_deafened: deafened,
      };
    });

    if (changed) {
      this.rooms = [...this.rooms];
    }
  }

  #setRoomParticipants(roomId, participants) {
    const room = this.#roomsById.get(roomId);
    if (!room) {
      return;
    }

    const previous = room.active_participants || [];
    const stateByUserId = new Map(
      previous
        .filter((participant) => Number(participant?.id))
        .map((participant) => [
          Number(participant.id),
          {
            is_speaking: participant.is_speaking === true,
            is_muted: participant.is_muted === true,
            is_deafened: participant.is_deafened === true,
            is_video_on: participant.is_video_on === true,
            is_screen_sharing: participant.is_screen_sharing === true,
            watching_video: participant.watching_video === true,
            idle_state: participant.idle_state,
          },
        ])
    );

    const merged = (participants || []).map((participant) => {
      const participantId = Number(participant?.id);
      const previousState = stateByUserId.get(participantId);
      if (!participantId || !previousState) {
        return participant;
      }

      return {
        ...participant,
        is_speaking: previousState.is_speaking,
        is_muted: participant.is_muted ?? previousState.is_muted,
        is_deafened: participant.is_deafened ?? previousState.is_deafened,
        is_video_on: participant.is_video_on ?? previousState.is_video_on,
        is_screen_sharing:
          participant.is_screen_sharing ?? previousState.is_screen_sharing,
        watching_video:
          participant.watching_video ?? previousState.watching_video,
        idle_state: participant.idle_state ?? previousState.idle_state,
      };
    });
    room.active_participants = sortParticipants(merged);
    this.rooms = [...this.rooms];
  }
}

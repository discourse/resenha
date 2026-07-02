import Component from "@glimmer/component";
import { service } from "@ember/service";
import { block } from "discourse/blocks";
import SidebarSection from "discourse/components/sidebar/section";
import SidebarSectionLink from "discourse/components/sidebar/section-link";
import { avatarUrl } from "discourse/lib/avatar-utils";
import { prioritizeNameInUx } from "discourse/lib/settings";
import { i18n } from "discourse-i18n";

@block("resenha:rooms", {
  allowedOutlets: ["sidebar-blocks"],
})
export default class ResenhaAnonRoomsBlock extends Component {
  @service site;
  @service siteSettings;
  @service resenhaRooms;

  get show() {
    return (
      this.siteSettings.resenha_enabled &&
      this.site.resenha_public_access &&
      (this.resenhaRooms.rooms?.length || 0) > 0
    );
  }

  get links() {
    const links = [];

    for (const room of this.resenhaRooms.rooms || []) {
      links.push(new RoomLink(room));

      const participants = room.active_participants || [];

      if (room.room_type === "stage" && participants.length > 0) {
        const speakers = participants.filter((participant) => {
          const role = participant.role;
          return role === "moderator" || role === "speaker";
        });
        const listeners = participants.filter((participant) => {
          const role = participant.role;
          return role !== "moderator" && role !== "speaker";
        });

        for (const participant of speakers) {
          links.push(new ParticipantLink(room, participant));
        }

        const maxVisibleListeners = 5;
        listeners
          .slice(0, maxVisibleListeners)
          .forEach((participant, index) => {
            links.push(
              new ParticipantLink(room, participant, {
                isListener: true,
                isFirstListener: index === 0,
              })
            );
          });

        if (listeners.length > maxVisibleListeners) {
          links.push(
            new ListenerCountLink(room, listeners.length - maxVisibleListeners)
          );
        }
      } else {
        for (const participant of participants) {
          links.push(new ParticipantLink(room, participant));
        }
      }
    }

    return links;
  }

  <template>
    {{#if this.show}}
      <SidebarSection
        @sectionName="resenha-rooms"
        @headerLinkText={{i18n "resenha.sidebar.title"}}
        @headerLinkTitle={{i18n "resenha.sidebar.title"}}
        @collapsable={{true}}
      >
        {{#each this.links key="name" as |link|}}
          <SidebarSectionLink
            @linkName={{link.name}}
            @linkClass={{link.classNames}}
            @href="#"
            @title={{link.title}}
            @content={{link.content}}
            @prefixType={{link.prefixType}}
            @prefixValue={{link.prefixValue}}
          />
        {{/each}}
      </SidebarSection>
    {{/if}}
  </template>
}

class RoomLink {
  constructor(room) {
    this.room = room;
  }

  get name() {
    return `resenha-room-${this.room.id}`;
  }

  get classNames() {
    return "resenha-sidebar-link";
  }

  get title() {
    return (
      this.room.description_excerpt ||
      this.room.name ||
      i18n("resenha.room.join")
    );
  }

  get content() {
    return this.room.name;
  }

  get prefixType() {
    return "icon";
  }

  get prefixValue() {
    return this.room.room_type === "stage" ? "podcast" : "microphone-lines";
  }
}

class ParticipantLink {
  constructor(room, participant, options = {}) {
    this.room = room;
    this.participant = participant;
    this.isStageListener = options.isListener || false;
    this.isFirstListener = options.isFirstListener || false;
  }

  get name() {
    return `resenha-participant-${this.room.id}-${this.participant.id}`;
  }

  get classNames() {
    const classes = ["resenha-sidebar-participant"];

    if (this.isStageListener) {
      classes.push("resenha-sidebar-participant--listener");
    }

    if (this.isFirstListener) {
      classes.push("resenha-sidebar-participant--listeners-start");
    }

    if (this.participant.is_speaking) {
      classes.push("resenha-sidebar-participant--speaking");
    }

    if (this.participant.is_muted) {
      classes.push("resenha-sidebar-participant--muted");
    }

    if (this.participant.is_deafened) {
      classes.push("resenha-sidebar-participant--deafened");
    }

    if (this.participant.idle_state === "idle") {
      classes.push("resenha-sidebar-participant--idle");
    } else if (this.participant.idle_state === "afk") {
      classes.push("resenha-sidebar-participant--afk");
    }

    return classes.join(" ");
  }

  get displayName() {
    return prioritizeNameInUx(this.participant.name)
      ? this.participant.name
      : this.participant.username;
  }

  get title() {
    return this.displayName;
  }

  get content() {
    return this.displayName;
  }

  get prefixType() {
    return "image";
  }

  get prefixValue() {
    return avatarUrl(this.participant.avatar_template, "small");
  }
}

class ListenerCountLink {
  constructor(room, count) {
    this.room = room;
    this.count = count;
  }

  get name() {
    return `resenha-listener-count-${this.room.id}`;
  }

  get classNames() {
    return "resenha-sidebar-participant resenha-sidebar-participant--listener-count";
  }

  get title() {
    return this.content;
  }

  get content() {
    return i18n("resenha.stage.more_listeners", { count: this.count });
  }

  get prefixType() {
    return "icon";
  }

  get prefixValue() {
    return "users";
  }
}

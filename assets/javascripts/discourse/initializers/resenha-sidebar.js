import noop from "discourse/helpers/noop";
import { avatarUrl } from "discourse/lib/avatar-utils";
import { withPluginApi } from "discourse/lib/plugin-api";
import { prioritizeNameInUx } from "discourse/lib/settings";
import { i18n } from "discourse-i18n";
import ResenhaCreateRoomModal from "discourse/plugins/resenha/discourse/components/modal/resenha-create-room";
import ResenhaParticipantSidebarContextMenu from "discourse/plugins/resenha/discourse/components/resenha-participant-sidebar-context-menu";
import ResenhaRoomSidebarContextMenu from "discourse/plugins/resenha/discourse/components/resenha-room-sidebar-context-menu";
import { humanKeyName } from "../lib/resenha/ptt-utils";

const LINK_NAME_PREFIX = "resenha-room-";
const CHAT_PANEL = "chat";
let sidebarClickHandler;
let sidebarContextMenuHandler;

export default {
  name: "resenha-sidebar",
  // Chat must register its sidebar panel before we attach a section to it.
  after: "chat-sidebar",
  initialize(owner) {
    withPluginApi((api) => {
      const currentUser = api.getCurrentUser();
      const siteSettings = owner.lookup("service:site-settings");
      const site = owner.lookup("service:site");

      if (!siteSettings.resenha_enabled) {
        return;
      }

      // Anonymous visitors only see the sidebar when Resenha is open to
      // everyone. They can browse public rooms but are sent to log in on click.
      if (!currentUser && !site.resenha_public_access) {
        return;
      }

      const roomsService = owner.lookup("service:resenha-rooms");

      if (!currentUser) {
        if (sidebarClickHandler) {
          document.removeEventListener("click", sidebarClickHandler);
        }

        sidebarClickHandler = (event) => {
          const anchor =
            event
              .composedPath?.()
              ?.find?.(
                (node) =>
                  node instanceof HTMLElement &&
                  node.matches?.(
                    ".sidebar-section-link[data-link-name^='resenha-']"
                  )
              ) ||
            event.target?.closest?.(
              ".sidebar-section-link[data-link-name^='resenha-']"
            );

          if (!anchor) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          owner.lookup("route:application").send("showLogin");
        };

        document.addEventListener("click", sidebarClickHandler);
        return;
      }

      const resenhaWebrtc = owner.lookup("service:resenha-webrtc");
      const menuService = owner.lookup("service:menu");
      const modalService = owner.lookup("service:modal");
      const capabilities = owner.lookup("service:capabilities");
      const sidebarState = owner.lookup("service:sidebar-state");

      const buildRoomsSection =
        ({ sectionName, chatPanel } = {}) =>
        (BaseSection, BaseLink) => {
          const RoomsLink = class extends BaseLink {
            constructor({ room, webrtcService, user, menu }) {
              super(...arguments);
              this.room = room;
              this.resenhaWebrtc = webrtcService;
              this.currentUser = user;
              this.menuService = menu;
            }

            get hoverType() {
              return "icon";
            }

            get hoverValue() {
              if (!this.currentUser || capabilities.isIpadOS) {
                return null;
              }
              return "ellipsis-vertical";
            }

            get hoverTitle() {
              return i18n("resenha.room.menu_title");
            }

            get hoverAction() {
              if (!this.currentUser || capabilities.isIpadOS) {
                return noop;
              }

              return (event, onMenuClose) => {
                event.stopPropagation();
                event.preventDefault();

                const anchor =
                  event.target.closest(".sidebar-section-link") || event.target;

                this.menuService.show(anchor, {
                  identifier: "resenha-room-menu",
                  component: ResenhaRoomSidebarContextMenu,
                  placement: "right",
                  data: { room: this.room },
                  onClose: onMenuClose,
                });
              };
            }

            get name() {
              return `resenha-room-${this.room.id}`;
            }

            get classNames() {
              const classes = ["resenha-sidebar-link"];
              const state = this.resenhaWebrtc.connectionStateFor(this.room.id);

              if (state === "connected") {
                classes.push("sidebar-section-link--active");
              } else if (state === "connecting") {
                classes.push("resenha-sidebar-link--connecting");
              }

              return classes.join(" ");
            }

            get href() {
              return "#";
            }

            get title() {
              const state = this.resenhaWebrtc.connectionStateFor(this.room.id);

              if (state === "connecting") {
                return i18n("resenha.room.connecting");
              }

              if (state === "connected") {
                return i18n("resenha.room.leave");
              }

              return (
                this.room.description_excerpt ||
                this.room.name ||
                i18n("resenha.room.join")
              );
            }

            get text() {
              return this.room.name;
            }

            get prefixType() {
              return "icon";
            }

            get prefixValue() {
              return this.room.room_type === "stage"
                ? "podcast"
                : "microphone-lines";
            }

            get #hasActiveVideo() {
              return (this.room.active_participants || []).some(
                (participant) =>
                  participant?.is_video_on || participant?.is_screen_sharing
              );
            }

            get suffixType() {
              if (
                this.resenhaWebrtc.connectionStateFor(this.room.id) ===
                  "connecting" ||
                this.#hasActiveVideo
              ) {
                return "icon";
              }
              return null;
            }

            get suffixValue() {
              if (
                this.resenhaWebrtc.connectionStateFor(this.room.id) ===
                "connecting"
              ) {
                return "spinner";
              }
              if (this.#hasActiveVideo) {
                return "video";
              }
              return null;
            }

            getParticipantsForSummary() {
              const participants = this.room.active_participants || [];

              if (!this.currentUser) {
                return participants;
              }

              if (
                this.resenhaWebrtc.connectionStateFor(this.room.id) !==
                "connected"
              ) {
                return participants;
              }

              if (
                participants.some(
                  (participant) => participant?.id === this.currentUser.id
                )
              ) {
                return participants;
              }

              return [
                ...participants,
                {
                  id: this.currentUser.id,
                  username: this.currentUser.username,
                  name: this.currentUser.name,
                  avatar_template: this.currentUser.avatar_template,
                },
              ];
            }
          };

          const ParticipantLink = class extends BaseLink {
            constructor({
              room,
              participant,
              webrtcService,
              user,
              menu,
              canManageRoom,
              isListener,
              isFirstListener,
            }) {
              super(...arguments);
              this.room = room;
              this.participant = participant;
              this.resenhaWebrtc = webrtcService;
              this.currentUser = user;
              this.menuService = menu;
              this.canManageRoom = canManageRoom;
              this.isStageListener = isListener || false;
              this.isFirstListener = isFirstListener || false;
            }

            get #isCurrentUser() {
              return this.participant.id === this.currentUser?.id;
            }

            get #showMenu() {
              return !capabilities.isIpadOS && !!this.currentUser;
            }

            get hoverType() {
              return this.#showMenu ? "icon" : null;
            }

            get hoverValue() {
              return this.#showMenu ? "ellipsis-vertical" : null;
            }

            get hoverTitle() {
              return i18n("resenha.participant.menu_title");
            }

            get hoverAction() {
              if (!this.#showMenu) {
                return noop;
              }

              return (event, onMenuClose) => {
                event.stopPropagation();
                event.preventDefault();

                const anchor =
                  event.target.closest(".sidebar-section-link") || event.target;

                this.menuService.show(anchor, {
                  identifier: "resenha-participant-menu",
                  component: ResenhaParticipantSidebarContextMenu,
                  placement: "right",
                  data: {
                    room: this.room,
                    participant: this.participant,
                    canManageRoom: this.canManageRoom,
                    isCurrentUser: this.#isCurrentUser,
                  },
                  onClose: onMenuClose,
                });
              };
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

            get href() {
              return "#";
            }

            get #displayName() {
              return prioritizeNameInUx(this.participant.name)
                ? this.participant.name
                : this.participant.username;
            }

            get title() {
              const name = this.#displayName;
              if (this.#isCurrentUser && this.resenhaWebrtc.pttEnabled) {
                return `${name} — ${i18n("resenha.ptt.badge", { key: humanKeyName(this.resenhaWebrtc.pttKey) })}`;
              }
              return name;
            }

            get text() {
              return this.#displayName;
            }

            get suffixType() {
              if (
                this.participant.is_screen_sharing ||
                this.participant.is_video_on ||
                (this.#isCurrentUser && this.resenhaWebrtc.pttEnabled)
              ) {
                return "icon";
              }
              return null;
            }

            get suffixValue() {
              if (this.participant.is_screen_sharing) {
                return "display";
              }
              if (this.participant.is_video_on) {
                return "video";
              }
              if (this.#isCurrentUser && this.resenhaWebrtc.pttEnabled) {
                return "walkie-talkie";
              }
              return null;
            }

            get prefixType() {
              return "image";
            }

            get prefixValue() {
              return avatarUrl(this.participant.avatar_template, "small");
            }
          };

          const ListenerCountLink = class extends BaseLink {
            constructor({ room, count }) {
              super(...arguments);
              this.room = room;
              this.count = count;
            }

            get name() {
              return `resenha-listener-count-${this.room.id}`;
            }

            get classNames() {
              return "resenha-sidebar-participant resenha-sidebar-participant--listener-count";
            }

            get href() {
              return "#";
            }

            get text() {
              return i18n("resenha.stage.more_listeners", {
                count: this.count,
              });
            }

            get prefixType() {
              return "icon";
            }

            get prefixValue() {
              return "users";
            }
          };

          const RoomsSection = class extends BaseSection {
            name = sectionName;
            text = i18n("resenha.sidebar.title");
            title = i18n("resenha.sidebar.title");

            constructor() {
              super(...arguments);
              this.resenhaRooms = roomsService;
            }

            get actions() {
              if (this.resenhaRooms?.canCreateRoom) {
                return [
                  {
                    id: "createResenhaRoom",
                    title: i18n("resenha.sidebar.create"),
                    action: () => modalService.show(ResenhaCreateRoomModal),
                  },
                ];
              }
              return [];
            }

            get actionsIcon() {
              return "plus";
            }

            get displaySection() {
              // In combined mode the main-panel copy already renders; avoid a duplicate.
              if (chatPanel && sidebarState.combinedMode) {
                return false;
              }

              return (
                (this.resenhaRooms?.rooms?.length || 0) > 0 ||
                this.resenhaRooms?.canCreateRoom
              );
            }

            get links() {
              const result = [];

              for (const room of this.resenhaRooms?.rooms || []) {
                const roomLink = new RoomsLink({
                  room,
                  webrtcService: resenhaWebrtc,
                  user: currentUser,
                  menu: menuService,
                });
                result.push(roomLink);

                const canManageRoom = room.can_manage;
                const participants = roomLink.getParticipantsForSummary();

                if (room.room_type === "stage" && participants.length > 0) {
                  const speakers = participants.filter((p) => {
                    const role = p.role;
                    return role === "moderator" || role === "speaker";
                  });
                  const listeners = participants.filter((p) => {
                    const role = p.role;
                    return role !== "moderator" && role !== "speaker";
                  });

                  for (const participant of speakers) {
                    result.push(
                      new ParticipantLink({
                        room,
                        participant,
                        webrtcService: resenhaWebrtc,
                        user: currentUser,
                        menu: menuService,
                        canManageRoom,
                      })
                    );
                  }

                  const maxVisibleListeners = 5;
                  const visibleListeners = listeners.slice(
                    0,
                    maxVisibleListeners
                  );

                  visibleListeners.forEach((participant, index) => {
                    result.push(
                      new ParticipantLink({
                        room,
                        participant,
                        webrtcService: resenhaWebrtc,
                        user: currentUser,
                        menu: menuService,
                        canManageRoom,
                        isListener: true,
                        isFirstListener: index === 0,
                      })
                    );
                  });

                  if (listeners.length > maxVisibleListeners) {
                    result.push(
                      new ListenerCountLink({
                        room,
                        count: listeners.length - maxVisibleListeners,
                      })
                    );
                  }
                } else {
                  for (const participant of participants) {
                    result.push(
                      new ParticipantLink({
                        room,
                        participant,
                        webrtcService: resenhaWebrtc,
                        user: currentUser,
                        menu: menuService,
                        canManageRoom,
                      })
                    );
                  }
                }
              }

              return result;
            }
          };

          return RoomsSection;
        };

      api.addSidebarSection(
        buildRoomsSection({ sectionName: "resenha-rooms" })
      );

      // Mirror the section into the chat panel so rooms stay visible in the
      // full-screen chat separate sidebar.
      if (siteSettings.chat_enabled) {
        api.addSidebarSection(
          buildRoomsSection({
            sectionName: "resenha-rooms-chat",
            chatPanel: true,
          }),
          CHAT_PANEL
        );
      }

      if (sidebarClickHandler) {
        document.removeEventListener("click", sidebarClickHandler);
      }

      sidebarClickHandler = async (event) => {
        const findAnchor = (selector) =>
          event
            .composedPath?.()
            ?.find?.(
              (node) => node instanceof HTMLElement && node.matches?.(selector)
            ) || event.target?.closest?.(selector);

        const participantAnchor = findAnchor(
          ".sidebar-section-link[data-link-name^='resenha-participant-']"
        );

        const roomAnchor = findAnchor(
          ".sidebar-section-link[data-link-name^='resenha-room-']"
        );

        if (participantAnchor) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        if (!roomAnchor) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const linkName = roomAnchor.dataset?.linkName;
        if (!linkName?.startsWith(LINK_NAME_PREFIX)) {
          return;
        }

        const roomId = parseInt(
          linkName.substring(LINK_NAME_PREFIX.length),
          10
        );
        const room = Number.isNaN(roomId)
          ? null
          : roomsService.roomById(roomId);

        if (!room) {
          return;
        }

        const connectionState = resenhaWebrtc.connectionStateFor(room.id);

        if (connectionState === "connecting") {
          return;
        }

        if (connectionState === "connected") {
          resenhaWebrtc.leave(room);
        } else {
          await resenhaWebrtc.join(room);
        }
      };

      document.addEventListener("click", sidebarClickHandler);

      if (sidebarContextMenuHandler) {
        document.removeEventListener("contextmenu", sidebarContextMenuHandler);
      }

      sidebarContextMenuHandler = (event) => {
        const findAnchor = (selector) =>
          event
            .composedPath?.()
            ?.find?.(
              (node) => node instanceof HTMLElement && node.matches?.(selector)
            ) || event.target?.closest?.(selector);

        const participantAnchor = findAnchor(
          ".sidebar-section-link[data-link-name^='resenha-participant-']"
        );

        if (participantAnchor) {
          event.preventDefault();
          event.stopPropagation();

          const linkName = participantAnchor.dataset?.linkName;
          const suffix = linkName?.replace("resenha-participant-", "");
          const dashIdx = suffix?.indexOf("-");
          if (!suffix || dashIdx < 1) {
            return;
          }

          const roomId = parseInt(suffix.substring(0, dashIdx), 10);
          const participantId = parseInt(suffix.substring(dashIdx + 1), 10);
          const room = roomsService.roomById(roomId);
          if (!room) {
            return;
          }

          const participant = (room.active_participants || []).find(
            (p) => p.id === participantId
          );
          if (!participant) {
            return;
          }

          menuService.show(participantAnchor, {
            identifier: "resenha-participant-menu",
            component: ResenhaParticipantSidebarContextMenu,
            placement: "right",
            data: {
              room,
              participant,
              canManageRoom: room.can_manage,
              isCurrentUser: participant.id === currentUser?.id,
            },
          });
          return;
        }

        const roomAnchor = findAnchor(
          ".sidebar-section-link[data-link-name^='resenha-room-']"
        );

        if (!roomAnchor) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const linkName = roomAnchor.dataset?.linkName;
        if (!linkName?.startsWith(LINK_NAME_PREFIX)) {
          return;
        }

        const roomId = parseInt(
          linkName.substring(LINK_NAME_PREFIX.length),
          10
        );
        const room = Number.isNaN(roomId)
          ? null
          : roomsService.roomById(roomId);

        if (!room) {
          return;
        }

        menuService.show(roomAnchor, {
          identifier: "resenha-room-menu",
          component: ResenhaRoomSidebarContextMenu,
          placement: "right",
          data: { room },
        });
      };

      document.addEventListener("contextmenu", sidebarContextMenuHandler);
    });
  },
};

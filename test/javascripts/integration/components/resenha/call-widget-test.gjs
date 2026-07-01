import { tracked } from "@glimmer/tracking";
import Service from "@ember/service";
import { render, settled } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";
import { logIn } from "discourse/tests/helpers/qunit-helpers";
import ResenhaCallWidget from "discourse/plugins/resenha/discourse/components/resenha/call-widget";

class ResenhaRoomsStub extends Service {
  @tracked rooms = [];

  roomById(id) {
    return this.rooms.find((room) => Number(room.id) === Number(id));
  }

  setParticipants(roomId, participants) {
    this.rooms = this.rooms.map((room) => {
      if (Number(room.id) !== Number(roomId)) {
        return room;
      }

      return { ...room, active_participants: participants };
    });
  }
}

class ResenhaWebrtcStub extends Service {
  @tracked activeRoomId = 1;
  @tracked audioEnabled = true;
  @tracked deafened = false;
  @tracked localVideoKind = null;
  @tracked pttEnabled = false;

  screenShareSupported = false;
  watchingCalls = [];
  videoStreams = new Map();

  get activeRoom() {
    return this.resenhaRooms.roomById(this.activeRoomId);
  }

  videoAllowedIn() {
    return true;
  }

  canPublishVideo() {
    return true;
  }

  remoteStreamFor(roomId, userId) {
    return this.videoStreams.get(`${roomId}:${userId}`);
  }

  setWatching(roomId, watching, options = {}) {
    this.watchingCalls.push({ roomId, watching, options });
  }

  attachVideoStream() {}
  toggleMute() {}
  toggleDeafen() {}
  toggleCamera() {}
  toggleScreenShare() {}
  leave() {}
}

class RouterStub extends Service {
  @tracked currentURL = "/latest";
  @tracked currentRoute = null;

  transitionTo() {}
}

module("Integration | Component | resenha/call-widget", function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.currentUser = logIn(this.owner);

    this.owner.unregister("service:resenha-rooms");
    this.owner.register("service:resenha-rooms", ResenhaRoomsStub);
    this.owner.unregister("service:resenha-webrtc");
    this.owner.register("service:resenha-webrtc", ResenhaWebrtcStub);
    this.owner.unregister("service:router");
    this.owner.register("service:router", RouterStub);

    this.resenhaRooms = this.owner.lookup("service:resenha-rooms");
    this.resenhaWebrtc = this.owner.lookup("service:resenha-webrtc");
    this.resenhaWebrtc.resenhaRooms = this.resenhaRooms;

    this.resenhaRooms.rooms = [
      {
        id: 1,
        slug: "test-room",
        name: "Test Room",
        video_enabled: true,
        active_participants: [
          {
            id: this.currentUser.id,
            username: this.currentUser.username,
            avatar_template: "/letter_avatar_proxy/v4/letter/a/{size}.png",
          },
        ],
      },
    ];
  });

  test("keeps video watching and participant tiles live in widget mode", async function (assert) {
    this.set("renderWidget", true);
    await render(
      <template>
        {{#if this.renderWidget}}
          <ResenhaCallWidget />
        {{/if}}
      </template>
    );

    assert.deepEqual(
      this.resenhaWebrtc.watchingCalls.at(-1),
      { roomId: 1, watching: true, options: {} },
      "marks the room watched while the widget is visible"
    );

    this.resenhaWebrtc.videoStreams.set("1:2", { id: "bob-video" });
    this.resenhaRooms.setParticipants(1, [
      ...this.resenhaRooms.roomById(1).active_participants,
      {
        id: 2,
        username: "bob",
        avatar_template: "/letter_avatar_proxy/v4/letter/b/{size}.png",
        is_video_on: true,
      },
    ]);
    await settled();

    assert
      .dom(".resenha-call-widget .resenha-video-tile[data-user-id='2']")
      .exists("adds a participant tile while the widget is docked");
    assert
      .dom(
        ".resenha-call-widget .resenha-video-tile[data-user-id='2'] video.resenha-video-tile__video"
      )
      .exists("renders the live remote video element in the widget");

    this.resenhaRooms.setParticipants(1, [
      this.resenhaRooms.roomById(1).active_participants[0],
    ]);
    await settled();

    assert
      .dom(".resenha-call-widget .resenha-video-tile[data-user-id='2']")
      .doesNotExist("removes the participant tile while the widget is docked");

    this.set("renderWidget", false);
    await settled();

    assert.deepEqual(
      this.resenhaWebrtc.watchingCalls.at(-1),
      { roomId: 1, watching: false, options: { keepVideo: true } },
      "clears the widget watch state when the widget is removed"
    );
  });

  test("hides on the room's own page even when the URL carries extra query params", async function (assert) {
    const router = this.owner.lookup("service:router");

    await render(<template><ResenhaCallWidget /></template>);
    assert.dom(".resenha-call-widget").exists("shows while docked elsewhere");

    router.currentRoute = {
      name: "resenha-room",
      params: { slug: "test-room" },
      queryParams: { chat: "true" },
    };
    await settled();

    assert
      .dom(".resenha-call-widget")
      .doesNotExist("hides on the room's own page, regardless of query params");

    router.currentRoute = { name: "discovery.latest", params: {} };
    await settled();

    assert
      .dom(".resenha-call-widget")
      .exists("shows again once navigated away from the room page");
  });
});

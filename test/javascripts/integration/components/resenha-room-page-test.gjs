import { tracked } from "@glimmer/tracking";
import Service from "@ember/service";
import { click, render } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";
import { logIn } from "discourse/tests/helpers/qunit-helpers";
import ResenhaRoomPage from "discourse/plugins/resenha/discourse/components/resenha/room-page";

class ResenhaRoomsStub extends Service {
  @tracked rooms = [];

  roomById(id) {
    return this.rooms.find((room) => Number(room.id) === Number(id));
  }
}

class ResenhaWebrtcStub extends Service {
  @tracked activeRoomId = 1;
  @tracked audioEnabled = true;
  @tracked deafened = false;
  @tracked localVideoKind = null;
  @tracked pttEnabled = false;

  screenShareSupported = true;

  get activeRoom() {
    return this.resenhaRooms.roomById(this.activeRoomId);
  }

  connectionStateFor() {
    return "connected";
  }

  videoAllowedIn() {
    return true;
  }

  canPublishVideo() {
    return true;
  }

  isActiveRoom() {
    return false;
  }

  setWatching() {}
  join() {}
  leave() {}
  toggleMute() {}
  toggleDeafen() {}
  toggleCamera() {}
  toggleScreenShare() {}
  attachVideoStream() {}
  remoteStreamFor() {
    return { id: "stream" };
  }
}

class RouterStub extends Service {
  transitionTo() {}
}

class ModalStub extends Service {
  show() {}
}

class CapabilitiesStub extends Service {
  viewport = { md: true };
  touch = false;
}

module("Integration | Component | resenha/room-page", function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.currentUser = logIn(this.owner);

    this.owner.unregister("service:capabilities");
    this.owner.register("service:capabilities", CapabilitiesStub);
    this.owner.unregister("service:resenha-rooms");
    this.owner.register("service:resenha-rooms", ResenhaRoomsStub);
    this.owner.unregister("service:resenha-webrtc");
    this.owner.register("service:resenha-webrtc", ResenhaWebrtcStub);
    this.owner.unregister("service:router");
    this.owner.register("service:router", RouterStub);
    this.owner.unregister("service:modal");
    this.owner.register("service:modal", ModalStub);

    this.resenhaRooms = this.owner.lookup("service:resenha-rooms");
    this.resenhaWebrtc = this.owner.lookup("service:resenha-webrtc");
    this.resenhaWebrtc.resenhaRooms = this.resenhaRooms;

    this.room = {
      id: 1,
      slug: "test-room",
      name: "Test Room",
      chat_available: true,
      video_enabled: true,
      description_excerpt: "Room description",
      active_participants: [
        {
          id: this.currentUser.id,
          username: this.currentUser.username,
          avatar_template: "/letter_avatar_proxy/v4/letter/a/{size}.png",
        },
        {
          id: 2,
          username: "bob",
          avatar_template: "/letter_avatar_proxy/v4/letter/b/{size}.png",
          is_video_on: true,
        },
        {
          id: 3,
          username: "cara",
          avatar_template: "/letter_avatar_proxy/v4/letter/c/{size}.png",
          is_video_on: true,
        },
      ],
    };

    this.resenhaRooms.rooms = [this.room];
  });

  test("switches between presentation and tiled layouts from the menu", async function (assert) {
    await render(<template><ResenhaRoomPage @room={{this.room}} /></template>);

    assert
      .dom(".resenha-room-page")
      .hasClass("--presentation", "defaults to presentation layout");
    assert
      .dom(".resenha-room-page__presentation")
      .exists("renders the presentation stage");

    await click(".resenha-room-page__layout-trigger");
    await click(
      '[role="dialog"] button[title="Tiled layout"], .resenha-room-page__layout-content button[title="Tiled layout"]'
    );

    assert
      .dom(".resenha-room-page")
      .hasClass("--tiled", "switches to tiled layout");
    assert
      .dom(".resenha-room-page__grid")
      .exists("renders the tiled grid after switching");

    await click(".resenha-room-page__layout-trigger");
    await click(
      '[role="dialog"] button[title="Presentation layout"], .resenha-room-page__layout-content button[title="Presentation layout"]'
    );

    assert
      .dom(".resenha-room-page")
      .hasClass("--presentation", "switches back to presentation layout");
  });
});

import { tracked } from "@glimmer/tracking";
import Service from "@ember/service";
import {
  click,
  render,
  settled,
  triggerEvent,
  waitUntil,
} from "@ember/test-helpers";
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

  isParticipantSpeaking() {
    return false;
  }
}

class ResenhaWebrtcStub extends Service {
  @tracked activeRoomId = 1;
  @tracked audioEnabled = true;
  @tracked callWidgetHidden = false;
  @tracked deafened = false;
  @tracked localVideoKind = null;
  @tracked pttEnabled = false;

  screenShareSupported = false;
  watchingCalls = [];
  videoStreams = new Map();
  leaveCalls = [];

  get activeRoom() {
    return this.resenhaRooms.roomById(this.activeRoomId);
  }

  videoAllowedIn() {
    return true;
  }

  canPublishVideo() {
    return true;
  }

  connectionStateFor() {
    return "connected";
  }

  isTranscribingRoom() {
    return false;
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
  leave(room) {
    this.leaveCalls.push(room);
  }
}

class RouterStub extends Service {
  @tracked currentURL = "/latest";
  @tracked currentRoute = null;

  transitionTo() {}
}

class ResenhaPipStub extends Service {
  @tracked pipWindow = null;
  @tracked supported = false;

  openCalls = 0;
  closeCalls = 0;

  get active() {
    return !!this.pipWindow;
  }

  get pipBody() {
    return this.pipWindow?.document.body ?? null;
  }

  open() {
    this.openCalls++;
  }

  close() {
    this.closeCalls++;
  }

  enableAutoPip() {}
  disableAutoPip() {}
}

module("Integration | Component | resenha/call-widget", function (hooks) {
  setupRenderingTest(hooks);

  // Laying the widget out in a foreign document (the pip test's iframe)
  // trips Chrome's benign "ResizeObserver loop completed with undelivered
  // notifications" report, which testem's global error hook turns into a
  // failure — and it can land a frame after the test that caused it, so the
  // filter has to cover the whole module.
  let originalOnError;

  hooks.before(function () {
    originalOnError = window.onerror;
    window.onerror = (message, ...args) => {
      if (String(message).includes("ResizeObserver loop")) {
        return true;
      }
      return originalOnError?.(message, ...args);
    };
  });

  hooks.after(function () {
    window.onerror = originalOnError;
  });

  hooks.beforeEach(function () {
    this.currentUser = logIn(this.owner);

    this.owner.unregister("service:resenha-rooms");
    this.owner.register("service:resenha-rooms", ResenhaRoomsStub);
    this.owner.unregister("service:resenha-webrtc");
    this.owner.register("service:resenha-webrtc", ResenhaWebrtcStub);
    this.owner.unregister("service:router");
    this.owner.register("service:router", RouterStub);
    this.owner.unregister("service:resenha-pip");
    this.owner.register("service:resenha-pip", ResenhaPipStub);

    this.resenhaPip = this.owner.lookup("service:resenha-pip");
    this.resenhaRooms = this.owner.lookup("service:resenha-rooms");
    this.resenhaWebrtc = this.owner.lookup("service:resenha-webrtc");
    this.resenhaWebrtc.resenhaRooms = this.resenhaRooms;

    this.resenhaRooms.rooms = [
      {
        id: 1,
        slug: "test-room",
        name: "Test Room",
        video_enabled: true,
        // Makes the chat button eligible, so the extra-minimized test's exact
        // control count guards against it leaking into that mode.
        chat_available: true,
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

  test("stays hidden while the user has hidden the call widget", async function (assert) {
    await render(<template><ResenhaCallWidget /></template>);
    assert.dom(".resenha-call-widget").exists("shows by default");

    this.resenhaWebrtc.callWidgetHidden = true;
    await settled();

    assert
      .dom(".resenha-call-widget")
      .doesNotExist("hides while the preference is on");

    this.resenhaWebrtc.callWidgetHidden = false;
    await settled();

    assert
      .dom(".resenha-call-widget")
      .exists("shows again once the preference is turned off");
  });

  test("collapses a crowd into a +N overflow tile", async function (assert) {
    // A small persisted size makes the solver's slot count independent of the
    // test viewport.
    this.owner.lookup("service:key-value-store").set({
      key: "resenha-widget-size",
      value: JSON.stringify({ width: 320, height: 220 }),
    });

    const fakes = Array.from({ length: 11 }, (_, i) => {
      const letter = String.fromCharCode(97 + i);
      return {
        id: 100 + i,
        username: `user_${letter}`,
        avatar_template: `/letter_avatar_proxy/v4/letter/${letter}/{size}.png`,
      };
    });
    this.resenhaRooms.setParticipants(1, [
      ...this.resenhaRooms.roomById(1).active_participants,
      ...fakes,
    ]);

    await render(<template><ResenhaCallWidget /></template>);
    await waitUntil(() =>
      document.querySelector(".resenha-call-widget__overflow-tile")
    );

    const tileCount = document.querySelectorAll(
      ".resenha-call-widget .resenha-video-tile"
    ).length;
    const hidden = parseInt(
      document
        .querySelector(".resenha-call-widget__overflow-count")
        .textContent.trim()
        .replace("+", ""),
      10
    );

    assert.true(tileCount < 12, "hides part of the crowd");
    assert.true(hidden >= 2, "the overflow tile absorbs at least two people");
    assert.strictEqual(
      tileCount + hidden,
      12,
      "every participant is either a tile or counted"
    );
    assert
      .dom(".resenha-call-widget__overflow-avatars img")
      .exists("previews hidden participants' avatars");
  });

  test("keeps camera publishers out of the overflow", async function (assert) {
    this.owner.lookup("service:key-value-store").set({
      key: "resenha-widget-size",
      value: JSON.stringify({ width: 320, height: 220 }),
    });

    const fakes = Array.from({ length: 9 }, (_, i) => {
      const letter = String.fromCharCode(97 + i);
      return {
        id: 100 + i,
        username: `user_${letter}`,
        avatar_template: `/letter_avatar_proxy/v4/letter/${letter}/{size}.png`,
      };
    });
    this.resenhaWebrtc.videoStreams.set("1:300", { id: "zed-video" });
    this.resenhaRooms.setParticipants(1, [
      ...this.resenhaRooms.roomById(1).active_participants,
      ...fakes,
      {
        id: 300,
        username: "zed",
        avatar_template: "/letter_avatar_proxy/v4/letter/z/{size}.png",
        is_video_on: true,
      },
    ]);

    await render(<template><ResenhaCallWidget /></template>);
    await waitUntil(() =>
      document.querySelector(".resenha-call-widget__overflow-tile")
    );

    assert
      .dom(
        ".resenha-call-widget .resenha-video-tile[data-user-id='300'] video.resenha-video-tile__video"
      )
      .exists("the camera publisher is promoted out of the overflow tail");
    assert
      .dom(".resenha-call-widget .resenha-video-tile[data-user-id='100']")
      .doesNotExist("an avatar-only participant yields the slot");
  });

  test("shows everyone without an overflow tile when they fit", async function (assert) {
    const fakes = Array.from({ length: 3 }, (_, i) => {
      const letter = String.fromCharCode(97 + i);
      return {
        id: 100 + i,
        username: `user_${letter}`,
        avatar_template: `/letter_avatar_proxy/v4/letter/${letter}/{size}.png`,
      };
    });
    this.resenhaRooms.setParticipants(1, [
      ...this.resenhaRooms.roomById(1).active_participants,
      ...fakes,
    ]);

    await render(<template><ResenhaCallWidget /></template>);
    await waitUntil(
      () =>
        document.querySelectorAll(".resenha-call-widget .resenha-video-tile")
          .length === 4
    );

    assert
      .dom(".resenha-call-widget .resenha-video-tile")
      .exists({ count: 4 }, "renders a tile per participant");
    assert
      .dom(".resenha-call-widget__overflow-tile")
      .doesNotExist("no overflow tile when everyone fits");
  });

  test("pip mode fills the window and drops the floating chrome", async function (assert) {
    // The gates that normally suppress the widget don't apply in the pip
    // window: it covers for the tab itself.
    this.owner.lookup("service:router").currentRoute = {
      name: "resenha-room",
      params: { slug: "test-room" },
    };
    this.resenhaWebrtc.callWidgetHidden = true;
    this.resenhaPip.supported = true;

    await render(<template><ResenhaCallWidget @pipMode={{true}} /></template>);

    assert
      .dom(".resenha-call-widget")
      .exists("renders even on the room page with the widget hidden")
      .hasClass("--pip");
    assert.strictEqual(
      document.querySelector(".resenha-call-widget").getAttribute("style"),
      null,
      "no floating geometry"
    );
    assert
      .dom(".resenha-call-widget__resize")
      .doesNotExist("no resize corners");
    assert
      .dom("[data-identifier='resenha-widget-room-menu']")
      .doesNotExist("no portal-based room menu");
    assert
      .dom(".resenha-call-widget__pip")
      .doesNotExist("no pip button inside the pip window");
    assert
      .dom(".resenha-call-widget__open-room")
      .doesNotExist(
        "no expand button in pip — the window chrome covers returning"
      );
  });

  test("offers picture-in-picture only when the service supports it", async function (assert) {
    await render(<template><ResenhaCallWidget /></template>);

    assert
      .dom(".resenha-call-widget__pip")
      .doesNotExist("hidden while unsupported");
    assert
      .dom("[data-identifier='resenha-widget-room-menu']")
      .exists("the room menu renders normally outside pip");

    this.resenhaPip.supported = true;
    await settled();

    assert.dom(".resenha-call-widget__pip").exists();

    await click(".resenha-call-widget__pip");
    assert.strictEqual(
      this.resenhaPip.openCalls,
      1,
      "clicking asks the service to open the pip window"
    );
  });

  test("renders into a foreign document in pip mode", async function (assert) {
    const iframe = document.createElement("iframe");
    iframe.style.width = "400px";
    iframe.style.height = "300px";
    document.getElementById("ember-testing").appendChild(iframe);

    // The real pip window gets the site's compiled CSS (pip-window.js);
    // mirror the pieces the grid measurement depends on — without
    // `contain: size` the ResizeObserver feeds back on itself.
    const style = iframe.contentDocument.createElement("style");
    style.textContent = `
      body { margin: 0; }
      .resenha-call-widget { display: flex; flex-direction: column; height: 100vh; }
      .resenha-call-widget__tiles { flex: 1; min-height: 0; contain: size; display: flex; flex-wrap: wrap; overflow: hidden; }
    `;
    iframe.contentDocument.head.appendChild(style);

    const pipBody = iframe.contentDocument.body;
    this.set("pipBody", pipBody);

    try {
      await render(
        <template>
          {{#in-element this.pipBody}}
            <ResenhaCallWidget @pipMode={{true}} />
          {{/in-element}}
        </template>
      );

      assert.true(
        !!pipBody.querySelector(".resenha-call-widget.--pip"),
        "the widget renders inside the foreign document"
      );
      assert.true(
        !!pipBody.querySelector(".resenha-video-tile"),
        "participant tiles render across documents"
      );
      assert.deepEqual(
        this.resenhaWebrtc.watchingCalls.at(-1),
        { roomId: 1, watching: true, options: {} },
        "the pip widget keeps the room watched"
      );
    } finally {
      iframe.remove();
    }
  });

  test("resizing below the widget threshold enters extra minimized mode", async function (assert) {
    await render(<template><ResenhaCallWidget /></template>);

    const widget = document.querySelector(".resenha-call-widget");
    widget.getBoundingClientRect = () => ({
      left: 100,
      top: 100,
      right: 500,
      bottom: 340,
      width: 400,
      height: 240,
    });

    await triggerEvent(".resenha-call-widget__resize.--se", "mousedown", {
      button: 0,
      clientX: 500,
      clientY: 340,
    });
    await triggerEvent(window, "mousemove", {
      clientX: 250,
      clientY: 220,
    });
    await triggerEvent(window, "mouseup");

    assert
      .dom(".resenha-call-widget")
      .hasClass(
        "--extra-minimized",
        "marks the widget as extra minimized after crossing the resize threshold"
      );
    assert
      .dom(".resenha-call-widget__tiles")
      .doesNotExist("hides participant tiles in extra minimized mode");
    assert
      .dom(".resenha-call-widget__controls button")
      .exists({ count: 2 }, "only renders expand and leave controls");
    assert.false(
      /inset-inline-start|inset-block-start/.test(
        document.querySelector(".resenha-call-widget").getAttribute("style") ??
          ""
      ),
      "keeps the extra minimized widget pinned to the bottom-right corner"
    );

    await click(".resenha-call-widget__expand");

    assert
      .dom(".resenha-call-widget")
      .doesNotHaveClass(
        "--extra-minimized",
        "expands back to the default widget dimensions"
      );
    assert
      .dom(".resenha-call-widget__tiles")
      .exists("restores the default widget content");
    assert.false(
      /inset-inline-start|inset-block-start/.test(
        document.querySelector(".resenha-call-widget").getAttribute("style") ??
          ""
      ),
      "expands from the bottom-right corner instead of the old resize position"
    );
  });
});

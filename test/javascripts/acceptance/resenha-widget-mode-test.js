import { getOwner } from "@ember/owner";
import { currentURL, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

const ROOM = {
  id: 1,
  name: "Sala do Bar",
  slug: "sala-do-bar",
  public: true,
  room_type: "open",
  active_participants: [],
};

function stubRooms(needs) {
  needs.settings({ resenha_enabled: true });
  needs.pretender((server, helper) => {
    server.get("/resenha/rooms.json", () =>
      helper.response({ rooms: [ROOM], can_create_room: false })
    );
    server.get(`/resenha/rooms/${ROOM.slug}.json`, () =>
      helper.response({ room: ROOM })
    );
  });
}

function stubJoin(context) {
  const joined = [];
  const resenhaWebrtc = getOwner(context).lookup("service:resenha-webrtc");
  resenhaWebrtc.join = (room) => {
    joined.push(room.slug);
    return Promise.resolve();
  };
  return { joined, resenhaWebrtc };
}

acceptance("Resenha room widget mode", function (needs) {
  needs.user();
  stubRooms(needs);

  test("joins the room without leaving the current page", async function (assert) {
    await visit("/latest");
    const { joined } = stubJoin(this);

    try {
      await visit(`/resenha/r/${ROOM.slug}?widget=true`);
    } catch (error) {
      assert.strictEqual(
        error.message,
        "TransitionAborted",
        "it aborts the transition"
      );
    }

    assert.strictEqual(currentURL(), "/latest", "stays where the user was");
    assert.deepEqual(joined, [ROOM.slug], "joins the room in the background");
  });

  test("lands on the homepage when opened from a full page load", async function (assert) {
    const { joined } = stubJoin(this);

    await visit(`/resenha/r/${ROOM.slug}?widget=true`);

    assert.strictEqual(currentURL(), "/latest", "does not open the room page");
    assert.deepEqual(joined, [ROOM.slug], "joins the room in the background");
  });

  test("accepts a valueless param", async function (assert) {
    const { joined } = stubJoin(this);

    await visit(`/resenha/r/${ROOM.slug}?widget`);

    assert.strictEqual(currentURL(), "/latest", "does not open the room page");
    assert.deepEqual(joined, [ROOM.slug], "joins the room in the background");
  });

  test("ignores an explicitly falsy param", async function (assert) {
    const { joined } = stubJoin(this);

    await visit(`/resenha/r/${ROOM.slug}?widget=false`);

    assert.strictEqual(
      currentURL(),
      `/resenha/r/${ROOM.slug}?widget=false`,
      "opens the room page"
    );
    assert.deepEqual(joined, [], "does not join");
  });

  test("shows a widget the user had dismissed", async function (assert) {
    const { resenhaWebrtc } = stubJoin(this);
    resenhaWebrtc.setCallWidgetHidden(true);

    await visit(`/resenha/r/${ROOM.slug}?widget=true`);

    assert.false(
      resenhaWebrtc.callWidgetHidden,
      "the call widget is no longer hidden"
    );
  });

  test("opens the room page when the param is absent", async function (assert) {
    const { joined } = stubJoin(this);

    await visit(`/resenha/r/${ROOM.slug}`);

    assert.strictEqual(currentURL(), `/resenha/r/${ROOM.slug}`);
    assert.deepEqual(joined, [], "does not join without being asked to");
  });
});

acceptance("Resenha room widget mode - anonymous", function (needs) {
  stubRooms(needs);
  needs.site({ resenha_public_access: true });

  test("ignores the param, since anonymous visitors cannot join", async function (assert) {
    await visit(`/resenha/r/${ROOM.slug}?widget=true`);

    assert.strictEqual(
      currentURL(),
      `/resenha/r/${ROOM.slug}?widget=true`,
      "opens the room page"
    );
  });
});

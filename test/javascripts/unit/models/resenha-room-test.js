import { module, test } from "qunit";
import ResenhaRoom from "discourse/plugins/resenha/admin/models/resenha-room";

module("Unit | model | resenha-room", function () {
  const attrs = () => ({
    name: "Team Meeting",
    description: "Recurring sync",
    public: true,
    max_participants: 20,
    video_enabled: true,
    chat_channel_id: 6,
    chat_idle_minutes: 2,
    chat_thread_title_template: "Team meeting at {time} on {date}",
  });

  test("createProperties includes the chat settings fields", function (assert) {
    const room = ResenhaRoom.create(attrs());

    assert.deepEqual(room.createProperties(), attrs());
  });

  test("updateProperties includes the chat settings fields", function (assert) {
    const room = ResenhaRoom.create(attrs());

    assert.deepEqual(room.updateProperties(), attrs());
  });

  test("updateProperties sends an explicit null for a cleared chat channel", function (assert) {
    // FormKit's select control reports `undefined` for its "None" option.
    // JSON.stringify (used by this model's adapter) silently drops
    // `undefined`-valued keys, so the clear would never reach the server
    // unless it's normalized to `null` first.
    const room = ResenhaRoom.create({ ...attrs(), chat_channel_id: undefined });

    const saved = room.updateProperties();

    assert.strictEqual(saved.chat_channel_id, null);
    assert.true(
      Object.prototype.hasOwnProperty.call(saved, "chat_channel_id"),
      "the key survives JSON.stringify instead of being dropped"
    );
    assert.strictEqual(
      JSON.parse(JSON.stringify(saved)).chat_channel_id,
      null,
      "round-trips through JSON as an explicit null"
    );
  });
});

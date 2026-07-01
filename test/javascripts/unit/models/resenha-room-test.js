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
});

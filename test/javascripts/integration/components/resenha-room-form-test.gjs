import Service from "@ember/service";
import { find, render } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";
import formKit from "discourse/tests/helpers/form-kit-helper";
import ResenhaRoomForm from "discourse/plugins/resenha/discourse/components/resenha-room-form";

class ChatApiStub extends Service {
  channels() {
    return {
      items: [{ id: 6, title: "Team Meeting", threadingEnabled: true }],
      async load() {},
    };
  }
}

module("Integration | Component | resenha-room-form", function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.siteSettings.chat_enabled = true;
    this.siteSettings.resenha_chat_enabled = true;
    this.siteSettings.resenha_video_enabled = false;

    this.owner.unregister("service:chat-api");
    this.owner.register("service:chat-api", ChatApiStub);
  });

  test("shows the thread starter fields for a room that already has a chat channel linked", async function (assert) {
    this.room = {
      name: "Team Meeting",
      description: "",
      public: true,
      room_type: "open",
      max_participants: null,
      video_enabled: true,
      chat_channel_id: 6,
      chat_idle_minutes: 2,
      chat_thread_title_template: "Team meeting at {time} on {date}",
    };

    await render(<template><ResenhaRoomForm @room={{this.room}} /></template>);

    assert.dom('select[name="chat_channel_id"]').hasValue("6");
    assert
      .dom('input[name="chat_idle_minutes"]')
      .exists("the idle-minutes field is shown once a channel is linked");
    assert
      .dom('input[name="chat_thread_title_template"]')
      .exists("the thread-starter template field is shown");
    assert
      .dom('input[name="chat_thread_title_template"]')
      .hasValue("Team meeting at {time} on {date}");
  });

  test("can clear a linked chat channel back to none", async function (assert) {
    this.room = {
      name: "Team Meeting",
      description: "",
      public: true,
      room_type: "open",
      max_participants: null,
      video_enabled: true,
      chat_channel_id: 6,
      chat_idle_minutes: 2,
      chat_thread_title_template: "Team meeting at {time} on {date}",
    };

    await render(<template><ResenhaRoomForm @room={{this.room}} /></template>);
    assert.dom('input[name="chat_idle_minutes"]').exists();

    await formKit().field("chat_channel_id").select("__NONE__");

    assert.dom('select[name="chat_channel_id"]').hasValue("__NONE__");
    assert.notOk(
      find('input[name="chat_idle_minutes"]'),
      "idle-minutes field hides once the channel is cleared"
    );
    assert.notOk(
      find('input[name="chat_thread_title_template"]'),
      "thread-starter field hides once the channel is cleared"
    );
  });

  test("hides the thread starter fields when no chat channel is linked", async function (assert) {
    this.room = {
      name: "Chill",
      description: "",
      public: true,
      room_type: "open",
      max_participants: null,
      video_enabled: true,
      chat_channel_id: null,
      chat_idle_minutes: 15,
      chat_thread_title_template: "",
    };

    await render(<template><ResenhaRoomForm @room={{this.room}} /></template>);

    assert.notOk(find('input[name="chat_idle_minutes"]'));
    assert.notOk(find('input[name="chat_thread_title_template"]'));
  });
});

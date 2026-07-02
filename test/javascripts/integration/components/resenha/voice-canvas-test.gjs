import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import Service from "@ember/service";
import { render, settled } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";
import ResenhaVoiceCanvas from "discourse/plugins/resenha/discourse/components/resenha/voice-canvas";

class ResenhaWebrtcStub extends Service {
  @tracked localStream = null;
  @tracked remoteStreams = [];
  @tracked remoteScreenAudioStreams = [];
  attachCalls = [];

  @action
  attachStream(stream, element) {
    this.attachCalls.push({ stream, element });
  }
}

module("Integration | Component | resenha/voice-canvas", function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.unregister("service:resenha-webrtc");
    this.owner.register("service:resenha-webrtc", ResenhaWebrtcStub);
    this.resenhaWebrtc = this.owner.lookup("service:resenha-webrtc");
  });

  test("re-attaches a remote stream when the object changes but the id stays the same", async function (assert) {
    const firstStream = { id: "peer-stream" };
    const secondStream = { id: "peer-stream" };

    this.resenhaWebrtc.remoteStreams = [firstStream];

    await render(<template><ResenhaVoiceCanvas /></template>);

    assert.strictEqual(this.resenhaWebrtc.attachCalls.length, 1);
    assert.strictEqual(this.resenhaWebrtc.attachCalls[0].stream, firstStream);

    const element = this.resenhaWebrtc.attachCalls[0].element;

    this.resenhaWebrtc.remoteStreams = [secondStream];
    await settled();

    assert.strictEqual(this.resenhaWebrtc.attachCalls.length, 2);
    assert.strictEqual(this.resenhaWebrtc.attachCalls[1].stream, secondStream);
    assert.strictEqual(this.resenhaWebrtc.attachCalls[1].element, element);
  });

  test("renders a dedicated sink for each remote screen audio stream", async function (assert) {
    const voiceStream = { id: "voice-stream" };
    const screenAudioStream = { id: "screen-audio-stream" };

    this.resenhaWebrtc.remoteStreams = [voiceStream];

    await render(<template><ResenhaVoiceCanvas /></template>);

    assert.strictEqual(this.resenhaWebrtc.attachCalls.length, 1);

    this.resenhaWebrtc.remoteScreenAudioStreams = [screenAudioStream];
    await settled();

    assert.strictEqual(this.resenhaWebrtc.attachCalls.length, 2);
    assert.strictEqual(
      this.resenhaWebrtc.attachCalls[1].stream,
      screenAudioStream
    );
    assert
      .dom(".resenha-voice-canvas audio")
      .exists({ count: 2 }, "keeps the voice sink alongside the screen sink");
  });
});

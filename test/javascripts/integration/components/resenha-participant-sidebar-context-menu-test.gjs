import Service from "@ember/service";
import { click, render } from "@ember/test-helpers";
import { module, test } from "qunit";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";
import { logIn } from "discourse/tests/helpers/qunit-helpers";
import ResenhaParticipantSidebarContextMenu from "discourse/plugins/resenha/discourse/components/resenha-participant-sidebar-context-menu";

class ResenhaWebrtcStub extends Service {
  getParticipantVolume() {
    return 1;
  }

  isParticipantMuted() {
    return false;
  }
}

module(
  "Integration | Component | ResenhaParticipantSidebarContextMenu",
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      logIn(this.owner);
      this.owner.unregister("service:resenha-webrtc");
      this.owner.register("service:resenha-webrtc", ResenhaWebrtcStub);

      this.selectedParticipantId = null;
      this.closed = false;
      this.menuData = {
        room: { id: 1, room_type: "open" },
        participant: { id: 2, username: "bob" },
        isCurrentUser: false,
        onSpotlight: (participantId) => {
          this.selectedParticipantId = participantId;
        },
      };
      this.closeMenu = () => {
        this.closed = true;
      };
    });

    test("spotlights the participant for the viewer", async function (assert) {
      await render(
        <template>
          <ResenhaParticipantSidebarContextMenu
            @data={{this.menuData}}
            @close={{this.closeMenu}}
          />
        </template>
      );

      assert
        .dom(".resenha-participant-sidebar-context-menu__spotlight-btn")
        .hasText("Spotlight for me", "offers the local spotlight action");

      await click(".resenha-participant-sidebar-context-menu__spotlight-btn");

      assert.strictEqual(
        this.selectedParticipantId,
        2,
        "selects the menu's participant"
      );
      assert.true(this.closed, "closes the participant menu");
    });

    test("shows when the participant is already spotlighted", async function (assert) {
      this.menuData.isSpotlighted = true;

      await render(
        <template>
          <ResenhaParticipantSidebarContextMenu
            @data={{this.menuData}}
            @close={{this.closeMenu}}
          />
        </template>
      );

      assert
        .dom(".resenha-participant-sidebar-context-menu__spotlight-btn")
        .hasText("Remove from spotlight", "offers to remove the spotlight")
        .hasAttribute("aria-pressed", "true", "exposes the active state");
    });
  }
);

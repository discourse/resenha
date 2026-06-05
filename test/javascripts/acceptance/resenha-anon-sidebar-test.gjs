import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("Resenha anon sidebar", function (needs) {
  needs.settings({ resenha_enabled: true });
  needs.site({ resenha_public_access: true });

  needs.pretender((server, helper) => {
    server.get("/resenha/rooms.json", () =>
      helper.response({
        rooms: [
          {
            id: 1,
            name: "Public room",
            slug: "public-room",
            public: true,
            room_type: "open",
            active_participants: [
              {
                id: 2,
                username: "jane",
                name: "Jane",
                avatar_template: "/letter_avatar_proxy/v4/letter/j/{size}.png",
              },
            ],
          },
        ],
        can_create_room: false,
      })
    );
  });

  test("renders public rooms for anonymous visitors", async function (assert) {
    await visit("/latest");

    assert
      .dom(".sidebar-section[data-section-name='resenha-rooms']")
      .exists("the rooms section is rendered");
    assert
      .dom("[data-link-name='resenha-room-1']")
      .hasText("Public room", "the public room link is rendered");
    assert
      .dom("[data-link-name='resenha-participant-1-2']")
      .hasText("Jane", "public room participants are rendered");
  });
});

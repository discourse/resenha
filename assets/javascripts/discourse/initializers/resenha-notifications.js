import getURL from "discourse/lib/get-url";
import { withPluginApi } from "discourse/lib/plugin-api";
import { i18n } from "discourse-i18n";

export default {
  name: "resenha-notifications",

  initialize() {
    withPluginApi((api) => {
      api.registerNotificationTypeRenderer(
        "resenha_invitation",
        (NotificationTypeBase) => {
          return class extends NotificationTypeBase {
            linkTitle = i18n("notifications.titles.resenha_invitation");
            icon = "microphone-lines";

            get linkHref() {
              const data = this.notification.data;
              // Carries the inviter so joining from the notification credits
              // them, the same as a shared invite link.
              return getURL(
                `/resenha/r/${data.room_slug}/invited-by/${encodeURIComponent(
                  data.display_username.toLowerCase()
                )}`
              );
            }

            get description() {
              return i18n("notifications.resenha_invitation", {
                room_name: this.notification.data.room_name,
              });
            }
          };
        }
      );
    });
  },
};

import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import { service } from "@ember/service";
import BackButton from "discourse/components/back-button";
import Form from "discourse/components/form";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { i18n } from "discourse-i18n";

export default class ResenhaRoomForm extends Component {
  @service siteSettings;
  @service chatApi;

  @tracked isSaving = false;
  @tracked chatChannels = [];

  get isAdminContext() {
    return !this.args.onSubmit;
  }

  get formData() {
    return {
      name: this.args.room?.name || "",
      description: this.args.room?.description || "",
      public: this.args.room?.public ?? false,
      room_type: this.args.room?.room_type || "open",
      max_participants: this.args.room?.max_participants || null,
      video_enabled: this.args.room?.video_enabled ?? true,
      chat_channel_id: this.args.room?.chat_channel_id || null,
      chat_idle_minutes: this.args.room?.chat_idle_minutes ?? 15,
      chat_thread_title_template:
        this.args.room?.chat_thread_title_template || "",
    };
  }

  get showVideoToggle() {
    return this.siteSettings.resenha_video_enabled;
  }

  get showChatSettings() {
    return (
      this.siteSettings.chat_enabled && this.siteSettings.resenha_chat_enabled
    );
  }

  threadTitlePreview(template) {
    const text = (template || "").toString();
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    const date = now.toISOString().slice(0, 10);
    return text.replaceAll("{time}", time).replaceAll("{date}", date);
  }

  @action
  async loadChatChannels() {
    if (!this.showChatSettings) {
      return;
    }
    try {
      const collection = this.chatApi.channels();
      await collection.load();
      this.chatChannels = (collection.items ?? []).filter(
        (channel) => channel.threadingEnabled
      );
    } catch (e) {
      popupAjaxError(e);
    }
  }

  get maxParticipantsValidation() {
    return "integer|number:2,200";
  }

  isStageType(roomType) {
    return roomType === "stage";
  }

  get roomTypeOptions() {
    return [
      {
        id: "open",
        name: i18n("resenha.room.type_open"),
        description: i18n("resenha.room.type_open_description"),
      },
      {
        id: "stage",
        name: i18n("resenha.room.type_stage"),
        description: i18n("resenha.room.type_stage_description"),
      },
    ];
  }

  get submitLabel() {
    if (this.isAdminContext) {
      return this.args.room?.id
        ? "resenha.admin.update"
        : "resenha.admin.create";
    }
    return "resenha.room.save";
  }

  @action
  async handleSubmit(data) {
    this.isSaving = true;

    try {
      if (this.args.onSubmit) {
        await this.args.onSubmit(data);
      } else {
        const room = this.args.room;
        room.setProperties(data);
        await room.save();
        this.args.onSave?.(room);
      }
    } catch (e) {
      popupAjaxError(e);
    } finally {
      this.isSaving = false;
    }
  }

  <template>
    <div class="resenha-room-form {{if this.isAdminContext 'admin-detail'}}">
      {{#if this.isAdminContext}}
        <BackButton
          @label="resenha.admin.back"
          @route="adminPlugins.show.resenha-rooms.index"
          class="resenha-admin-back"
        />
      {{/if}}

      <Form
        @data={{this.formData}}
        @onSubmit={{this.handleSubmit}}
        class="resenha-room-form__form"
        as |form data|
      >
        <form.Field
          @type="input"
          @name="name"
          @title={{i18n "resenha.admin.room.name"}}
          @format="full"
          @validation="required|length:1,80"
          @placeholder={{i18n "resenha.admin.room.name_placeholder"}}
          as |field|
        >
          <field.Control />
        </form.Field>

        <form.Field
          @type="textarea"
          @name="description"
          @title={{i18n "resenha.admin.room.description"}}
          @format="full"
          as |field|
        >
          <field.Control />
        </form.Field>

        <form.Field
          @type="radio-group"
          @name="room_type"
          @title={{i18n "resenha.admin.room.room_type"}}
          @format="full"
          as |field|
        >
          <field.Control as |radioGroup|>
            {{#each this.roomTypeOptions as |option|}}
              <radioGroup.Radio @value={{option.id}}>
                <strong>{{option.name}}</strong>
                —
                {{option.description}}
              </radioGroup.Radio>
            {{/each}}
          </field.Control>
        </form.Field>

        {{#if (this.isStageType data.room_type)}}
          <div class="resenha-room-form__stage-hint">
            {{i18n "resenha.room.type_stage_hint"}}
          </div>
        {{/if}}

        <form.Field
          @type="toggle"
          @name="public"
          @title={{i18n "resenha.admin.room.public"}}
          @helpText={{i18n "resenha.admin.room.public_help"}}
          as |field|
        >
          <field.Control />
        </form.Field>

        {{#if this.showVideoToggle}}
          {{#unless (this.isStageType data.room_type)}}
            <form.Field
              @type="toggle"
              @name="video_enabled"
              @title={{i18n "resenha.admin.room.video_enabled"}}
              @helpText={{i18n "resenha.admin.room.video_enabled_help"}}
              as |field|
            >
              <field.Control />
            </form.Field>
          {{/unless}}
        {{/if}}

        <form.Field
          @type="input-number"
          @name="max_participants"
          @title={{i18n "resenha.admin.room.max_participants"}}
          @description={{i18n "resenha.admin.room.max_participants_help"}}
          @validation={{this.maxParticipantsValidation}}
          as |field|
        >
          <field.Control />
        </form.Field>

        {{#if this.showChatSettings}}
          <div
            class="resenha-room-form__chat"
            {{didInsert this.loadChatChannels}}
          >
            <form.Field
              @type="select"
              @name="chat_channel_id"
              @title={{i18n "resenha.admin.room.chat_channel"}}
              @description={{i18n "resenha.admin.room.chat_channel_help"}}
              @format="full"
              as |field|
            >
              <field.Control as |select|>
                {{#each this.chatChannels as |channel|}}
                  <select.Option
                    @value={{channel.id}}
                  >{{channel.title}}</select.Option>
                {{/each}}
              </field.Control>
            </form.Field>

            {{#unless this.chatChannels.length}}
              <div class="resenha-room-form__chat-empty">
                {{i18n "resenha.admin.room.chat_channel_none"}}
              </div>
            {{/unless}}

            {{#if data.chat_channel_id}}
              <form.Field
                @type="input-number"
                @name="chat_idle_minutes"
                @title={{i18n "resenha.admin.room.chat_idle_minutes"}}
                @description={{i18n
                  "resenha.admin.room.chat_idle_minutes_help"
                }}
                @validation="integer|number:2,1440"
                as |field|
              >
                <field.Control />
              </form.Field>

              <form.Field
                @type="input"
                @name="chat_thread_title_template"
                @title={{i18n "resenha.admin.room.chat_thread_title_template"}}
                @description={{i18n
                  "resenha.admin.room.chat_thread_title_template_help"
                }}
                @format="full"
                @placeholder={{i18n
                  "resenha.admin.room.chat_thread_title_placeholder"
                }}
                as |field|
              >
                <field.Control />
              </form.Field>

              <div class="resenha-room-form__chat-preview">
                {{#if data.chat_thread_title_template}}
                  {{i18n "resenha.admin.room.chat_thread_title_preview"}}
                  <strong>{{this.threadTitlePreview
                      data.chat_thread_title_template
                    }}</strong>
                {{else}}
                  {{i18n "resenha.admin.room.chat_no_template_hint"}}
                {{/if}}
              </div>
            {{/if}}
          </div>
        {{/if}}

        <form.Submit
          @label={{this.submitLabel}}
          @disabled={{this.isSaving}}
          class="resenha-room-form__submit"
        />
      </Form>
    </div>
  </template>
}

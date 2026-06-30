import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { getOwner } from "@ember/owner";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import { service } from "@ember/service";
import BackButton from "discourse/components/back-button";
import Form from "discourse/components/form";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { i18n } from "discourse-i18n";

export default class ResenhaRoomForm extends Component {
  @service siteSettings;

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
      const collection = getOwner(this).lookup("service:chat-api").channels();
      await collection.load();
      this.chatChannels = collection.items ?? [];
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
        as |form|
      >
        <form.Field
          @name="name"
          @title={{i18n "resenha.admin.room.name"}}
          @format="full"
          @validation="required|length:1,80"
          as |field|
        >
          <field.Input
            placeholder={{i18n "resenha.admin.room.name_placeholder"}}
          />
        </form.Field>

        <form.Field
          @name="description"
          @title={{i18n "resenha.admin.room.description"}}
          @format="full"
          as |field|
        >
          <field.Textarea />
        </form.Field>

        <form.Field
          @name="room_type"
          @title={{i18n "resenha.admin.room.room_type"}}
          @format="full"
          as |field|
        >
          <field.RadioGroup as |radioGroup|>
            {{#each this.roomTypeOptions as |option|}}
              <radioGroup.Radio @value={{option.id}}>
                <strong>{{option.name}}</strong>
                —
                {{option.description}}
              </radioGroup.Radio>
            {{/each}}
          </field.RadioGroup>
        </form.Field>

        {{#if (this.isStageType form.data.room_type)}}
          <div class="resenha-room-form__stage-hint">
            {{i18n "resenha.room.type_stage_hint"}}
          </div>
        {{/if}}

        <form.Field
          @name="public"
          @title={{i18n "resenha.admin.room.public"}}
          @helpText={{i18n "resenha.admin.room.public_help"}}
          as |field|
        >
          <field.Toggle />
        </form.Field>

        {{#if this.showVideoToggle}}
          {{#unless (this.isStageType form.data.room_type)}}
            <form.Field
              @name="video_enabled"
              @title={{i18n "resenha.admin.room.video_enabled"}}
              @helpText={{i18n "resenha.admin.room.video_enabled_help"}}
              as |field|
            >
              <field.Toggle />
            </form.Field>
          {{/unless}}
        {{/if}}

        <form.Field
          @name="max_participants"
          @title={{i18n "resenha.admin.room.max_participants"}}
          @description={{i18n "resenha.admin.room.max_participants_help"}}
          @validation={{this.maxParticipantsValidation}}
          as |field|
        >
          <field.Input @type="number" />
        </form.Field>

        {{#if this.showChatSettings}}
          <div
            class="resenha-room-form__chat"
            {{didInsert this.loadChatChannels}}
          >
            <form.Field
              @name="chat_channel_id"
              @title={{i18n "resenha.admin.room.chat_channel"}}
              @description={{i18n "resenha.admin.room.chat_channel_help"}}
              @format="full"
              as |field|
            >
              <field.Select as |select|>
                {{#each this.chatChannels as |channel|}}
                  <select.Option
                    @value={{channel.id}}
                  >{{channel.title}}</select.Option>
                {{/each}}
              </field.Select>
            </form.Field>

            {{#if form.data.chat_channel_id}}
              <form.Field
                @name="chat_idle_minutes"
                @title={{i18n "resenha.admin.room.chat_idle_minutes"}}
                @description={{i18n
                  "resenha.admin.room.chat_idle_minutes_help"
                }}
                @validation="integer|number:1,1440"
                as |field|
              >
                <field.Input @type="number" />
              </form.Field>

              <form.Field
                @name="chat_thread_title_template"
                @title={{i18n "resenha.admin.room.chat_thread_title_template"}}
                @description={{i18n
                  "resenha.admin.room.chat_thread_title_template_help"
                }}
                @format="full"
                as |field|
              >
                <field.Input
                  placeholder={{i18n
                    "resenha.admin.room.chat_thread_title_placeholder"
                  }}
                />
              </form.Field>

              <div class="resenha-room-form__chat-preview">
                {{#if form.data.chat_thread_title_template}}
                  {{i18n "resenha.admin.room.chat_thread_title_preview"}}
                  <strong>{{this.threadTitlePreview
                      form.data.chat_thread_title_template
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

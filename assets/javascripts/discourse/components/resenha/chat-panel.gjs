import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { next } from "@ember/runloop";
import { service } from "@ember/service";
import { htmlSafe } from "@ember/template";
import EmojiPicker from "discourse/components/emoji-picker";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { avatarUrl } from "discourse/lib/avatar-utils";
import { prioritizeNameInUx } from "discourse/lib/settings";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";

const SCROLL_BOTTOM_THRESHOLD = 48;

export default class ResenhaChatPanel extends Component {
  @service currentUser;
  @service chatApi;
  @service chatStateManager;
  @service messageBus;
  @service router;

  @tracked draft = "";
  @tracked loading = true;
  @tracked channelId = null;
  @tracked threadId = null;
  @tracked rootMessageId = null;
  @tracked messages = [];

  messagesElement = null;
  textareaElement = null;
  #pinnedToBottom = true;
  #subscribedPath = null;
  #sessionPath = null;

  willDestroy() {
    super.willDestroy(...arguments);
    this.#unsubscribe();
    this.#unsubscribeSession();
  }

  get room() {
    return this.args.room;
  }

  get hasThread() {
    return !!this.threadId;
  }

  get showStart() {
    return !this.hasThread && !!this.room?.chat_thread_title_template;
  }

  get hasMessages() {
    return this.messages.length > 0;
  }

  get messageCount() {
    return this.messages.length;
  }

  get sendDisabled() {
    return this.draft.trim().length === 0;
  }

  get canOpenInChat() {
    return this.hasThread && !!this.room?.chat_channel?.slug;
  }

  get groups() {
    const groups = [];

    for (const message of this.messages) {
      const senderId = message.user?.id;
      const last = groups[groups.length - 1];
      if (last && last.senderId === senderId) {
        last.items.push(this.#decorate(message));
        continue;
      }

      const name = message.user?.name;
      const username = message.user?.username;
      const avatarTemplate = message.user?.avatar_template;
      groups.push({
        key: message.id,
        senderId,
        mine: Number(senderId) === Number(this.currentUser?.id),
        username,
        displayName: prioritizeNameInUx(name) ? name : username,
        avatar: avatarTemplate ? avatarUrl(avatarTemplate, "small") : null,
        items: [this.#decorate(message)],
      });
    }

    return groups;
  }

  #decorate(message) {
    return {
      id: message.id,
      cooked: htmlSafe(message.cooked),
      time: this.#formatTime(message.created_at),
    };
  }

  #formatTime(iso) {
    if (!iso) {
      return "";
    }
    const date = new Date(iso);
    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  @action
  async loadSession() {
    this.#subscribeSession();
    try {
      const data = await ajax(`/resenha/rooms/${this.room.id}/chat_session`);
      await this.#applyState(data);
    } catch (e) {
      popupAjaxError(e);
    } finally {
      this.loading = false;
    }
  }

  async #applyState(data) {
    if (!data) {
      return;
    }
    this.channelId = data.channel_id;
    if (data.thread_id) {
      await this.#openThread(data.thread_id);
    } else {
      this.#showRoot(data.root_message);
    }
  }

  #showRoot(message) {
    if (this.threadId) {
      this.#unsubscribe();
      this.threadId = null;
    }
    const id = message?.id ?? null;
    if (this.rootMessageId === id) {
      return;
    }
    this.rootMessageId = id;
    this.messages = message ? [message] : [];
  }

  async #openThread(threadId) {
    if (!threadId || this.threadId === threadId) {
      return;
    }

    this.#unsubscribe();
    this.threadId = threadId;
    this.rootMessageId = null;
    this.#subscribe();

    try {
      const data = await this.chatApi.channelThreadMessages(
        this.channelId,
        threadId
      );
      this.messages = data.messages ?? [];
    } catch (e) {
      popupAjaxError(e);
    }
  }

  #subscribeSession() {
    if (this.#sessionPath) {
      return;
    }
    this.#sessionPath = `/resenha/rooms/${this.room.id}/chat`;
    this.messageBus.subscribe(this.#sessionPath, this.onSessionMessage);
  }

  #unsubscribeSession() {
    if (this.#sessionPath) {
      this.messageBus.unsubscribe(this.#sessionPath, this.onSessionMessage);
      this.#sessionPath = null;
    }
  }

  @action
  onSessionMessage(data) {
    this.#applyState(data);
  }

  #subscribe() {
    if (!this.channelId || !this.threadId) {
      return;
    }
    this.#subscribedPath = `/chat/${this.channelId}/thread/${this.threadId}`;
    this.messageBus.subscribe(this.#subscribedPath, this.onBusMessage);
  }

  #unsubscribe() {
    if (this.#subscribedPath) {
      this.messageBus.unsubscribe(this.#subscribedPath, this.onBusMessage);
      this.#subscribedPath = null;
    }
  }

  @action
  onBusMessage(data) {
    if (data?.type === "sent" && data.chat_message) {
      const message = data.chat_message;
      if (this.messages.some((m) => m.id === message.id)) {
        return;
      }
      this.messages = [...this.messages, message];
    } else if (data?.type === "delete") {
      this.messages = this.messages.filter((m) => m.id !== data.deleted_id);
    }
  }

  @action
  registerMessages(element) {
    this.messagesElement = element;
    this.#scrollToBottom();
  }

  @action
  registerTextarea(element) {
    this.textareaElement = element;
  }

  @action
  trackScroll() {
    const element = this.messagesElement;
    if (!element) {
      return;
    }
    const distance =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    this.#pinnedToBottom = distance <= SCROLL_BOTTOM_THRESHOLD;
  }

  @action
  onMessagesChanged() {
    if (this.#pinnedToBottom) {
      this.#scrollToBottom();
    }
  }

  #scrollToBottom() {
    next(() => {
      const element = this.messagesElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    });
  }

  @action
  updateDraft(event) {
    this.draft = event.target.value;
    this.#autogrow();
  }

  @action
  onKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  @action
  insertEmoji(emoji) {
    const code = `:${emoji}:`;
    const element = this.textareaElement;

    if (!element) {
      this.draft = `${this.draft}${code}`;
      return;
    }

    const value = element.value;
    const start = element.selectionStart ?? value.length;
    const end = element.selectionEnd ?? value.length;
    const nextValue = `${value.slice(0, start)}${code}${value.slice(end)}`;
    element.value = nextValue;
    this.draft = nextValue;
    this.#autogrow();

    element.focus();
    const caret = start + code.length;
    element.setSelectionRange(caret, caret);
  }

  @action
  async startChat() {
    await this.#post("");
  }

  @action
  async send() {
    if (this.sendDisabled) {
      return;
    }
    const message = this.draft;
    this.draft = "";
    if (this.textareaElement) {
      this.textareaElement.value = "";
    }
    this.#autogrow();
    await this.#post(message);
  }

  async #post(message) {
    try {
      const data = await ajax(`/resenha/rooms/${this.room.id}/chat_message`, {
        type: "POST",
        data: { message },
      });
      await this.#applyState(data);
    } catch (e) {
      popupAjaxError(e);
    }
  }

  @action
  openInChat() {
    if (!this.canOpenInChat) {
      return;
    }
    const channel = this.room.chat_channel;
    this.chatStateManager.didOpenDrawer?.();
    this.router.transitionTo(
      "chat.channel.thread",
      channel.slug,
      channel.id,
      this.threadId
    );
  }

  #autogrow() {
    const element = this.textareaElement;
    if (!element) {
      return;
    }
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }

  <template>
    <section
      class="resenha-chat"
      aria-label={{i18n "resenha.chat.title"}}
      {{didInsert this.loadSession}}
    >
      <header class="resenha-chat__header">
        <h2 class="resenha-chat__title">
          {{dIcon "far-comment"}}
          {{i18n "resenha.chat.title"}}
        </h2>
        {{#if this.canOpenInChat}}
          <button
            type="button"
            class="btn btn-icon no-text resenha-chat__open-in-chat"
            title={{i18n "resenha.chat.open_in_chat"}}
            aria-label={{i18n "resenha.chat.open_in_chat"}}
            {{on "click" this.openInChat}}
          >
            {{dIcon "up-right-from-square"}}
          </button>
        {{/if}}
        {{#if @onClose}}
          <button
            type="button"
            class="btn btn-icon no-text resenha-chat__close"
            title={{i18n "resenha.chat.close"}}
            aria-label={{i18n "resenha.chat.close"}}
            {{on "click" @onClose}}
          >
            {{dIcon "xmark"}}
          </button>
        {{/if}}
      </header>

      <div
        class="resenha-chat__messages"
        role="log"
        aria-live="polite"
        aria-label={{i18n "resenha.chat.title"}}
        {{didInsert this.registerMessages}}
        {{didUpdate this.onMessagesChanged this.messageCount}}
        {{on "scroll" this.trackScroll}}
      >
        {{#if this.hasMessages}}
          {{#each this.groups key="key" as |group|}}
            <div
              class={{if
                group.mine
                "resenha-chat__group --mine"
                "resenha-chat__group"
              }}
            >
              {{#unless group.mine}}
                <div class="resenha-chat__avatar">
                  {{#if group.avatar}}
                    <img src={{group.avatar}} alt={{group.username}} />
                  {{/if}}
                </div>
              {{/unless}}
              <div class="resenha-chat__group-body">
                <div class="resenha-chat__meta">
                  <span
                    class="resenha-chat__author"
                  >{{group.displayName}}</span>
                </div>
                {{#each group.items key="id" as |item|}}
                  <div class="resenha-chat__message">
                    <span class="resenha-chat__bubble">{{item.cooked}}</span>
                    <span class="resenha-chat__time">{{item.time}}</span>
                  </div>
                {{/each}}
              </div>
            </div>
          {{/each}}
        {{else}}
          <div class="resenha-chat__empty">
            {{dIcon "far-comment"}}
            <p class="resenha-chat__empty-title">
              {{i18n "resenha.chat.empty_title"}}
            </p>
            <p class="resenha-chat__empty-body">
              {{i18n "resenha.chat.empty_body"}}
            </p>
            {{#if this.showStart}}
              <button
                type="button"
                class="btn btn-default resenha-chat__start"
                {{on "click" this.startChat}}
              >
                {{i18n "resenha.chat.start"}}
              </button>
            {{/if}}
          </div>
        {{/if}}
      </div>

      <footer class="resenha-chat__composer">
        <EmojiPicker
          @context="resenha-chat"
          @didSelectEmoji={{this.insertEmoji}}
          @btnClass="btn-transparent resenha-chat__emoji"
        />
        <textarea
          class="resenha-chat__input"
          rows="1"
          placeholder={{i18n "resenha.chat.composer_placeholder"}}
          aria-label={{i18n "resenha.chat.composer_placeholder"}}
          maxlength="1000"
          {{didInsert this.registerTextarea}}
          {{on "input" this.updateDraft}}
          {{on "keydown" this.onKeydown}}
        ></textarea>
        <button
          type="button"
          class="btn btn-primary btn-icon no-text resenha-chat__send"
          title={{i18n "resenha.chat.send"}}
          aria-label={{i18n "resenha.chat.send"}}
          disabled={{this.sendDisabled}}
          {{on "click" this.send}}
        >
          {{dIcon "paper-plane"}}
        </button>
      </footer>
    </section>
  </template>
}

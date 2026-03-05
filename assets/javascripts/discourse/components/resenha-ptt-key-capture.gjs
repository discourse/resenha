import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { modifier as modifierFn } from "ember-modifier";
import DButton from "discourse/components/d-button";
import { i18n } from "discourse-i18n";
import { humanKeyName } from "../lib/resenha/ptt-utils";

const RESERVED_KEYS = new Set(["Escape", "Tab", "Enter"]);

export default class ResenhaPttKeyCapture extends Component {
  @tracked capturedKey = null;
  @tracked isReserved = false;

  autoFocus = modifierFn((element) => {
    element.focus();
  });

  get displayText() {
    if (this.isReserved) {
      return i18n("resenha.ptt.reserved_key");
    }
    if (this.capturedKey) {
      return humanKeyName(this.capturedKey);
    }
    return i18n("resenha.ptt.press_key");
  }

  @action
  onKeyDown(event) {
    event.preventDefault();
    event.stopPropagation();

    if (RESERVED_KEYS.has(event.code)) {
      this.isReserved = true;
      this.capturedKey = null;
      return;
    }

    this.isReserved = false;
    this.capturedKey = event.code;
  }

  @action
  confirm() {
    if (this.capturedKey && !this.isReserved) {
      this.args.onConfirm?.(this.capturedKey);
    }
  }

  @action
  cancel() {
    this.args.onCancel?.();
  }

  <template>
    {{! template-lint-disable no-pointer-down-event-binding }}
    <div
      class="resenha-ptt-key-capture"
      {{on "keydown" this.onKeyDown}}
      {{this.autoFocus}}
      tabindex="0"
    >
      <span
        class="resenha-ptt-key-capture__display
          {{if this.isReserved 'resenha-ptt-key-capture__display--error'}}
          {{if this.capturedKey 'resenha-ptt-key-capture__display--captured'}}"
      >
        {{this.displayText}}
      </span>
      <div class="resenha-ptt-key-capture__actions">
        <DButton
          @action={{this.confirm}}
          @icon="check"
          @disabled={{if this.capturedKey false true}}
          class="btn-flat btn-small resenha-ptt-key-capture__confirm"
        />
        <DButton
          @action={{this.cancel}}
          @icon="xmark"
          class="btn-flat btn-small resenha-ptt-key-capture__cancel"
        />
      </div>
    </div>
  </template>
}

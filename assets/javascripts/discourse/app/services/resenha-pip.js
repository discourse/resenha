import { tracked } from "@glimmer/tracking";
import Service, { service } from "@ember/service";
import { WIDGET_SIZE_KEY } from "../../components/resenha/call-widget";
import { preparePipDocument } from "../../lib/resenha/pip-window";

const DEFAULT_PIP_WIDTH = 380;
const DEFAULT_PIP_HEIGHT = 340;

// Owns the Document Picture-in-Picture window the call widget renders into:
// opening (manually or via the browser's auto-pip on tab switch), style
// bootstrapping, and closing when the pip window goes away or the opener tab
// becomes visible again.
export default class ResenhaPip extends Service {
  @service keyValueStore;
  @service siteSettings;

  @tracked pipWindow = null;

  #opening = false;

  #onPipClosed = () => {
    document.removeEventListener("visibilitychange", this.#onOpenerVisible);
    if (!this.isDestroying && !this.isDestroyed) {
      this.pipWindow = null;
    }
  };

  // Pip exists to cover for a hidden tab; returning to the tab dismisses it
  // (the browser already does this itself for auto-entered pip).
  #onOpenerVisible = () => {
    if (document.visibilityState === "visible") {
      this.close();
    }
  };

  willDestroy() {
    super.willDestroy(...arguments);
    this.disableAutoPip();
    document.removeEventListener("visibilitychange", this.#onOpenerVisible);
    this.close();
  }

  // navigator.mediaSession itself is read-only, so tests stub this getter.
  get mediaSession() {
    return navigator.mediaSession;
  }

  get supported() {
    return (
      !!this.siteSettings.resenha_picture_in_picture_enabled &&
      typeof window.documentPictureInPicture?.requestWindow === "function"
    );
  }

  get active() {
    return !!this.pipWindow;
  }

  get pipBody() {
    return this.pipWindow?.document.body ?? null;
  }

  // Consumes transient user activation, so callers must invoke it
  // synchronously from a gesture — or from the browser's own
  // enterpictureinpicture dispatch, which carries its own activation.
  async open() {
    if (!this.supported || this.pipWindow || this.#opening) {
      return;
    }

    this.#opening = true;
    let pipWindow;
    try {
      pipWindow = await window.documentPictureInPicture.requestWindow(
        this.#windowSize()
      );
    } catch {
      return; // no activation left, or the browser refused
    } finally {
      this.#opening = false;
    }

    preparePipDocument(pipWindow);
    pipWindow.addEventListener("pagehide", this.#onPipClosed, { once: true });
    document.addEventListener("visibilitychange", this.#onOpenerVisible);
    this.pipWindow = pipWindow;
  }

  close() {
    try {
      this.pipWindow?.close();
    } catch {
      // already gone
    }
  }

  // Registered only while a call is active: the handler's presence is what
  // makes the browser offer/trigger automatic pip on tab switch. Chromium
  // only dispatches it on https:// or file:// pages — a literal scheme
  // check, independent of secure-context status — so this never fires on an
  // http dev server even though the manual open() works there.
  enableAutoPip() {
    if (!this.supported) {
      return;
    }
    this.#setAutoPipHandler(() => this.open());
  }

  disableAutoPip() {
    this.#setAutoPipHandler(null);
  }

  #setAutoPipHandler(handler) {
    try {
      this.mediaSession?.setActionHandler("enterpictureinpicture", handler);
    } catch {
      // browser doesn't know this action yet
    }
  }

  #windowSize() {
    let width = DEFAULT_PIP_WIDTH;
    let height = DEFAULT_PIP_HEIGHT;

    const raw = this.keyValueStore.get(WIDGET_SIZE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        // The extra-minimized pill is too small to be a useful window, so
        // only a real saved size overrides the default.
        if (!saved.extraMinimized && saved.width && saved.height) {
          width = saved.width;
          height = saved.height;
        }
      } catch {
        // corrupt entry; keep defaults
      }
    }

    return { width, height };
  }
}

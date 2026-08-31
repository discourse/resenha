import { getOwner } from "@ember/owner";
import { settled } from "@ember/test-helpers";
import { setupTest } from "ember-qunit";
import { module, test } from "qunit";

function buildFakePipWindow() {
  const iframe = document.createElement("iframe");
  document.body.appendChild(iframe);

  const listeners = new Map();
  return {
    document: iframe.contentDocument,
    addEventListener(name, fn) {
      listeners.set(name, fn);
    },
    removeEventListener(name) {
      listeners.delete(name);
    },
    close() {
      listeners.get("pagehide")?.(new Event("pagehide"));
    },
    destroy() {
      iframe.remove();
    },
  };
}

module("Unit | Service | resenha-pip", function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.fakePip = buildFakePipWindow();
    this.requestedSizes = [];
    this.originalDescriptor = Object.getOwnPropertyDescriptor(
      window,
      "documentPictureInPicture"
    );
    Object.defineProperty(window, "documentPictureInPicture", {
      configurable: true,
      writable: true,
      value: {
        requestWindow: async (size) => {
          this.requestedSizes.push(size);
          return this.fakePip;
        },
      },
    });

    this.siteSettings = getOwner(this).lookup("service:site-settings");
    this.siteSettings.resenha_picture_in_picture_enabled = true;
    this.service = getOwner(this).lookup("service:resenha-pip");
  });

  hooks.afterEach(function () {
    this.fakePip.destroy();
    if (this.originalDescriptor) {
      Object.defineProperty(
        window,
        "documentPictureInPicture",
        this.originalDescriptor
      );
    } else {
      delete window.documentPictureInPicture;
    }
  });

  test("supported requires both the site setting and the browser API", function (assert) {
    assert.true(this.service.supported);

    this.siteSettings.resenha_picture_in_picture_enabled = false;
    assert.false(this.service.supported, "off when the setting is disabled");

    this.siteSettings.resenha_picture_in_picture_enabled = true;
    delete window.documentPictureInPicture;
    assert.false(this.service.supported, "off when the API is missing");
  });

  test("open() sizes the window from the saved widget size and prepares the document", async function (assert) {
    getOwner(this)
      .lookup("service:key-value-store")
      .set({
        key: "resenha-widget-size",
        value: JSON.stringify({ width: 444, height: 333 }),
      });
    document.documentElement.setAttribute("data-resenha-pip-test", "marker");

    try {
      await this.service.open();
    } finally {
      document.documentElement.removeAttribute("data-resenha-pip-test");
    }

    assert.deepEqual(this.requestedSizes, [{ width: 444, height: 333 }]);
    assert.true(this.service.active);
    assert.strictEqual(this.service.pipBody, this.fakePip.document.body);
    assert.true(
      this.fakePip.document.body.classList.contains("resenha-pip"),
      "tags the pip body for styling"
    );
    assert.strictEqual(
      this.fakePip.document.head.querySelectorAll("link, style").length,
      document.querySelectorAll('link[rel="stylesheet"], style').length,
      "copies every stylesheet and style block"
    );
    assert.strictEqual(
      this.fakePip.document.documentElement.getAttribute(
        "data-resenha-pip-test"
      ),
      "marker",
      "mirrors the opener's <html> data attributes"
    );
  });

  test("open() ignores an extra-minimized saved size", async function (assert) {
    getOwner(this)
      .lookup("service:key-value-store")
      .set({
        key: "resenha-widget-size",
        value: JSON.stringify({ width: 118, height: 52, extraMinimized: true }),
      });

    await this.service.open();

    assert.deepEqual(this.requestedSizes, [{ width: 380, height: 340 }]);
  });

  test("open() no-ops while unsupported or already open", async function (assert) {
    this.siteSettings.resenha_picture_in_picture_enabled = false;
    await this.service.open();
    assert.strictEqual(this.requestedSizes.length, 0);
    assert.false(this.service.active);

    this.siteSettings.resenha_picture_in_picture_enabled = true;
    await this.service.open();
    await this.service.open();
    assert.strictEqual(this.requestedSizes.length, 1, "second open no-ops");
  });

  test("the pip window going away clears the tracked state", async function (assert) {
    await this.service.open();
    assert.true(this.service.active);

    this.fakePip.close();

    assert.false(this.service.active);
    assert.strictEqual(this.service.pipBody, null);
  });

  test("the opener tab becoming visible dismisses the pip window", async function (assert) {
    await this.service.open();

    // Headless browsers don't reliably report "visible", so pin it for the
    // dispatch; deleting the own property restores the prototype accessor.
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    try {
      document.dispatchEvent(new Event("visibilitychange"));
    } finally {
      delete document.visibilityState;
    }

    await settled();
    assert.false(this.service.active);
  });

  test("auto-pip registers and clears the media session handler", async function (assert) {
    const calls = [];
    Object.defineProperty(this.service, "mediaSession", {
      value: {
        setActionHandler(name, handler) {
          calls.push([name, handler]);
        },
      },
    });

    this.service.enableAutoPip();
    assert.strictEqual(calls[0][0], "enterpictureinpicture");
    assert.strictEqual(typeof calls[0][1], "function");

    await calls[0][1]();
    assert.true(this.service.active, "the browser's dispatch opens the window");

    this.service.disableAutoPip();
    assert.strictEqual(calls[1][1], null);
  });
});

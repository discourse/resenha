// AudioWorkletGlobalScope has no TextDecoder/TextEncoder, but wasm-bindgen
// glue instantiates them at module scope (string passing, panic messages).
// Minimal UTF-8 implementations keep the glue importable; they only run for
// diagnostics, never on the audio path.

if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = class TextDecoder {
    constructor() {}

    decode(bytes) {
      if (!bytes) {
        return "";
      }
      const input =
        bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
      let out = "";
      let i = 0;
      while (i < input.length) {
        const byte = input[i];
        let codePoint, extra;
        if (byte < 0x80) {
          codePoint = byte;
          extra = 0;
        } else if (byte < 0xe0) {
          codePoint = byte & 0x1f;
          extra = 1;
        } else if (byte < 0xf0) {
          codePoint = byte & 0x0f;
          extra = 2;
        } else {
          codePoint = byte & 0x07;
          extra = 3;
        }
        i++;
        while (extra-- > 0 && i < input.length) {
          codePoint = (codePoint << 6) | (input[i++] & 0x3f);
        }
        out += String.fromCodePoint(codePoint);
      }
      return out;
    }
  };
}

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = class TextEncoder {
    encode(string = "") {
      const bytes = [];
      for (const char of string) {
        const codePoint = char.codePointAt(0);
        if (codePoint < 0x80) {
          bytes.push(codePoint);
        } else if (codePoint < 0x800) {
          bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
        } else if (codePoint < 0x10000) {
          bytes.push(
            0xe0 | (codePoint >> 12),
            0x80 | ((codePoint >> 6) & 0x3f),
            0x80 | (codePoint & 0x3f)
          );
        } else {
          bytes.push(
            0xf0 | (codePoint >> 18),
            0x80 | ((codePoint >> 12) & 0x3f),
            0x80 | ((codePoint >> 6) & 0x3f),
            0x80 | (codePoint & 0x3f)
          );
        }
      }
      return new Uint8Array(bytes);
    }

    encodeInto(string, target) {
      const bytes = this.encode(string);
      const written = Math.min(bytes.length, target.length);
      target.set(bytes.subarray(0, written));
      return { read: string.length, written };
    }
  };
}

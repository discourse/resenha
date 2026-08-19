// Bundled into public/javascripts/stt/vad.<hash>.mjs and dynamic-import()ed
// by lib/resenha/subtitles.js — plugins can't import npm modules directly,
// and the VAD (with its own onnxruntime-web) is only worth downloading once
// subtitles are actually enabled.
export { MicVAD } from "@ricky0123/vad-web";

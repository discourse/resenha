import { i18n } from "discourse-i18n";

const INPUT_STORAGE_KEY = "resenha_audio_input_device";
const OUTPUT_STORAGE_KEY = "resenha_audio_output_device";

// Sentinel meaning "no explicit device": getUserMedia runs without a
// deviceId constraint and playback sticks to the browser default sink.
export const SYSTEM_DEFAULT_DEVICE_ID = "system_default";

function readStoredDevice(key) {
  try {
    return localStorage.getItem(key) || SYSTEM_DEFAULT_DEVICE_ID;
  } catch {
    return SYSTEM_DEFAULT_DEVICE_ID;
  }
}

function storeDevice(key, deviceId) {
  try {
    if (!deviceId || deviceId === SYSTEM_DEFAULT_DEVICE_ID) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, deviceId);
    }
  } catch {
    // ignore storage errors
  }
}

export function preferredInputDeviceId() {
  return readStoredDevice(INPUT_STORAGE_KEY);
}

export function setPreferredInputDeviceId(deviceId) {
  storeDevice(INPUT_STORAGE_KEY, deviceId);
}

export function preferredOutputDeviceId() {
  return readStoredDevice(OUTPUT_STORAGE_KEY);
}

export function setPreferredOutputDeviceId(deviceId) {
  storeDevice(OUTPUT_STORAGE_KEY, deviceId);
}

// `ideal` (not `exact`) so a remembered device that is unplugged falls back
// to the system default instead of failing getUserMedia entirely.
export function audioConstraints(deviceId = preferredInputDeviceId()) {
  if (!deviceId || deviceId === SYSTEM_DEFAULT_DEVICE_ID) {
    return true;
  }
  return { deviceId: { ideal: deviceId } };
}

export function outputSelectionSupported() {
  return (
    typeof HTMLMediaElement !== "undefined" &&
    "setSinkId" in HTMLMediaElement.prototype
  );
}

export async function enumerateAudioDevices() {
  const inputs = [];
  const outputs = [];

  if (!navigator.mediaDevices?.enumerateDevices) {
    return { inputs, outputs };
  }

  let devices;
  try {
    devices = await navigator.mediaDevices.enumerateDevices();
  } catch {
    return { inputs, outputs };
  }

  for (const device of devices) {
    if (device.kind !== "audioinput" && device.kind !== "audiooutput") {
      continue;
    }

    // Before mic permission is granted browsers return placeholder entries
    // with empty deviceIds; they can't be selected, so skip them.
    if (!device.deviceId) {
      continue;
    }

    const list = device.kind === "audioinput" ? inputs : outputs;
    list.push({
      id: device.deviceId,
      name:
        device.label ||
        i18n("resenha.voice_settings.unknown_device", {
          index: list.length + 1,
        }),
    });
  }

  return { inputs, outputs };
}

export function applyOutputDevice(element, deviceId) {
  if (!outputSelectionSupported() || typeof element?.setSinkId !== "function") {
    return;
  }

  const sinkId =
    !deviceId || deviceId === SYSTEM_DEFAULT_DEVICE_ID ? "" : deviceId;

  if (element.sinkId === sinkId) {
    return;
  }

  element.setSinkId(sinkId).catch((error) => {
    // eslint-disable-next-line no-console
    console.warn("[resenha] failed to set audio output device", error);
  });
}

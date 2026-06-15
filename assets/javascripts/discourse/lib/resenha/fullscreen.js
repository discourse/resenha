import { modifier } from "ember-modifier";

function fullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

// Toggle fullscreen for a tile. Must be called synchronously from a user
// gesture — the Fullscreen API consumes transient activation just like
// getDisplayMedia, so the caller has to be a plain click handler, not a
// DButton (which defers via next()).
export function toggleTileFullscreen(tile) {
  if (!tile) {
    return;
  }

  if (fullscreenElement()) {
    (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
    return;
  }

  if (tile.requestFullscreen) {
    tile.requestFullscreen().catch(() => {});
  } else if (tile.webkitRequestFullscreen) {
    // Safari on macOS.
    tile.webkitRequestFullscreen();
  } else {
    // iOS Safari only lets the <video> element itself go fullscreen, via the
    // native player; container fullscreen is unsupported there.
    tile.querySelector("video")?.webkitEnterFullscreen?.();
  }
}

// Reports whether `element` is the current fullscreen element, updating on
// every fullscreen change so a tile can flip its enter/exit affordance.
export const trackFullscreen = modifier((element, [onChange]) => {
  const update = () => onChange(fullscreenElement() === element);

  document.addEventListener("fullscreenchange", update);
  document.addEventListener("webkitfullscreenchange", update);

  return () => {
    document.removeEventListener("fullscreenchange", update);
    document.removeEventListener("webkitfullscreenchange", update);
  };
});

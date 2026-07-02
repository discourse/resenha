import { modifier } from "ember-modifier";

// Fallback aspect (width / height) for tiles whose media hasn't reported its
// intrinsic size yet, and for avatar-only tiles. Matches a landscape camera.
export const DEFAULT_TILE_ASPECT = 16 / 9;

// Greedy in-order row packing at a candidate uniform row height: walk the
// tiles, start a new row whenever the next tile would overflow the width.
// Returns the row count, or Infinity if a single tile is wider than the row.
function rowsAtHeight(aspects, containerWidth, gap, height) {
  let rows = 1;
  let rowWidth = 0;

  for (const aspect of aspects) {
    const tileWidth = height * aspect;
    if (tileWidth > containerWidth) {
      return Infinity;
    }

    const needed = rowWidth === 0 ? tileWidth : gap + tileWidth;
    if (rowWidth + needed > containerWidth) {
      rows += 1;
      rowWidth = tileWidth;
    } else {
      rowWidth += needed;
    }
  }

  return rows;
}

// Largest uniform row height at which all tiles — each rendered at its own
// aspect ratio (width = height * aspect) — fit the container, packed into rows.
// Tiles share a height and vary in width, so portrait and landscape feeds sit
// side by side without cropping or distortion. For a room where every tile has
// the same aspect this converges to the same optimum as a column-count search;
// mixed-aspect rooms get a justified-gallery layout. The grid uses
// `contain: size`, so the result never feeds back into the container size —
// without it, oversized tiles (e.g. right after exiting fullscreen) would
// grow the grid, the remeasure would see the inflated box, and the layout
// would lock there.
export function bestRowHeight(containerWidth, containerHeight, aspects, gap) {
  const count = aspects.length;
  if (!count || containerWidth <= 0 || containerHeight <= 0) {
    return 0;
  }

  const fits = (height) => {
    const rows = rowsAtHeight(aspects, containerWidth, gap, height);
    if (!isFinite(rows)) {
      return false;
    }
    return rows * height + (rows - 1) * gap <= containerHeight;
  };

  let low = 0;
  let high = containerHeight;
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    if (fits(mid)) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // The search converges from just below the true maximum, so flooring can
  // shed the last pixel at an exact boundary (e.g. one tile in a container of
  // its own height). Reclaim it when the rounded-up height still fits.
  const rowHeight = Math.floor(low);
  return fits(rowHeight + 1) ? rowHeight + 1 : rowHeight;
}

// Reports the grid's content box (and resolved gap) to `onResize` whenever it
// changes, so the layout can be recomputed for the available space.
export const trackGridSize = modifier((element, [onResize]) => {
  const observer = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    const gap = parseFloat(getComputedStyle(element).rowGap) || 0;
    onResize(width, height, gap);
  });
  observer.observe(element);
  return () => observer.disconnect();
});

// Reports a media element's intrinsic aspect ratio (width / height) to
// `onAspect` once metadata loads and again whenever it changes — e.g. a phone
// rotating mid-call fires `resize`. Reports null on teardown so the consumer
// can fall back to the default for an avatar tile.
export const trackVideoAspect = modifier((element, [onAspect]) => {
  const report = () => {
    const { videoWidth, videoHeight } = element;
    if (videoWidth > 0 && videoHeight > 0) {
      onAspect(videoWidth / videoHeight);
    }
  };

  element.addEventListener("loadedmetadata", report);
  element.addEventListener("resize", report);
  report();

  return () => {
    element.removeEventListener("loadedmetadata", report);
    element.removeEventListener("resize", report);
    onAspect(null);
  };
});

import { modifier } from "ember-modifier";

// Every tile is laid out at this ratio (matches the SCSS aspect-ratio).
export const TILE_ASPECT = 16 / 9;

// Largest tile width that fits `count` tiles of `aspect` into the container,
// trying every column count and keeping the best. Grid height is fixed by the
// flex parent, so the chosen width never feeds back into the container size.
export function bestTileWidth(width, height, count, aspect, gap) {
  let best = 0;

  for (let columns = 1; columns <= count; columns++) {
    const rows = Math.ceil(count / columns);
    const cellWidth = (width - (columns - 1) * gap) / columns;
    const cellHeight = (height - (rows - 1) * gap) / rows;

    const tileWidth = Math.min(cellWidth, cellHeight * aspect);
    if (tileWidth > best) {
      best = tileWidth;
    }
  }

  return Math.floor(best);
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

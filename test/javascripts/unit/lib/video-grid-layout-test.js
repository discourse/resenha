import { module, test } from "qunit";
import {
  bestTileWidth,
  TILE_ASPECT,
} from "discourse/plugins/resenha/discourse/lib/resenha/video-grid-layout";

module("Resenha | Unit | Lib | video-grid-layout", function () {
  test("a single tile fills the constraining dimension", function (assert) {
    // Wide container: a 16:9 tile is limited by height.
    assert.strictEqual(
      bestTileWidth(4000, 900, 1, TILE_ASPECT, 0),
      1600,
      "height-limited single tile spans height * aspect"
    );

    // Tall-ish container: limited by width.
    assert.strictEqual(
      bestTileWidth(1000, 4000, 1, TILE_ASPECT, 0),
      1000,
      "width-limited single tile spans the full width"
    );
  });

  test("more tiles shrink to fit without overflowing the container", function (assert) {
    const width = 1920;
    const height = 1080;

    const widths = [1, 2, 4, 9].map((count) =>
      bestTileWidth(width, height, count, TILE_ASPECT, 8)
    );

    assert.deepEqual(
      [...widths].sort((a, b) => b - a),
      widths,
      "tile width is monotonically non-increasing as tiles are added"
    );

    widths.forEach((tileWidth, index) => {
      const count = [1, 2, 4, 9][index];
      const tileHeight = tileWidth / TILE_ASPECT;
      assert.true(
        tileWidth <= width,
        `each of ${count} tiles fits the container width`
      );
      assert.true(
        tileHeight <= height,
        `each of ${count} tiles fits the container height`
      );
    });
  });

  test("picks the column count that maximizes tile size", function (assert) {
    // A 16:9 container with two 16:9 tiles: a single row of two beats a
    // stacked column, so each tile is just under half the width.
    const width = 1600;
    const height = 900;
    const gap = 0;

    const twoUp = bestTileWidth(width, height, 2, TILE_ASPECT, gap);
    assert.strictEqual(twoUp, 800, "side-by-side wins for two tiles");
  });

  test("returns zero when nothing can fit", function (assert) {
    assert.strictEqual(
      bestTileWidth(10, 10, 50, TILE_ASPECT, 8),
      0,
      "degenerate space yields no usable width"
    );
  });
});

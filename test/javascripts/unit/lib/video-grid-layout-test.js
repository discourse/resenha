import { module, test } from "qunit";
import {
  bestRowHeight,
  DEFAULT_TILE_ASPECT,
} from "discourse/plugins/resenha/discourse/lib/resenha/video-grid-layout";

const LANDSCAPE = DEFAULT_TILE_ASPECT; // 16 / 9
const PORTRAIT = 9 / 16;

module("Resenha | Unit | Lib | video-grid-layout", function () {
  test("a single tile fills the constraining dimension", function (assert) {
    // Wide container: a landscape tile is limited by height.
    assert.strictEqual(
      bestRowHeight(4000, 900, [LANDSCAPE], 0),
      900,
      "height-limited single landscape tile spans the full height"
    );

    // Narrow container: limited by width.
    assert.strictEqual(
      bestRowHeight(1000, 4000, [LANDSCAPE], 0),
      562,
      "width-limited single landscape tile spans the full width"
    );
  });

  test("a portrait tile fills the height of a landscape container", function (assert) {
    const height = bestRowHeight(1920, 1080, [PORTRAIT], 0);
    assert.strictEqual(
      height,
      1080,
      "portrait tile uses the full height instead of being letterboxed"
    );
    assert.true(
      height * PORTRAIT <= 1920,
      "and stays within the container width"
    );
  });

  test("more tiles shrink the row height without overflowing", function (assert) {
    const width = 1920;
    const height = 1080;
    const counts = [1, 2, 4, 9];

    const heights = counts.map((count) =>
      bestRowHeight(width, height, Array(count).fill(LANDSCAPE), 8)
    );

    assert.deepEqual(
      [...heights].sort((a, b) => b - a),
      heights,
      "row height is monotonically non-increasing as tiles are added"
    );

    heights.forEach((rowHeight, index) => {
      assert.true(rowHeight > 0, `${counts[index]} tiles get a usable height`);
      assert.true(
        rowHeight <= height,
        `${counts[index]} tiles fit within the container height`
      );
    });
  });

  test("mixed portrait and landscape tiles share a row at a common height", function (assert) {
    const rowHeight = bestRowHeight(1920, 1080, [LANDSCAPE, PORTRAIT], 8);

    // One row beats stacking (which would cap height near 536), so the shared
    // height lands well above that.
    assert.true(rowHeight > 600, "lays the two tiles out side by side");

    const totalWidth = rowHeight * LANDSCAPE + 8 + rowHeight * PORTRAIT;
    assert.true(
      totalWidth <= 1920,
      "the mixed-aspect row fits the container width"
    );
  });

  test("returns zero when nothing can fit", function (assert) {
    assert.strictEqual(
      bestRowHeight(10, 10, Array(50).fill(LANDSCAPE), 8),
      0,
      "degenerate space yields no usable height"
    );
  });
});

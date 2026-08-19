import registerNoiseSuppressionProcessor from "../ns-worklet/runtime";

const FRAME_SIZE = 480;

// RNNoise works on full 16-bit-range floats (±32768), not WebAudio's ±1.
const SAMPLE_SCALE = 32768;

// The wasm is a standalone Emscripten reactor (no JS glue). Its only imports
// are WASI stubs it never meaningfully calls (no filesystem is used); the
// proxy satisfies whatever the toolchain happened to emit.
const WASI_STUBS = new Proxy(
  {},
  {
    get: () => () => 0,
  }
);

registerNoiseSuppressionProcessor({
  engineRate: 48000,
  frameSize: FRAME_SIZE,
  async createEngine({ wasm }) {
    const { instance } = await WebAssembly.instantiate(wasm, {
      wasi_snapshot_preview1: WASI_STUBS,
      env: WASI_STUBS,
    });

    const exports = instance.exports;
    exports._initialize?.();

    const exported = (name) => exports[name] ?? exports[`_${name}`];
    const create = exported("rnnoise_create");
    const processFrame = exported("rnnoise_process_frame");
    const malloc = exported("malloc");

    const state = create(0);
    const inPtr = malloc(FRAME_SIZE * 4);
    const outPtr = malloc(FRAME_SIZE * 4);
    if (!state || !inPtr || !outPtr) {
      throw new Error("rnnoise allocation failed");
    }

    // Memory growth replaces the backing buffer, so the view is re-derived
    // whenever it goes stale rather than per frame.
    let heap = new Float32Array(exports.memory.buffer);
    const heapView = () => {
      if (heap.buffer !== exports.memory.buffer) {
        heap = new Float32Array(exports.memory.buffer);
      }
      return heap;
    };

    return {
      denoise(input, output) {
        let view = heapView();
        for (let i = 0; i < FRAME_SIZE; i++) {
          view[inPtr / 4 + i] = input[i] * SAMPLE_SCALE;
        }

        processFrame(state, outPtr, inPtr);

        view = heapView();
        for (let i = 0; i < FRAME_SIZE; i++) {
          output[i] = view[outPtr / 4 + i] / SAMPLE_SCALE;
        }
      },
    };
  },
});

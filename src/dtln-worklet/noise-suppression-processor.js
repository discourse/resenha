import registerNoiseSuppressionProcessor from "../ns-worklet/runtime";
import createDtln from "./dtln.js";

// AudioWorkletGlobalScope has no `self`; the Emscripten glue reads
// self.location.href for script-directory detection (unused here — the wasm
// bytes are always injected — but evaluated unconditionally).
globalThis.self ??= globalThis;
globalThis.self.location ??= { href: "" };

registerNoiseSuppressionProcessor({
  engineRate: 16000,
  frameSize: 512,
  async createEngine({ wasm }) {
    // Emscripten 6 dropped the wasmBinary module input; the instantiateWasm
    // hook is the supported way to hand it precompiled bytes. A rejected
    // instantiation must be reported — the factory promise would otherwise
    // never settle.
    let reportInstantiateError;
    const failed = new Promise((_resolve, reject) => {
      reportInstantiateError = reject;
    });

    const module = await Promise.race([
      createDtln({
        instantiateWasm: (imports, onSuccess) => {
          WebAssembly.instantiate(wasm, imports)
            .then((result) => onSuccess(result.instance, result.module))
            .catch(reportInstantiateError);
          return {};
        },
      }),
      failed,
    ]);

    const handle = module.dtln.dtln_create();
    return {
      denoise(input, output) {
        module.dtln.dtln_denoise(handle, input, output);
      },
    };
  },
});

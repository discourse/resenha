// Mesh budget: every watcher costs the sender a full encode, so resolution
// and bitrate scale down as the watcher count grows. Each connection's
// bandwidth estimator still adapts per-link below these ceilings.
function encodingFor(kind, senderCount) {
  if (kind === "screen") {
    return {
      maxBitrate: 2_500_000,
      scaleResolutionDownBy: 1,
      maxFramerate: 15,
    };
  }

  if (senderCount <= 3) {
    return {
      maxBitrate: 1_200_000,
      scaleResolutionDownBy: 1,
      maxFramerate: 24,
    };
  }

  if (senderCount <= 6) {
    return {
      maxBitrate: 700_000,
      scaleResolutionDownBy: 1.5,
      maxFramerate: 24,
    };
  }

  return {
    maxBitrate: 400_000,
    scaleResolutionDownBy: 2,
    maxFramerate: 15,
  };
}

export async function applyVideoQuality(senders, kind) {
  if (!senders.length) {
    return;
  }

  const encoding = encodingFor(kind, senders.length);

  for (const sender of senders) {
    try {
      const parameters = sender.getParameters();
      parameters.degradationPreference =
        kind === "screen" ? "maintain-resolution" : "maintain-framerate";
      if (!parameters.encodings?.length) {
        parameters.encodings = [{}];
      }
      Object.assign(parameters.encodings[0], encoding);
      await sender.setParameters(parameters);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to apply video quality", error);
    }
  }
}

// Opus defaults target speech bitrates; content audio gets a higher ceiling
// so music doesn't sound underwater. Still small next to the video budget.
export async function applyScreenAudioQuality(sender) {
  try {
    const parameters = sender.getParameters();
    if (!parameters.encodings?.length) {
      parameters.encodings = [{}];
    }
    parameters.encodings[0].maxBitrate = 128_000;
    await sender.setParameters(parameters);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("[resenha] failed to apply screen audio quality", error);
  }
}

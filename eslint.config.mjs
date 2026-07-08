import DiscourseRecommended from "@discourse/lint-configs/eslint";

export default [
  ...DiscourseRecommended,
  {
    // The LiveKit SDK must never enter the app's build graph: the vendored
    // bundle is dynamically imported at join time, only for rooms resolved
    // to the "livekit" transport, so pure-P2P installs ship and parse zero
    // LiveKit bytes. This turns that invariant into a CI-enforced rule.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "livekit-client",
              message:
                "livekit-client is a build-time devDependency only. Load the vendored bundle via the dynamic loader in lib/resenha/livekit-session.js.",
            },
          ],
          patterns: [
            {
              group: ["*javascripts/livekit/*"],
              message:
                "Never statically import the vendored LiveKit bundle; it must stay out of the app build graph. Use the dynamic loader in lib/resenha/livekit-session.js.",
            },
          ],
        },
      ],
    },
  },
];

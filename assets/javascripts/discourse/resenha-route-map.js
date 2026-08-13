export default function () {
  this.route("resenha-room", { path: "/resenha/r/:slug" });
  this.route("resenha-room-invite", {
    path: "/resenha/r/:slug/invited-by/:username",
  });
}

export default {
  resource: "admin.adminPlugins.show",

  path: "/plugins",

  map() {
    this.route("resenha-dashboard");
    this.route(
      "resenha-rooms",

      function () {
        this.route("new");
        this.route("edit", { path: "/:id" });
      }
    );
  },
};

import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

export default {
  name: "custom-homepage",
  initialize() {
    withPluginApi("1.8.0", (api) => {
      api.addHomeRoute("custom-homepage", "custom-homepage");
    });
  },
};

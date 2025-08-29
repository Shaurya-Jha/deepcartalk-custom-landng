import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

function isHome(url) {
  return (
    url === "/" ||
    url.startsWith("/?") ||
    url.startsWith("/latest") ||
    url.startsWith("/latest?")
  );
}

export default {
  name: "custom-landing-homepage",
  initialize() {
    withPluginApi("1.2.0", (api) => {
      console.log("[custom-landing] initializer loaded");

      // Toggle body class so we can hide the default list via CSS
      api.onPageChange((url) => {
        document.body.classList.toggle("custom-landing-active", isHome(url));
      });

      // Load data into the discovery.latest controller (the default home)
      api.modifyClass("route:discovery.latest", {
        pluginId: "custom-landing",
        setupController(controller, model) {
          this._super(controller, model);
          console.log("[custom-landing] setupController on discovery.latest");

          controller.setProperties({
            landingLoading: true,
            landingTopics: [],
            landingFeatured: [],
            landingCategories: [],
          });

          ajax("/top/weekly.json")
            .then((result) => {
              const topics = (result?.topic_list?.topics || []).slice(0, 10);
              topics.forEach((t) => (t.url = `/t/${t.slug}/${t.id}`));
              controller.set("landingTopics", topics);
              controller.set("landingFeatured", topics.slice(0, 3));
            })
            .finally(() => controller.set("landingLoading", false));

          ajax("/categories.json").then((result) => {
            const cats = (result?.category_list?.categories || []).slice(0, 12);
            cats.forEach((c) => (c.url = `/c/${c.slug}/${c.id}`));
            controller.set("landingCategories", cats);
          });
        },
      });

      // If your default tab is Categories/Top instead, duplicate the block above
      // for "route:discovery.categories" or "route:discovery.top".
    });
  },
};

import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

function hijack(routeName, api) {
  api.modifyClass(`route:${routeName}`, {
    pluginId: "custom-landing",

    // Ember 5+ uses implicit rendering; set the templateName directly.
    templateName: "custom-homepage",

    setupController(controller, model) {
      this._super(controller, model);
      console.log(`[custom-landing] setupController on ${routeName}`);

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
}

export default {
  name: "custom-landing-homepage",
  initialize() {
    withPluginApi("1.2.0", (api) => {
      console.log("[custom-landing] initializer loaded");
      // Cover the common home destinations
      ["discovery.latest", "discovery.categories", "discovery.top"].forEach((r) =>
        hijack(r, api)
      );
    });
  },
};

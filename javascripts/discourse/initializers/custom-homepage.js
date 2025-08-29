// Fully replace the "Latest" homepage route with our template + data.
import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

function applyLandingTo(routeName) {
  // routeName examples: "discovery.latest", "discovery.categories"
  return (api) =>
    api.modifyClass(`route:${routeName}`, {
      pluginId: "custom-landing",

      renderTemplate() {
        this.render("custom-homepage");
      },

      setupController(controller, model) {
        this._super(controller, model);

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
      // Override the route you actually land on
      applyLandingTo("discovery.latest")(api);

      // (Optional) also cover Categories tab if users click it
      applyLandingTo("discovery.categories")(api);
    });
  },
};

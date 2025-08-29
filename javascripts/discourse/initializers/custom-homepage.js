// javascripts/discourse/initializers/custom-homepage.js
import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

export default {
  name: "custom-landing-homepage",
  initialize() {
    withPluginApi("1.2.0", (api) => {
      // 1) Replace the default homepage with our template
      api.modifyClass("route:discovery", {
        pluginId: "custom-landing",
        renderTemplate() {
          this.render("custom-homepage");
        },

        // 2) Seed the controller with data
        setupController(controller, model) {
          this._super(controller, model);

          controller.setProperties({
            landingLoading: true,
            landingTopics: [],
            landingFeatured: [],
            landingCategories: [],
          });

          // Top topics (weekly). Change to /top/daily.json or /top.json as you like.
          ajax("/top/weekly.json")
            .then((result) => {
              const topics = (result?.topic_list?.topics || []).slice(0, 10);
              topics.forEach((t) => (t.url = `/t/${t.slug}/${t.id}`));
              controller.set("landingTopics", topics);
              controller.set("landingFeatured", topics.slice(0, 3));
            })
            .finally(() => controller.set("landingLoading", false));

          // Categories
          ajax("/categories.json").then((result) => {
            const cats = (result?.category_list?.categories || []).slice(0, 12);
            cats.forEach((c) => (c.url = `/c/${c.slug}/${c.id}`));
            controller.set("landingCategories", cats);
          });
        },
      });
    });
  },
};

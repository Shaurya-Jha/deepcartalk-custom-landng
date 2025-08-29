import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

function attachBodyClassForHome(url) {
  // treat "/" and "/latest" as home (adjust if your default is categories/top)
  const isHome =
    url === "/" ||
    url.startsWith("/?") ||
    url.startsWith("/latest") ||
    url.startsWith("/latest?");
  document.body.classList.toggle("custom-landing-active", isHome);
}

export default {
  name: "custom-landing-homepage",
  initialize() {
    withPluginApi("1.2.0", (api) => {
      console.log("[custom-landing] initializer loaded");

      // 1) Render our template into the page above the main container
      api.renderInOutlet("above-main-container", "custom-homepage");
      console.log("[custom-landing] rendered via outlet");

      // 2) Mark body on home so we can hide the default list with CSS
      api.onPageChange((url) => attachBodyClassForHome(url));

      // 3) Provide data to the discovery controller so our template can read it
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

      // If your default tab is Categories/Top instead of Latest, also add:
      // api.modifyClass("route:discovery.categories", {...same setupController...});
      // api.modifyClass("route:discovery.top", {...same setupController...});
    });
  },
};

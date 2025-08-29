// javascripts/discourse/initializers/custom-homepage.js
import DiscoveryRoute from "discourse/routes/discovery";
import DiscoveryController from "discourse/controllers/discovery";
import { ajax } from "discourse/lib/ajax";

export default {
  name: "custom-landing-homepage",
  initialize() {
    // 1) Render our template instead of the default Latest/Categories page
    DiscoveryRoute.reopen({
      renderTemplate() {
        this.render("custom-homepage");
      },
    });

    // 2) Provide data for the template via the Discovery controller
    DiscoveryController.reopen({
      init() {
        this._super(...arguments);

        // state
        this.set("landingLoading", true);
        this.set("landingTopics", []);
        this.set("landingFeatured", []);
        this.set("landingCategories", []);

        // ---- Top topics (weekly). Change to /top/daily.json or /top.json if you prefer
        ajax("/top/weekly.json")
          .then((result) => {
            const topics = (result?.topic_list?.topics || []).slice(0, 10);
            topics.forEach((t) => (t.url = `/t/${t.slug}/${t.id}`));
            this.set("landingTopics", topics);
            this.set("landingFeatured", topics.slice(0, 3)); // for the carousel
          })
          .finally(() => this.set("landingLoading", false));

        // ---- Top categories
        ajax("/categories.json").then((result) => {
          const cats = (result?.category_list?.categories || []).slice(0, 12);
          cats.forEach((c) => (c.url = `/c/${c.slug}/${c.id}`));
          this.set("landingCategories", cats);
        });
      },
    });
  },
};

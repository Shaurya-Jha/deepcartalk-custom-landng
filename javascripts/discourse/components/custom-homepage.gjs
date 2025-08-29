import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { inject as service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";

export default class CustomHomepage extends Component {
  @service router;

  @tracked loading = true;
  @tracked topics = [];
  @tracked featured = [];
  @tracked categories = [];

  get isHome() {
    const name = this.router?.currentRouteName || "";
    // cover Latest / Categories / Top as possible homes
    return (
      name.startsWith("discovery.latest") ||
      name.startsWith("discovery.categories") ||
      name.startsWith("discovery.top")
    );
  }

  constructor() {
    super(...arguments);

    // Fetch top topics (weekly). Change to daily/monthly if you like.
    ajax("/top/weekly.json")
      .then((result) => {
        const topics = (result?.topic_list?.topics || []).slice(0, 10);
        topics.forEach((t) => (t.url = `/t/${t.slug}/${t.id}`));
        this.topics = topics;
        this.featured = topics.slice(0, 3);
      })
      .finally(() => (this.loading = false));

    // Fetch categories
    ajax("/categories.json").then((result) => {
      const cats = (result?.category_list?.categories || []).slice(0, 12);
      cats.forEach((c) => (c.url = `/c/${c.slug}/${c.id}`));
      this.categories = cats;
    });
  }
}

import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { ajax } from "discourse/lib/ajax";

export default class CustomHomepage extends Component {
  @tracked loading = true;
  @tracked topics = [];
  @tracked featured = [];
  @tracked categories = [];

  constructor() {
    super(...arguments);

    // Top topics (weekly). Change to daily/monthly if you prefer
    ajax("/top/weekly.json")
      .then((result) => {
        const topics = (result?.topic_list?.topics || []).slice(0, 10);
        topics.forEach((t) => (t.url = `/t/${t.slug}/${t.id}`));
        this.topics = topics;
        this.featured = topics.slice(0, 3);
      })
      .finally(() => (this.loading = false));

    // Categories
    ajax("/categories.json").then((result) => {
      const cats = (result?.category_list?.categories || []).slice(0, 12);
      cats.forEach((c) => (c.url = `/c/${c.slug}/${c.id}`));
      this.categories = cats;
    });
  }
}

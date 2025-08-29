import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

function isHome(url) {
  // adjust if your default is categories/top
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

      // Add/remove body class so CSS can hide the default list on the homepage
      const toggle = (u) =>
        document.body.classList.toggle("custom-landing-active", isHome(u));
      toggle(location.pathname + location.search);
      api.onPageChange((url) => toggle(url));

      // Create a widget that renders our landing markup
      api.createWidget("custom-landing", {
        tagName: "div.custom-landing",

        defaultState() {
          return {
            loading: true,
            featured: [],
            topics: [],
            categories: [],
            hydrated: false,
          };
        },

        async hydrate(state) {
          if (state.hydrated) return;
          try {
            const top = await ajax("/top/weekly.json");
            const topics = (top?.topic_list?.topics || []).slice(0, 10);
            topics.forEach((t) => (t.url = `/t/${t.slug}/${t.id}`));
            state.topics = topics;
            state.featured = topics.slice(0, 3);

            const catsResp = await ajax("/categories.json");
            const cats = (catsResp?.category_list?.categories || []).slice(0, 12);
            cats.forEach((c) => (c.url = `/c/${c.slug}/${c.id}`));
            state.categories = cats;
          } finally {
            state.loading = false;
            state.hydrated = true;
            this.scheduleRerender();
          }
        },

        html() {
          // Only show the widget on the homepage
          if (!document.body.classList.contains("custom-landing-active")) {
            return;
          }

          const h = this.h;

          const hero = h("section.hero", [
            h("h1", "🚀 Welcome to Our Community"),
            h("p", "Discover top discussions and categories at a glance."),
          ]);

          const loading = this.state.loading
            ? h("div.loading", "Loading…")
            : null;

          const featured =
            this.state.featured.length > 0
              ? h("section.carousel-wrap", [
                  h("h2", "⭐ Featured"),
                  h(
                    "div.carousel",
                    this.state.featured.map((t) =>
                      h(
                        "a.slide.topic-card",
                        { attributes: { href: t.url } },
                        [h("h3.title", t.fancy_title), h("div.meta", `${t.views || 0} views • ${t.like_count || 0} likes`)]
                      )
                    )
                  ),
                ])
              : null;

          const trending =
            this.state.topics.length > 0
              ? h("section.top-posts", [
                  h("h2", "🔥 Trending This Week"),
                  h(
                    "ul.topic-list",
                    this.state.topics.map((t) =>
                      h("li.topic-item", [
                        h("a.topic-link", { attributes: { href: t.url } }, t.fancy_title),
                        h(
                          "span.topic-stats",
                          ` · ${t.views || 0} views · ${t.reply_count || 0} replies`
                        ),
                      ])
                    )
                  ),
                ])
              : null;

          const cats =
            this.state.categories.length > 0
              ? h("section.top-categories", [
                  h("h2", "📂 Top Categories"),
                  h(
                    "div.cat-grid",
                    this.state.categories.map((c) =>
                      h("a.cat-card", { attributes: { href: c.url } }, [
                        h("div.cat-name", c.name),
                        c.topic_count
                          ? h("div.cat-count", `${c.topic_count} topics`)
                          : null,
                      ])
                    )
                  ),
                ])
              : null;

          // container
          return h("div.landing-container", [hero, loading, featured, trending, cats]);
        },
      });

      // Inject our widget before the main discovery list
      api.decorateWidget("discovery-list-container:before", (helper) =>
        helper.attach("custom-landing")
      );
    });
  },
};

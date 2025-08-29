import { withPluginApi } from "discourse/lib/plugin-api";

function isHome(url) {
  // treat / and /latest as home (adjust if your default is categories/top)
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

      // Render our *component* above the main container
      api.renderInOutlet("above-main-container", "custom-homepage");

      // Mark body on home so we can hide the default list with CSS
      const setClass = (u) =>
        document.body.classList.toggle("custom-landing-active", isHome(u));
      api.onPageChange((url) => setClass(url));
      // also set once on first load
      setClass(location.pathname + location.search);
    });
  },
};

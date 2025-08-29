import { withPluginApi } from "discourse/lib/plugin-api";

function isHomePath(path) {
  // adjust if your default is categories/top
  return (
    path === "/" ||
    path.startsWith("/latest") ||
    path.startsWith("/categories") ||
    path.startsWith("/top")
  );
}

export default {
  name: "custom-landing-homepage",
  initialize() {
    withPluginApi("1.2.0", (api) => {
      console.log("[custom-landing] initializer loaded");

      const setBodyClass = (url) => {
        const path = url.replace(location.origin, "");
        document.body.classList.toggle("custom-landing-active", isHomePath(path));
      };

      // first load + subsequent route changes
      setBodyClass(location.pathname + location.search);
      api.onPageChange((url) => setBodyClass(url));
    });
  },
};

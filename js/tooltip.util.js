import tippy from "tippy.js";
import { page } from "$app/stores";

function setTooltip(element, [value, options]) {
  const instance =
    typeof element._tippy === "undefined" ? tippy(element) : element._tippy;

  instance.setContent(value);
  instance.setProps(options);
}

export default function tooltip(element, properties) {
  if (!properties) {
    return
  }

  let [value, options] = properties
  if (typeof options === "undefined") options = {};

  setTooltip(element, [value, options]);

  const unsubscribePage = page.subscribe(() => {
    const instance =
      typeof element._tippy === "undefined" ? tippy(element) : element._tippy;

    instance.hide();
  });

  return {
    update([value, options]) {
      if (typeof options === "undefined") options = {};

      setTooltip(element, [value, options]);
    },

    onDestroy() {
      const instance =
        typeof element._tippy === "undefined" ? tippy(element) : element._tippy;

      instance.destroy();
      unsubscribePage();
    },
  };
}

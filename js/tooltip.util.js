import tippy from "tippy.js";

function setTooltip(element, [value, options]) {
  const instance =
    typeof element._tippy === "undefined" ? tippy(element) : element._tippy;

  instance.setContent(value);
  instance.setProps(options);
}

export default function tooltip(element, [value, options]) {
  if (typeof options === "undefined") options = {};

  setTooltip(element, [value, options]);

  return {
    update([value, options]) {
      if (typeof options === "undefined") options = {};

      setTooltip(element, [value, options]);
    },
  };
}

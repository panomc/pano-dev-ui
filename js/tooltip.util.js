// export default function tooltip(element, [place, value]) {
//   deleteSubscribe();
//   setTooltip(element, [place, value]);
//
//   return {
//     update([place, value]) {
//       deleteSubscribe();
//       setTooltip(element, [place, value]);
//     },
//   };
// }
//
// export function initTooltip() {
//   isReady.set(true);
// }

// import { afterRouteEnter } from "routve";
//
// afterRouteEnter((context, next) => {
//   jQuery('[data-toggle="tooltip"], .tooltip').tooltip("hide");
//   next();
// });

import tippy from "tippy.js";

function setTooltip(element, [value, options]) {
  const instance = typeof element._tippy === "undefined" ? tippy(element) : element._tippy;

  instance.setContent(value)
  instance.setProps(options)
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

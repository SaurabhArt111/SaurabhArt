
export function sceneScrub(el) {
  const hold = el.closest("[data-scene]");
  const next = hold?.nextElementSibling ?? null;
  const runway =
    next instanceof HTMLElement && next.hasAttribute("data-runway") ? next : null;

  return runway
    ? { trigger: runway, start: "top bottom", end: "bottom bottom" }
    : { trigger: el, start: "top top", end: "bottom top" };
}

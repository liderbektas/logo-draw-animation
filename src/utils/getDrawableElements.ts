import type { DrawableTagName } from "../types";

/** Every SVG tag this library knows how to draw. */
export const DRAWABLE_TAGS: readonly DrawableTagName[] = [
  "path",
  "circle",
  "rect",
  "ellipse",
  "polygon",
  "polyline",
  "line",
];

const SELECTOR = DRAWABLE_TAGS.join(",");

/**
 * Elements that define reusable / non-rendered content. Anything nested inside
 * one of these is never painted, so it must not be drawn.
 */
const NON_RENDERED_SELECTOR = "defs,clipPath,mask,symbol,marker,pattern";

/**
 * Collect every drawable SVG element inside `root`, in document order.
 *
 * Elements that live inside non-rendered containers (`<defs>`, `<clipPath>`,
 * `<mask>`, `<symbol>`, `<marker>`, `<pattern>`) are skipped because they are
 * never painted on screen.
 *
 * @param root Any node to search within (typically the wrapper `<div>` or the
 *   `<svg>` element itself).
 */
export function getDrawableElements(root: ParentNode | null | undefined): SVGElement[] {
  if (!root || typeof root.querySelectorAll !== "function") return [];

  return Array.from(root.querySelectorAll<SVGElement>(SELECTOR)).filter(
    (el) => typeof el.closest !== "function" || el.closest(NON_RENDERED_SELECTOR) === null
  );
}

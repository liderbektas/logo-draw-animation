import { describe, it, expect } from "vitest";
import { getDrawableElements, DRAWABLE_TAGS } from "../src/utils/getDrawableElements";

function mount(markup: string): HTMLDivElement {
  const host = document.createElement("div");
  host.innerHTML = markup;
  document.body.appendChild(host);
  return host;
}

const SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <path id="ignored-def" d="M0 0 L10 10" />
      <clipPath id="cp"><rect width="5" height="5" /></clipPath>
    </defs>
    <path d="M0 0 L10 10" />
    <circle cx="5" cy="5" r="5" />
    <rect x="0" y="0" width="10" height="10" />
    <ellipse cx="5" cy="5" rx="5" ry="3" />
    <polygon points="0,0 10,0 10,10" />
    <polyline points="0,0 10,10" />
    <line x1="0" y1="0" x2="10" y2="10" />
    <g><text>label</text></g>
  </svg>
`;

describe("getDrawableElements", () => {
  it("exposes the supported drawable tags", () => {
    expect(DRAWABLE_TAGS).toEqual([
      "path",
      "circle",
      "rect",
      "ellipse",
      "polygon",
      "polyline",
      "line",
    ]);
  });

  it("finds exactly one of each rendered drawable element", () => {
    const host = mount(SVG);
    const found = getDrawableElements(host);
    const tags = found.map((el) => el.tagName.toLowerCase()).sort();
    expect(tags).toEqual(["circle", "ellipse", "line", "path", "polygon", "polyline", "rect"]);
  });

  it("ignores elements inside non-rendered containers like <defs> and <clipPath>", () => {
    const host = mount(SVG);
    const found = getDrawableElements(host);
    expect(found.some((el) => el.id === "ignored-def")).toBe(false);
    expect(found.every((el) => el.closest("defs,clipPath") === null)).toBe(true);
  });

  it("returns an empty array for nullish roots", () => {
    expect(getDrawableElements(null)).toEqual([]);
    expect(getDrawableElements(undefined)).toEqual([]);
  });
});

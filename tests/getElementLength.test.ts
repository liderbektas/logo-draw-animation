import { describe, it, expect } from "vitest";
import { getElementLength } from "../src/utils/getElementLength";

const SVG_NS = "http://www.w3.org/2000/svg";

function makeEl(tag: string, attrs: Record<string, string> = {}): SVGElement {
  const el = document.createElementNS(SVG_NS, tag) as SVGElement;
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}

describe("getElementLength", () => {
  it("measures a line as the distance between its endpoints", () => {
    const line = makeEl("line", { x1: "0", y1: "0", x2: "3", y2: "4" });
    expect(getElementLength(line)).toBeCloseTo(5);
  });

  it("measures a sharp rectangle as its perimeter", () => {
    const rect = makeEl("rect", { width: "10", height: "20" });
    expect(getElementLength(rect)).toBeCloseTo(60);
  });

  it("accounts for rounded corners on a rectangle", () => {
    const rect = makeEl("rect", { width: "20", height: "20", rx: "5", ry: "5" });
    // straight edges (40) + one full ellipse worth of corners (2*pi*5)
    expect(getElementLength(rect)).toBeCloseTo(40 + 2 * Math.PI * 5);
  });

  it("measures a circle as its circumference", () => {
    const circle = makeEl("circle", { r: "10" });
    expect(getElementLength(circle)).toBeCloseTo(2 * Math.PI * 10);
  });

  it("measures a perfect ellipse like a circle", () => {
    const ellipse = makeEl("ellipse", { rx: "10", ry: "10" });
    expect(getElementLength(ellipse)).toBeCloseTo(2 * Math.PI * 10);
  });

  it("sums the segments of a polyline (open)", () => {
    const polyline = makeEl("polyline", { points: "0,0 0,10 10,10" });
    expect(getElementLength(polyline)).toBeCloseTo(20);
  });

  it("closes the loop of a polygon", () => {
    const polygon = makeEl("polygon", { points: "0,0 0,10 10,10 10,0" });
    expect(getElementLength(polygon)).toBeCloseTo(40);
  });

  it("parses space-separated point lists", () => {
    const polyline = makeEl("polyline", { points: "0 0 0 10 10 10" });
    expect(getElementLength(polyline)).toBeCloseTo(20);
  });

  it("honours an explicit pathLength attribute over geometry", () => {
    const circle = makeEl("circle", { r: "5", pathLength: "100" });
    expect(getElementLength(circle)).toBe(100);
  });

  it("returns 0 for a path when getTotalLength is unavailable", () => {
    const path = makeEl("path", { d: "M0 0 L10 10" });
    expect(getElementLength(path)).toBe(0);
  });

  it("prefers a native getTotalLength when present", () => {
    const path = makeEl("path", { d: "M0 0 L10 0" });
    (path as unknown as { getTotalLength: () => number }).getTotalLength = () => 42;
    expect(getElementLength(path)).toBe(42);
  });

  it("falls back to geometry when getTotalLength throws", () => {
    const line = makeEl("line", { x1: "0", y1: "0", x2: "6", y2: "8" });
    (line as unknown as { getTotalLength: () => number }).getTotalLength = () => {
      throw new Error("not laid out");
    };
    expect(getElementLength(line)).toBeCloseTo(10);
  });
});

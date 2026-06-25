/**
 * Measure the total outline length of a drawable SVG element.
 *
 * Resolution order:
 *  1. An explicit `pathLength` attribute (the author has normalized the
 *     geometry, so dash values must be expressed in that same unit).
 *  2. The native `getTotalLength()` — exact, available on every
 *     `SVGGeometryElement` in real browsers.
 *  3. A geometric approximation derived from the element's attributes. This is
 *     the fallback used during SSR / in jsdom, where `getTotalLength()` does
 *     not exist. Paths cannot be measured this way and return `0`.
 *
 * @returns A non-negative length, or `0` when it cannot be determined.
 */
export function getElementLength(el: SVGElement): number {
  const pathLengthAttr = el.getAttribute?.("pathLength");
  if (pathLengthAttr != null && pathLengthAttr !== "") {
    const normalized = Number(pathLengthAttr);
    if (Number.isFinite(normalized) && normalized > 0) return normalized;
  }

  const geometry = el as SVGGeometryElement;
  if (typeof geometry.getTotalLength === "function") {
    try {
      const length = geometry.getTotalLength();
      if (Number.isFinite(length) && length > 0) return length;
    } catch {
      // jsdom and detached nodes throw — fall back to geometry below.
    }
  }

  return geometricLength(el);
}

/** Read a numeric attribute, returning `fallback` when missing or invalid. */
function attr(el: SVGElement, name: string, fallback = 0): number {
  const raw = el.getAttribute(name);
  if (raw == null || raw === "") return fallback;
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

/** Parse an SVG `points` list ("x,y x,y" or "x y x y") into coordinate pairs. */
function parsePoints(raw: string | null): Array<[number, number]> {
  if (!raw) return [];
  const numbers = raw
    .trim()
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => Number.isFinite(n));

  const points: Array<[number, number]> = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    points.push([numbers[i], numbers[i + 1]]);
  }
  return points;
}

/** Perimeter of a (possibly rounded) rectangle. */
function rectLength(el: SVGElement): number {
  const width = attr(el, "width");
  const height = attr(el, "height");
  if (width <= 0 || height <= 0) return 0;

  let rx = attr(el, "rx", NaN);
  let ry = attr(el, "ry", NaN);
  if (Number.isNaN(rx) && Number.isNaN(ry)) {
    rx = 0;
    ry = 0;
  } else {
    if (Number.isNaN(rx)) rx = ry;
    if (Number.isNaN(ry)) ry = rx;
  }
  rx = Math.min(Math.max(rx, 0), width / 2);
  ry = Math.min(Math.max(ry, 0), height / 2);

  const straight = 2 * (width - 2 * rx) + 2 * (height - 2 * ry);
  // Four quarter-corners add up to the circumference of one ellipse.
  const corners = rx > 0 && ry > 0 ? ellipsePerimeter(rx, ry) : 0;
  return straight + corners;
}

/** Ramanujan's approximation of an ellipse circumference. */
function ellipsePerimeter(rx: number, ry: number): number {
  if (rx <= 0 && ry <= 0) return 0;
  const h = Math.pow(rx - ry, 2) / Math.pow(rx + ry, 2);
  return Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

/** Total length of a polyline / polygon defined by a `points` list. */
function polyLength(el: SVGElement, closed: boolean): number {
  const points = parsePoints(el.getAttribute("points"));
  if (points.length < 2) return 0;

  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    total += Math.hypot(x2 - x1, y2 - y1);
  }
  if (closed) {
    const [fx, fy] = points[0];
    const [lx, ly] = points[points.length - 1];
    total += Math.hypot(fx - lx, fy - ly);
  }
  return total;
}

/** Approximate an element's outline length from its geometry attributes. */
function geometricLength(el: SVGElement): number {
  switch (el.tagName.toLowerCase()) {
    case "line": {
      const dx = attr(el, "x2") - attr(el, "x1");
      const dy = attr(el, "y2") - attr(el, "y1");
      return Math.hypot(dx, dy);
    }
    case "rect":
      return rectLength(el);
    case "circle":
      return 2 * Math.PI * Math.max(attr(el, "r"), 0);
    case "ellipse":
      return ellipsePerimeter(Math.max(attr(el, "rx"), 0), Math.max(attr(el, "ry"), 0));
    case "polyline":
      return polyLength(el, false);
    case "polygon":
      return polyLength(el, true);
    case "path":
    default:
      // A path's length cannot be derived from attributes alone.
      return 0;
  }
}

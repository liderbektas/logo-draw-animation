/**
 * Load an SVG from a URL. The file is fetched on the client and inlined so its
 * strokes can be measured and animated.
 */
import { SVGDraw } from "logo-draw-animation";

export function FromSrcExample() {
  return <SVGDraw src="/logo.svg" duration={1.5} easing="ease-in-out" size="50%" />;
}

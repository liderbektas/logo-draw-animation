/**
 * Basic usage: pass an SVG component (e.g. an SVGR import) and let it draw
 * itself on mount.
 */
import { SVGDraw } from "logo-draw-animation";
import Logo from "./logo.svg"; 

export function BasicExample() {
  return (
    <SVGDraw
      svg={Logo}
      duration={2}
      stagger={0.1}
      strokeColor="#ffffff"
      strokeWidth={1.5}
      size={240}
    />
  );
}

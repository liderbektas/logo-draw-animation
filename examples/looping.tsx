/**
 * A continuous draw / un-draw loop, drawn from the opposite end of each stroke.
 */
import { SVGDraw } from "logo-draw-animation";
import Logo from "./logo.svg";

export function LoopingExample() {
  return (
    <SVGDraw
      svg={Logo}
      duration={2.5}
      loop
      reverse
      strokeColor="#6466f1"
      easing="cubic-bezier(0.65, 0, 0.35, 1)"
    />
  );
}

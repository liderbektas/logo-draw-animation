/**
 * Drive the animation yourself with the low-level `useSvgDraw` hook. It returns
 * imperative controls (play / pause / reset / finish / replay) so you can wire
 * the draw animation to your own UI.
 */
import { useRef } from "react";
import { useSvgDraw } from "logo-draw-animation";

export function WithControlsExample() {
  const svgRef = useRef<SVGSVGElement>(null);
  const controls = useSvgDraw(svgRef, { duration: 2, autoplay: false });

  return (
    <div>
      <svg ref={svgRef} viewBox="0 0 120 60" fill="none">
        <rect x="2" y="2" width="116" height="56" rx="8" stroke="#111" strokeWidth="2" />
        <line x1="20" y1="30" x2="100" y2="30" stroke="#111" strokeWidth="2" />
      </svg>

      <div>
        <button onClick={controls.play}>Play</button>
        <button onClick={controls.pause}>Pause</button>
        <button onClick={controls.replay}>Replay</button>
        <button onClick={controls.reset}>Reset</button>
        <button onClick={controls.finish}>Finish</button>
      </div>
    </div>
  );
}

import { describe, it, expect } from "vitest";
import { useRef } from "react";
import { render } from "@testing-library/react";
import { useSvgDraw } from "../src/hooks/useSvgDraw";
import type { SvgDrawOptions } from "../src/types";

function Harness({ options }: { options?: SvgDrawOptions }) {
  const ref = useRef<SVGSVGElement>(null);
  useSvgDraw(ref, options);
  return (
    <svg ref={ref} viewBox="0 0 10 10" data-testid="svg">
      <rect x="0" y="0" width="10" height="10" data-testid="rect" />
    </svg>
  );
}

describe("useSvgDraw", () => {
  it("sets up a stroke-dash pattern sized to the element outline", () => {
    const { getByTestId } = render(<Harness />);
    const rect = getByTestId("rect") as SVGRectElement;
    // Perimeter of a 10x10 rectangle.
    expect(rect.style.strokeDasharray).toBe("40");
  });

  it("renders the fully-drawn state when no Web Animations API is available (jsdom)", () => {
    const { getByTestId } = render(<Harness />);
    const rect = getByTestId("rect") as SVGRectElement;
    expect(rect.style.strokeDashoffset).toBe("0");
  });

  it("applies an overridden stroke color and width", () => {
    const { getByTestId } = render(
      <Harness options={{ strokeColor: "#ff0000", strokeWidth: 3 }} />
    );
    const rect = getByTestId("rect") as SVGRectElement;
    expect(rect).toHaveStyle({ stroke: "#ff0000" });
    expect(rect.style.strokeWidth).toBe("3");
  });

  it("invokes onComplete when finished (instant draw path)", () => {
    let completed = false;
    render(<Harness options={{ onComplete: () => (completed = true) }} />);
    expect(completed).toBe(true);
  });

  it("returns imperative playback controls", () => {
    let controls: ReturnType<typeof useSvgDraw> | undefined;
    function Capture() {
      const ref = useRef<SVGSVGElement>(null);
      controls = useSvgDraw(ref);
      return (
        <svg ref={ref}>
          <circle r="5" />
        </svg>
      );
    }
    render(<Capture />);
    expect(controls).toMatchObject({
      play: expect.any(Function),
      pause: expect.any(Function),
      reset: expect.any(Function),
      finish: expect.any(Function),
      replay: expect.any(Function),
    });
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import type { SVGProps } from "react";
import { render, waitFor } from "@testing-library/react";
import { SVGDraw } from "../src/components/SVGDraw";

function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" {...props}>
      <circle cx="10" cy="10" r="10" />
    </svg>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SVGDraw", () => {
  it("renders an SVG passed as a component", () => {
    const { container } = render(<SVGDraw svg={Logo} />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("circle")).not.toBeNull();
  });

  it("forwards className to the wrapper element", () => {
    const { container } = render(<SVGDraw svg={Logo} className="my-logo" />);
    expect(container.firstElementChild).toHaveClass("my-logo");
  });

  it("sets up the draw animation on the rendered SVG", () => {
    const { container } = render(<SVGDraw svg={Logo} strokeColor="#ffffff" />);
    const circle = container.querySelector("circle") as SVGCircleElement;
    expect(circle.style.strokeDasharray).toBe(String(2 * Math.PI * 10));
    expect(circle).toHaveStyle({ stroke: "#ffffff" });
  });

  it("applies an explicit size to the wrapper", () => {
    const { container } = render(<SVGDraw svg={Logo} size={120} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe("120px");
    expect(wrapper.style.height).toBe("120px");
  });

  it("fetches and inlines an external SVG from src", async () => {
    const svgText =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve(svgText) }))
    );

    const { container } = render(<SVGDraw src="/logo.svg" />);

    await waitFor(() => {
      const rect = container.querySelector("rect") as SVGRectElement | null;
      expect(rect).not.toBeNull();
      expect(rect!.style.strokeDasharray).toBe("40");
    });

    expect(fetch).toHaveBeenCalledWith("/logo.svg");
  });
});

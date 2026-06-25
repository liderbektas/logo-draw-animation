"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useSvgDraw } from "../hooks/useSvgDraw";
import type { SVGDrawProps } from "../types";

function toCssSize(size: number | string | undefined): string | undefined {
  if (size == null) return undefined;
  return typeof size === "number" ? `${size}px` : size;
}

/**
 * Renders an SVG and animates it as if it were being drawn stroke-by-stroke.
 *
 * Provide the SVG either as a React component (`svg`) or as a URL to an `.svg`
 * file (`src`). All drawable elements (`path`, `circle`, `rect`, `ellipse`,
 * `polygon`, `polyline`, `line`) are discovered, measured, and animated
 * automatically.
 *
 * @example
 * ```tsx
 * import { SVGDraw } from "logo-draw-animation";
 * import Logo from "./logo.svg";
 *
 * <SVGDraw svg={Logo} duration={2} stagger={0.1} strokeColor="#ffffff" />;
 * ```
 */
export function SVGDraw({
  svg: SvgComponent,
  src,
  duration,
  delay,
  stagger,
  strokeColor,
  strokeWidth,
  size,
  easing,
  autoplay,
  loop,
  reverse,
  className,
  onStart,
  onComplete,
}: SVGDrawProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [markup, setMarkup] = useState<string | null>(null);

  // Fetch and inline an external SVG file. Client-only, so SSR is never blocked.
  useEffect(() => {
    if (!src) {
      setMarkup(null);
      return;
    }

    let active = true;
    fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load SVG (${response.status}): ${src}`);
        return response.text();
      })
      .then((text) => {
        if (active) setMarkup(text);
      })
      .catch(() => {
        if (active) setMarkup(null);
      });

    return () => {
      active = false;
    };
  }, [src]);

  useSvgDraw(
    containerRef,
    {
      duration,
      delay,
      stagger,
      strokeColor,
      strokeWidth,
      easing,
      autoplay,
      loop,
      reverse,
      onStart,
      onComplete,
    },
    [markup, SvgComponent]
  );

  // Stretch the inner <svg> to the wrapper when an explicit size is requested.
  useEffect(() => {
    if (size == null) return;
    const svgElement = containerRef.current?.querySelector("svg");
    if (!svgElement) return;
    svgElement.style.width = "100%";
    svgElement.style.height = "100%";
    svgElement.style.display = "block";
  }, [size, markup, SvgComponent]);

  const cssSize = toCssSize(size);
  const style: CSSProperties = {
    display: "inline-flex",
    width: cssSize,
    height: cssSize,
  };

  if (src) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={style}
        {...(markup ? { dangerouslySetInnerHTML: { __html: markup } } : {})}
      />
    );
  }

  return (
    <div ref={containerRef} className={className} style={style}>
      {SvgComponent ? <SvgComponent /> : null}
    </div>
  );
}

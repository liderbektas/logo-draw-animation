import type { ComponentType, SVGProps } from "react";

/**
 * SVG element tag names that expose a measurable outline and can therefore be
 * "stroke-drawn" by this library.
 */
export type DrawableTagName =
  | "path"
  | "circle"
  | "rect"
  | "ellipse"
  | "polygon"
  | "polyline"
  | "line";

/**
 * Low-level options shared by the {@link useSvgDraw} hook and the
 * {@link SVGDraw} component.
 */
export interface SvgDrawOptions {
  /** Draw duration per element, in seconds. @default 2 */
  duration?: number;
  /** Delay before the first element starts drawing, in seconds. @default 0 */
  delay?: number;
  /** Extra delay added per element, in seconds, to draw them in sequence. @default 0 */
  stagger?: number;
  /** Overrides the `stroke` color of every drawable element. */
  strokeColor?: string;
  /** Overrides the `stroke-width` of every drawable element. */
  strokeWidth?: number;
  /** CSS easing function for the draw animation. @default "ease" */
  easing?: string;
  /** Start drawing automatically once mounted. @default true */
  autoplay?: boolean;
  /** Loop the draw / un-draw animation forever. @default false */
  loop?: boolean;
  /** Draw from the opposite end of every stroke. @default false */
  reverse?: boolean;
  /** Called once when the animation starts playing. */
  onStart?: () => void;
  /** Called once when every element has finished drawing (never fires when `loop` is set). */
  onComplete?: () => void;
}

/**
 * Imperative handle returned by {@link useSvgDraw} for controlling playback.
 */
export interface SvgDrawControls {
  /** Resume / start the animation. */
  play: () => void;
  /** Pause the animation, keeping the current progress. */
  pause: () => void;
  /** Cancel the animation and return every stroke to its undrawn state. */
  reset: () => void;
  /** Jump to the end so the SVG is fully drawn. */
  finish: () => void;
  /** Restart the animation from the beginning. */
  replay: () => void;
}

/**
 * Props for the {@link SVGDraw} component.
 *
 * Provide exactly one source: a React component that renders an `<svg>` via the
 * `svg` prop (e.g. an SVGR import), or a URL to an `.svg` file via `src`.
 */
export interface SVGDrawProps extends SvgDrawOptions {
  /** A React component that renders an `<svg>` element (e.g. an SVGR import). */
  svg?: ComponentType<SVGProps<SVGSVGElement>>;
  /** URL of an external `.svg` file. Fetched and inlined on the client. */
  src?: string;
  /** Square size of the wrapper. Numbers are treated as pixels. */
  size?: number | string;
  /** Class applied to the wrapper element. */
  className?: string;
}

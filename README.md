# logo-draw-animation

> Turn **any** SVG into a self-drawing stroke animation — with one component.

`logo-draw-animation` discovers every drawable element in an SVG, measures its
outline, and animates `stroke-dashoffset` so the artwork appears to draw itself,
then stays fully drawn.

- 🪶 **Zero runtime dependencies** — uses the native [Web Animations API](https://developer.mozilla.org/docs/Web/API/Web_Animations_API), no GSAP required.
- 🧩 **Works with any SVG** — `path`, `circle`, `rect`, `ellipse`, `polygon`, `polyline`, `line`.
- ⚛️ **React + TypeScript** — fully typed, ships ESM **and** CJS.
- 🌳 **Tree-shakable** (`sideEffects: false`).
- 🖥️ **SSR-safe** — all DOM work runs on the client; nothing breaks during server rendering.
- ♿ **Respects `prefers-reduced-motion`** — renders the finished drawing instantly.

---

## Installation

```bash
npm install logo-draw-animation
# or
pnpm add logo-draw-animation
# or
yarn add logo-draw-animation
```

React **17, 18, or 19** is a peer dependency.

---

## Quick start

### From an SVG component

Pass any component that renders an `<svg>` (for example an
[SVGR](https://react-svgr.com/) import):

```tsx
import { SVGDraw } from "logo-draw-animation";
import Logo from "./logo.svg";

export default function App() {
  return <SVGDraw svg={Logo} duration={2} stagger={0.1} strokeColor="#ffffff" />;
}
```

### From a URL

```tsx
import { SVGDraw } from "logo-draw-animation";

export default function App() {
  return <SVGDraw src="/logo.svg" duration={1.5} />;
}
```

The file is fetched on the client and inlined so its strokes can be measured.

---

## How it works

1. The SVG is rendered (from the `svg` component or fetched via `src`).
2. Every drawable element inside it is collected.
3. Each element's outline length is measured with `getTotalLength()` (with a
   geometric fallback, and respect for an explicit `pathLength`).
4. `stroke-dasharray` and `stroke-dashoffset` are set so the stroke is hidden.
5. `stroke-dashoffset` is animated to `0`, revealing the stroke as if drawn.
6. The SVG remains in its fully-drawn state.

> **Note** — the draw effect animates _strokes_. Make sure the elements you want
> to draw have a visible stroke (set one on the SVG, or use the `strokeColor` /
> `strokeWidth` props).

---

## Props

`SVGDraw` accepts the following props:

| Prop          | Type               | Default  | Description                                                    |
| ------------- | ------------------ | -------- | -------------------------------------------------------------- |
| `svg`         | `ComponentType`    | —        | A component that renders an `<svg>`. **Either this or `src`.** |
| `src`         | `string`           | —        | URL of an `.svg` file, fetched and inlined on the client.      |
| `duration`    | `number`           | `2`      | Draw duration per element, in **seconds**.                     |
| `delay`       | `number`           | `0`      | Delay before drawing starts, in seconds.                       |
| `stagger`     | `number`           | `0`      | Extra delay per element, in seconds (draws them in sequence).  |
| `strokeColor` | `string`           | —        | Overrides every element's `stroke` color.                      |
| `strokeWidth` | `number`           | —        | Overrides every element's `stroke-width`.                      |
| `size`        | `number \| string` | —        | Square size of the wrapper. Numbers are pixels.                |
| `easing`      | `string`           | `"ease"` | CSS easing function for the animation.                         |
| `autoplay`    | `boolean`          | `true`   | Start drawing automatically on mount.                          |
| `loop`        | `boolean`          | `false`  | Loop the draw / un-draw animation forever.                     |
| `reverse`     | `boolean`          | `false`  | Draw from the opposite end of each stroke.                     |
| `className`   | `string`           | —        | Class applied to the wrapper element.                          |
| `onStart`     | `() => void`       | —        | Fired once when the animation starts.                          |
| `onComplete`  | `() => void`       | —        | Fired once when drawing finishes (never fires while `loop`).   |

---

## The `useSvgDraw` hook

For full control, use the hook directly. It animates whatever SVG lives inside
the ref and returns imperative controls.

```tsx
import { useRef } from "react";
import { useSvgDraw } from "logo-draw-animation";

function Logo() {
  const ref = useRef<SVGSVGElement>(null);
  const { play, pause, reset, finish, replay } = useSvgDraw(ref, {
    duration: 2,
    autoplay: false,
  });

  return (
    <>
      <svg ref={ref} viewBox="0 0 120 60" fill="none">
        <rect x="2" y="2" width="116" height="56" rx="8" stroke="#111" strokeWidth="2" />
      </svg>
      <button onClick={play}>Play</button>
      <button onClick={replay}>Replay</button>
    </>
  );
}
```

```ts
function useSvgDraw<T extends Element>(
  ref: RefObject<T | null>,
  options?: SvgDrawOptions,
  deps?: DependencyList
): SvgDrawControls;
```

- **`ref`** — points to the wrapper or `<svg>` that contains the artwork.
- **`options`** — same animation options as the component (everything except
  `svg`, `src`, `size`, `className`).
- **`deps`** — extra dependencies that re-initialize the animation when they
  change. Pass this when the SVG markup itself changes (e.g. after an async load).

### Controls (`SvgDrawControls`)

| Method     | Effect                                    |
| ---------- | ----------------------------------------- |
| `play()`   | Start / resume the animation.             |
| `pause()`  | Pause, keeping the current progress.      |
| `reset()`  | Return every stroke to its undrawn state. |
| `finish()` | Jump to the end (fully drawn).            |
| `replay()` | Restart from the beginning.               |

---

## Utilities

The measuring helpers are exported too, in case you want to build your own
animation:

```ts
import { getDrawableElements, getElementLength, DRAWABLE_TAGS } from "logo-draw-animation";

const elements = getDrawableElements(svgElement); // SVGElement[]
const length = getElementLength(elements[0]); // number
```

---

## Accessibility

When the user has `prefers-reduced-motion: reduce` enabled, the SVG is rendered
in its final, fully-drawn state immediately — no animation is played.

---

## Server-side rendering

The component renders markup on the server and performs all measuring and
animation on the client inside a layout effect, so it is safe to use in
Next.js (App or Pages Router), Remix, and other SSR frameworks. The bundle is
marked `"use client"` for the Next.js App Router.

---

## Browser support

Animations use the Web Animations API, supported in all modern browsers. Where
it is unavailable, the SVG is shown fully drawn (no animation) as a graceful
fallback.

---

## License

[MIT](./LICENSE) © Lider Bektaş

# logo-draw-animation

> Turn **any** SVG into a self-drawing stroke animation — with one component.

`logo-draw-animation` discovers every drawable element in an SVG, measures its
outline, and animates `stroke-dashoffset` so the artwork appears to draw itself,
then stays fully drawn.

- 🪶 **Zero runtime dependencies** — uses the native [Web Animations API](https://developer.mozilla.org/docs/Web/API/Web_Animations_API), no GSAP required.
- **Works with any SVG** — `path`, `circle`, `rect`, `ellipse`, `polygon`, `polyline`, `line`.
- **React + TypeScript** — fully typed, ships ESM **and** CJS.
- **Tree-shakable** (`sideEffects: false`).
- **SSR-safe** — all DOM work runs on the client; nothing breaks during server rendering.
- **Respects `prefers-reduced-motion`** — renders the finished drawing instantly.

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

## Composing after the draw — sheen, masks, fills (no React state)

`useSvgDraw` does **one** job: it draws the strokes and tells you when it's
finished. Everything that comes _after_ the draw — filling the shapes in, a
sheen sweep, a mask reveal, fading a loading overlay out — is yours to compose.
And you can do all of it **without a single `useState`**.

Think of it as two phases:

1. **The draw** — the package's job. It animates `stroke-dashoffset` and fires
   `onComplete` once every stroke is done.
2. **Your composition** — everything after. You trigger it from `onComplete`.

The trick: GSAP, [Motion](https://motion.dev), and the browser's native
[Web Animations API](https://developer.mozilla.org/docs/Web/API/Web_Animations_API)
are all **imperative** — they grab a DOM node and animate it directly, _outside_
React's render cycle. So you never need React state to _drive_ them. Your trigger
is `onComplete`; your handle is a `ref`. The `useState` you'd normally reach for
exists only to bridge "React state → CSS class" — and here you skip that bridge
entirely.

> **No conflict by design.** `useSvgDraw` only animates `stroke-dashoffset`. As
> long as your follow-up effects touch _other_ properties (`fill-opacity`,
> `opacity`, `transform`, `mask`) or _other_ layers, they compose cleanly on top
> of the finished drawing.

### Example: draw → fill in → fade out, with zero state

A loading overlay that draws a logo, fills it in, then fades itself away — no
`drawn` / `exiting` flags anywhere:

```tsx
"use client";
import { useRef } from "react";
import { useSvgDraw } from "logo-draw-animation";

export default function Loader({ onDone }: { onDone: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useSvgDraw(svgRef, {
    duration: 2,
    stagger: 0.25,
    easing: "ease-in-out",
    onComplete: () => {
      // Phase 2a — fill each shape in (imperative, no state)
      svgRef.current?.querySelectorAll<SVGPathElement>("path").forEach((path) => {
        const target = Number(path.dataset.fill ?? 1);
        path.animate(
          [
            { fillOpacity: 0, strokeOpacity: 1 },
            { fillOpacity: target, strokeOpacity: 0 },
          ],
          { duration: 700, easing: "ease-out", fill: "both" }
        );
      });

      // Phase 2b — fade the overlay out, then unmount
      window.setTimeout(() => {
        overlayRef.current
          ?.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 700,
            easing: "ease-out",
            fill: "both",
          })
          .finished.then(onDone);
      }, 600);
    },
  });

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
      }}
    >
      <svg ref={svgRef} viewBox="0 0 125 74" fill="none" width={240}>
        <path data-fill="0.9" fillOpacity={0} stroke="#ffffff" fill="#ffffff" d="…" />
        <path data-fill="1" fillOpacity={0} stroke="#6466f1" fill="#6466f1" d="…" />
      </svg>
    </div>
  );
}
```

Each path starts hidden (`fillOpacity={0}`) and remembers its final value in a
`data-fill` attribute — static markup, no state. The fill reveal and the overlay
fade are plain Web Animations API calls. The only thing that changes React-side
is unmounting (`onDone()` from a parent or store), which is unavoidable and is
_not_ component state.

### Same pattern, your animation library

`onComplete` is just a function — drop in whatever you already use (both snippets
share the same `svgRef` / `overlayRef` / `onDone` as above):

```tsx
// GSAP
import gsap from "gsap";

useSvgDraw(svgRef, {
  onComplete: () => {
    gsap
      .timeline({ onComplete: onDone })
      .to(svgRef.current!.querySelectorAll("path"), {
        fillOpacity: 1,
        strokeOpacity: 0,
        duration: 0.7,
      })
      .to(overlayRef.current, { opacity: 0, duration: 0.7 }, "+=0.3");
  },
});
```

```tsx
// Motion (motion / framer-motion)
import { animate } from "motion";

useSvgDraw(svgRef, {
  onComplete: async () => {
    const paths = svgRef.current!.querySelectorAll("path");
    await animate(paths, { fillOpacity: 1, strokeOpacity: 0 }, { duration: 0.7 }).finished;
    await animate(overlayRef.current!, { opacity: 0 }, { duration: 0.7 }).finished;
    onDone();
  },
});
```

For a **sheen**, animate a moving `linear-gradient` (or a translating highlight
layer) over the SVG; for a **mask reveal**, animate `mask-position` or a
`<mask>`'s geometry. Same handoff point, same rule every time: trigger it in
`onComplete`, animate imperatively, keep your component state-free.

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

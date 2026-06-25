# Examples

Runnable-style snippets for `logo-draw-animation`. They import from the package
name (`logo-draw-animation`) as a consumer would.

| File                                       | What it shows                                      |
| ------------------------------------------ | -------------------------------------------------- |
| [`basic.tsx`](./basic.tsx)                 | Draw an SVG component on mount                     |
| [`from-src.tsx`](./from-src.tsx)           | Fetch and draw an SVG from a URL                   |
| [`looping.tsx`](./looping.tsx)             | Continuous loop + reverse direction                |
| [`with-controls.tsx`](./with-controls.tsx) | Manual play/pause/replay via the `useSvgDraw` hook |

> The `./logo.svg` imports assume an SVG-to-React transform in your bundler
> (e.g. [`vite-plugin-svgr`](https://github.com/pd4d10/vite-plugin-svgr) or
> [`@svgr/webpack`](https://react-svgr.com/)).

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { DependencyList, RefObject } from "react";
import { getDrawableElements } from "../utils/getDrawableElements";
import { getElementLength } from "../utils/getElementLength";
import type { SvgDrawControls, SvgDrawOptions } from "../types";

/** `useLayoutEffect` on the client, `useEffect` on the server (avoids the SSR warning). */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const DEFAULT_DURATION = 2;
const DEFAULT_EASING = "ease";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function supportsWebAnimations(): boolean {
  return typeof Element !== "undefined" && typeof Element.prototype.animate === "function";
}

/**
 * Drive a stroke-draw animation over every drawable element inside `ref`.
 *
 * The hook is SSR-safe: all DOM work happens in a layout effect that only runs
 * in the browser. When the Web Animations API is unavailable (SSR fallback,
 * very old browsers) or the user prefers reduced motion, the SVG is rendered in
 * its final, fully-drawn state without animating.
 *
 * @param ref   Ref to the wrapper (or `<svg>`) that contains the SVG.
 * @param options Draw options (duration, stagger, colors, playback flags…).
 * @param deps  Extra dependencies that, when changed, re-initialize the
 *   animation — pass this when the SVG markup itself changes (e.g. after an
 *   async `src` fetch resolves).
 */
export function useSvgDraw<T extends Element>(
  ref: RefObject<T | null>,
  options: SvgDrawOptions = {},
  deps: DependencyList = []
): SvgDrawControls {
  const {
    duration = DEFAULT_DURATION,
    delay = 0,
    stagger = 0,
    strokeColor,
    strokeWidth,
    easing = DEFAULT_EASING,
    autoplay = true,
    loop = false,
    reverse = false,
    onStart,
    onComplete,
  } = options;

  const animationsRef = useRef<Animation[]>([]);
  const callbacksRef = useRef({ onStart, onComplete });
  callbacksRef.current = { onStart, onComplete };

  const play = useCallback(() => {
    animationsRef.current.forEach((animation) => animation.play());
  }, []);

  const pause = useCallback(() => {
    animationsRef.current.forEach((animation) => animation.pause());
  }, []);

  const reset = useCallback(() => {
    animationsRef.current.forEach((animation) => animation.cancel());
  }, []);

  const finish = useCallback(() => {
    animationsRef.current.forEach((animation) => {
      try {
        animation.finish();
      } catch {
        // `finish()` throws on infinite animations — ignore.
      }
    });
  }, []);

  const replay = useCallback(() => {
    animationsRef.current.forEach((animation) => {
      animation.currentTime = 0;
      animation.play();
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const elements = getDrawableElements(root);
    if (elements.length === 0) return;

    const instant = prefersReducedMotion() || !supportsWebAnimations();
    const animations: Animation[] = [];

    elements.forEach((element, index) => {
      const style = element.style;

      if (strokeColor != null) style.stroke = strokeColor;
      if (strokeWidth != null) style.strokeWidth = String(strokeWidth);

      const length = getElementLength(element);
      if (length <= 0) return; // nothing measurable to draw (e.g. a path in jsdom)

      style.strokeDasharray = String(length);

      if (instant) {
        // Reduced motion / no Web Animations API: show the finished drawing.
        style.strokeDashoffset = "0";
        return;
      }

      const from = reverse ? -length : length;
      style.strokeDashoffset = String(from);

      const animation = element.animate([{ strokeDashoffset: from }, { strokeDashoffset: 0 }], {
        duration: Math.max(0, duration * 1000),
        delay: Math.max(0, (delay + index * stagger) * 1000),
        easing,
        fill: "both",
        iterations: loop ? Infinity : 1,
        direction: loop ? "alternate" : "normal",
      });

      if (!autoplay) animation.pause();
      animations.push(animation);
    });

    animationsRef.current = animations;

    if (instant) {
      callbacksRef.current.onStart?.();
      callbacksRef.current.onComplete?.();
      return;
    }

    if (autoplay && animations.length > 0) {
      callbacksRef.current.onStart?.();
    }

    if (!loop && animations.length > 0) {
      let finishedCount = 0;
      const expected = animations.length;
      animations.forEach((animation) => {
        animation.onfinish = () => {
          finishedCount += 1;
          if (finishedCount >= expected) callbacksRef.current.onComplete?.();
        };
      });
    }

    return () => {
      animations.forEach((animation) => {
        try {
          animation.cancel();
        } catch {
          // ignore
        }
      });
      animationsRef.current = [];
    };
  }, [
    ref,
    duration,
    delay,
    stagger,
    strokeColor,
    strokeWidth,
    easing,
    autoplay,
    loop,
    reverse,
    ...deps,
  ]);

  return { play, pause, reset, finish, replay };
}

"use client";

import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export interface SceneContext {
  ctx: CanvasRenderingContext2D;
  /** Backing-store width in device pixels. */
  width: number;
  /** Backing-store height in device pixels. */
  height: number;
  /** Capped device pixel ratio. */
  dpr: number;
}

export interface SceneHandle {
  /** Called on mount and whenever the canvas is resized. */
  resize?: (scene: SceneContext) => void;
  /** Called once per animation frame. `elapsed` is seconds since start. */
  frame: (scene: SceneContext, elapsed: number) => void;
  /**
   * Put the scene straight into its rest state, skipping the simulation.
   * Required for reduced motion, where a single frame of a spring system would
   * otherwise paint the scattered starting positions and stop there.
   */
  settle?: (scene: SceneContext) => void;
  /** Called on unmount. */
  destroy?: () => void;
}

interface Options {
  /** Build the scene once the canvas exists. */
  setup: (canvas: HTMLCanvasElement, scene: SceneContext) => SceneHandle;
  /** Skip the animation loop entirely and draw a single settled frame. */
  paused?: boolean;
  /** Cap the device pixel ratio — 2 is plenty for line art. */
  maxDpr?: number;
  /**
   * Rebuild the scene when this changes. Needed for inputs baked into `setup`
   * itself — a node budget, say — which no amount of ref-freshness can apply to
   * an already-constructed scene.
   */
  resetKey?: string | number;
}

/**
 * Owns the whole canvas lifecycle: DPR-aware sizing via ResizeObserver, a single
 * rAF loop that stops when the canvas scrolls out of view or the tab is hidden,
 * and deterministic teardown of every listener it creates.
 */
export function useCanvasScene<T extends HTMLCanvasElement>({
  setup,
  paused = false,
  maxDpr = 2,
  resetKey,
}: Options) {
  const ref = useRef<T>(null);
  const setupRef = useRef(setup);
  // Layout effects flush before passive ones, so the scene effect below always
  // reads the current closure without taking `setup` as a dependency and
  // tearing the canvas down on every render.
  useIsomorphicLayoutEffect(() => {
    setupRef.current = setup;
  });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const scene: SceneContext = { ctx, width: 0, height: 0, dpr: 1 };
    let raf = 0;
    let visible = true;
    let running = false;
    // Elapsed time is accumulated so pausing off-screen never makes the scene jump.
    let elapsed = 0;
    let last = 0;

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (w === scene.width && h === scene.height && dpr === scene.dpr) return false;
      canvas.width = w;
      canvas.height = h;
      scene.width = w;
      scene.height = h;
      scene.dpr = dpr;
      return true;
    };

    measure();
    const handle = setupRef.current(canvas, scene);
    handle.resize?.(scene);

    const loop = (now: number) => {
      elapsed += Math.min(now - last, 100) / 1000;
      last = now;
      handle.frame(scene, elapsed);
      raf = requestAnimationFrame(loop);
    };

    const play = () => {
      if (running || paused || !visible) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) play();
        else stop();
      },
      { rootMargin: '120px' },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) play();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const drawStill = () => {
      if (paused) handle.settle?.(scene);
      handle.frame(scene, elapsed);
    };

    const ro = new ResizeObserver(() => {
      if (measure()) {
        handle.resize?.(scene);
        if (!running) drawStill();
      }
    });
    ro.observe(canvas);

    if (paused) {
      // Reduced motion: draw the settled composition once, then stay still.
      elapsed = 999;
      drawStill();
    } else {
      play();
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      handle.destroy?.();
    };
  }, [paused, maxDpr, resetKey]);

  return ref;
}

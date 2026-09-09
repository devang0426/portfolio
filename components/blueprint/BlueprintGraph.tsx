"use client";

import { useCallback, useRef, useState } from "react";
import { useCanvasScene, type SceneContext } from "@/lib/useCanvasScene";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Target position for the current layout. */
  tx: number;
  ty: number;
}

/** The DS monogram, plotted by hand in 0–1 space. */
const MONOGRAM: [number, number][] = [
  // D — stem then bowl
  ...Array.from({ length: 6 }, (_, i) => [0.18, 0.2 + i * 0.12] as [number, number]),
  [0.3, 0.2],
  [0.4, 0.26],
  [0.45, 0.4],
  [0.45, 0.6],
  [0.4, 0.74],
  [0.3, 0.8],
  // S
  [0.85, 0.24],
  [0.72, 0.2],
  [0.6, 0.28],
  [0.62, 0.42],
  [0.74, 0.5],
  [0.84, 0.58],
  [0.82, 0.72],
  [0.7, 0.8],
  [0.58, 0.76],
];

/** The same points, rearranged into a service architecture. */
const ARCHITECTURE: [number, number][] = [
  [0.2, 0.2], [0.5, 0.15], [0.8, 0.2],
  [0.15, 0.5], [0.5, 0.45], [0.85, 0.5],
  [0.25, 0.8], [0.5, 0.85], [0.75, 0.8],
  [0.35, 0.32], [0.65, 0.32], [0.35, 0.65], [0.65, 0.65],
  [0.5, 0.3], [0.5, 0.62], [0.3, 0.5], [0.7, 0.5],
  [0.42, 0.75], [0.58, 0.75], [0.42, 0.22], [0.58, 0.22],
];

const LAYOUTS = [MONOGRAM, ARCHITECTURE];
const GRAB_RADIUS = 0.06;

interface Props {
  onModeChange?: (mode: number) => void;
}

/**
 * The Blueprint hero drawing: a spring-relaxed graph that reads as the DS
 * monogram, and re-routes into a service architecture when you click it. Nodes
 * can be dragged out of place; the springs pull the drawing back together.
 * Edges are recomputed each frame as a two-nearest-neighbour mesh, so a dragged
 * node genuinely rewires the diagram rather than stretching fixed lines.
 */
export function BlueprintGraph({ onModeChange }: Props) {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState(0);
  const modeRef = useRef(0);
  const nodesRef = useRef<Node[]>([]);

  const applyLayout = useCallback((next: number) => {
    const layout = LAYOUTS[next];
    for (let i = 0; i < nodesRef.current.length; i++) {
      const [x, y] = layout[i % layout.length];
      nodesRef.current[i].tx = x;
      nodesRef.current[i].ty = y;
    }
    modeRef.current = next;
    setMode(next);
    onModeChange?.(next);
  }, [onModeChange]);

  const canvasRef = useCanvasScene<HTMLCanvasElement>({
    paused: reduced,
    // Paused scenes do not animate toward a new layout, so a re-route under
    // reduced motion rebuilds and settles straight into it instead.
    resetKey: reduced ? mode : undefined,
    setup: (canvas) => {
      const count = MONOGRAM.length;
      const layout = LAYOUTS[modeRef.current];
      const nodes: Node[] = MONOGRAM.map((_, i) => layout[i % layout.length]).map(([x, y]) => ({
        x: Math.random(),
        y: Math.random(),
        vx: 0,
        vy: 0,
        tx: x,
        ty: y,
      }));
      nodesRef.current = nodes;

      let dragging: Node | null = null;
      let dragMoved = false;

      const toLocal = (event: PointerEvent) => {
        const box = canvas.getBoundingClientRect();
        return [
          (event.clientX - box.left) / box.width,
          (event.clientY - box.top) / box.height,
        ] as const;
      };

      const onPointerDown = (event: PointerEvent) => {
        const [x, y] = toLocal(event);
        dragMoved = false;
        let best: Node | null = null;
        let bestDistance = GRAB_RADIUS;
        for (const node of nodes) {
          const distance = Math.hypot(node.x - x, node.y - y);
          if (distance < bestDistance) {
            best = node;
            bestDistance = distance;
          }
        }
        dragging = best;
        if (dragging) canvas.setPointerCapture(event.pointerId);
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!dragging) return;
        event.preventDefault();
        const [x, y] = toLocal(event);
        dragging.x = x;
        dragging.y = y;
        dragging.vx = 0;
        dragging.vy = 0;
        dragMoved = true;
      };

      const onPointerUp = () => {
        // A click that never moved is a re-route request, not a drag.
        if (!dragMoved) applyLayout(1 - modeRef.current);
        dragging = null;
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);

      // Colours are read from the live token values so the paper/ink toggle
      // repaints the drawing without rebuilding the scene.
      const styles = getComputedStyle(canvas);
      const readToken = (name: string) => styles.getPropertyValue(name).trim();

      let packet = 0;

      const frame = ({ ctx, width, height, dpr }: SceneContext, elapsed: number) => {
        const ease = 1 - Math.pow(1 - Math.min(1, elapsed / 1.4), 3);
        const ink = readToken("--foreground");
        const blue = readToken("--accent");
        const orange = readToken("--accent-secondary");

        ctx.clearRect(0, 0, width, height);

        for (const node of nodes) {
          if (node === dragging) continue;
          node.vx += (node.tx - node.x) * 0.03 * ease;
          node.vy += (node.ty - node.y) * 0.03 * ease;
          node.vx *= 0.86;
          node.vy *= 0.86;
          node.x += node.vx;
          node.y += node.vy;
        }

        // Two nearest neighbours per node, de-duplicated into undirected edges.
        const edges: [number, number][] = [];
        for (let i = 0; i < count; i++) {
          let first = -1;
          let second = -1;
          let firstDistance = Infinity;
          let secondDistance = Infinity;
          for (let j = 0; j < count; j++) {
            if (i === j) continue;
            const distance = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
            if (distance < firstDistance) {
              secondDistance = firstDistance;
              second = first;
              firstDistance = distance;
              first = j;
            } else if (distance < secondDistance) {
              secondDistance = distance;
              second = j;
            }
          }
          if (first > i) edges.push([i, first]);
          if (second > i) edges.push([i, second]);
        }

        ctx.lineWidth = dpr;
        ctx.strokeStyle = ink;
        ctx.globalAlpha = 0.55 * ease;
        ctx.beginPath();
        for (const [i, j] of edges) {
          ctx.moveTo(nodes[i].x * width, nodes[i].y * height);
          ctx.lineTo(nodes[j].x * width, nodes[j].y * height);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        for (let i = 0; i < count; i++) {
          const hub = i % 5 === 0;
          ctx.fillStyle = hub ? blue : ink;
          ctx.beginPath();
          ctx.arc(
            nodes[i].x * width,
            nodes[i].y * height,
            (hub ? 5 : 3.5) * dpr,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }

        // One packet walks the mesh, edge by edge — the diagram is running.
        if (edges.length) {
          packet = (packet + 0.006) % edges.length;
          const [i, j] = edges[Math.floor(packet)];
          const t = packet % 1;
          ctx.fillStyle = orange;
          ctx.beginPath();
          ctx.arc(
            (nodes[i].x + (nodes[j].x - nodes[i].x) * t) * width,
            (nodes[i].y + (nodes[j].y - nodes[i].y) * t) * height,
            4 * dpr,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      };

      return {
        frame,
        settle: () => {
          for (const node of nodes) {
            node.x = node.tx;
            node.y = node.ty;
            node.vx = node.vy = 0;
          }
        },
        destroy: () => {
          canvas.removeEventListener("pointerdown", onPointerDown);
          canvas.removeEventListener("pointermove", onPointerMove);
          canvas.removeEventListener("pointerup", onPointerUp);
          canvas.removeEventListener("pointercancel", onPointerUp);
        },
      };
    },
  });

  return (
    <>
      <canvas ref={canvasRef} className="bp-graph__canvas" aria-hidden="true" />
      {/* The drawing is decorative, but its one meaningful action is not:
          this button exposes the re-route to keyboards and screen readers. */}
      <button
        type="button"
        className="bp-graph__reroute"
        onClick={() => applyLayout(1 - mode)}
      >
        {mode === 0 ? "re-route to architecture" : "re-route to monogram"}
      </button>
    </>
  );
}

"use client";

import { useCanvasScene, type SceneContext } from "@/lib/useCanvasScene";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { signalTokens } from "@/aesthetics/signal/tokens";

interface Node {
  /** Drift target, in 0–1 space. */
  tx: number;
  ty: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Radius in CSS pixels. */
  r: number;
  /** Hot nodes render in the accent colour. */
  hot: boolean;
}

/** Link distance in normalised units — kept generous enough to read as a mesh. */
const LINK_DISTANCE = 0.09;
const POINTER_RADIUS = 0.12;

interface Props {
  /** Node budget; the caller lowers it on small screens. */
  count?: number;
  className?: string;
}

/**
 * The Signal hero field: a self-assembling mesh that settles into a drift and
 * parts around the pointer. Canvas 2D rather than WebGL — this is a few hundred
 * lines and dots, and a GPU scene would cost far more than it returns.
 */
export function SignalNetwork({ count = 160, className }: Props) {
  const reduced = useReducedMotion();

  const canvasRef = useCanvasScene<HTMLCanvasElement>({
    paused: reduced,
    resetKey: count,
    setup: (canvas) => {
      const nodes: Node[] = Array.from({ length: count }, () => ({
        tx: Math.random(),
        ty: Math.random(),
        // Nodes fly in from outside the frame and assemble.
        x: Math.random() * 3 - 1,
        y: Math.random() * 3 - 1,
        vx: 0,
        vy: 0,
        r: Math.random() < 0.08 ? 3 : 1.6,
        hot: Math.random() < 0.06,
      }));

      const pointer = { x: -1e4, y: -1e4, active: false };
      const host = canvas.parentElement ?? canvas;

      const onPointerMove = (event: PointerEvent) => {
        const box = canvas.getBoundingClientRect();
        pointer.x = (event.clientX - box.left) / box.width;
        pointer.y = (event.clientY - box.top) / box.height;
        pointer.active = true;
      };
      const onPointerLeave = () => {
        pointer.active = false;
        pointer.x = pointer.y = -1e4;
      };

      host.addEventListener("pointermove", onPointerMove, { passive: true });
      host.addEventListener("pointerleave", onPointerLeave);
      host.addEventListener("pointercancel", onPointerLeave);

      const frame = ({ ctx, width, height, dpr }: SceneContext, elapsed: number) => {
        // 1.4s assembly, eased so the mesh snaps into place rather than sliding.
        const assemble = Math.min(1, elapsed / 1.4);
        const ease = 1 - Math.pow(1 - assemble, 3);

        ctx.clearRect(0, 0, width, height);

        for (const node of nodes) {
          node.vx += (node.tx - node.x) * 0.02 * ease;
          node.vy += (node.ty - node.y) * 0.02 * ease;

          if (pointer.active) {
            const dx = node.x - pointer.x;
            const dy = node.y - pointer.y;
            const distance = Math.hypot(dx, dy);
            if (distance < POINTER_RADIUS && distance > 1e-4) {
              node.vx += (dx / distance) * 0.004;
              node.vy += (dy / distance) * 0.004;
            }
          }

          node.vx *= 0.9;
          node.vy *= 0.9;
          node.x += node.vx;
          node.y += node.vy;

          // Slow organic drift of the targets themselves.
          node.tx += Math.sin(elapsed * 0.3 + node.ty * 9) * 0.00015;
          node.ty += Math.cos(elapsed * 0.25 + node.tx * 7) * 0.00015;
        }

        ctx.lineWidth = dpr * 0.6;
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j];
            const dx = a.x - b.x;
            // Cheap rejection before the square root.
            if (dx > LINK_DISTANCE || dx < -LINK_DISTANCE) continue;
            const dy = a.y - b.y;
            if (dy > LINK_DISTANCE || dy < -LINK_DISTANCE) continue;
            const distance = Math.hypot(dx, dy);
            if (distance >= LINK_DISTANCE) continue;
            ctx.strokeStyle = `rgba(242,242,239,${(1 - distance / LINK_DISTANCE) * 0.22 * ease})`;
            ctx.beginPath();
            ctx.moveTo(a.x * width, a.y * height);
            ctx.lineTo(b.x * width, b.y * height);
            ctx.stroke();
          }
        }

        for (const node of nodes) {
          ctx.fillStyle = node.hot ? signalTokens.accent : "rgba(242,242,239,0.75)";
          ctx.beginPath();
          ctx.arc(node.x * width, node.y * height, node.r * dpr, 0, Math.PI * 2);
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
          host.removeEventListener("pointermove", onPointerMove);
          host.removeEventListener("pointerleave", onPointerLeave);
          host.removeEventListener("pointercancel", onPointerLeave);
        },
      };
    },
  });

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

"use client";

import { useRef, useState } from "react";
import { useAesthetic, useCommittedAesthetic } from "@/lib/aesthetic-context";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";
import type { Aesthetic } from "@/aesthetics/types";

const OPTIONS: { value: Aesthetic; label: string }[] = [
  { value: "signal", label: "Signal" },
  { value: "blueprint", label: "Blueprint" },
];

const ARROWS = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

/**
 * A real radiogroup: arrow keys move between the two identities, Enter/Space
 * commits, and the current one is announced rather than merely coloured in.
 *
 * Underneath it sits a small arrow pointing at the option you are *not* on. Two
 * words in a corner is not much of an invitation, and the second identity is
 * the most surprising thing on this site — the arrow is the difference between
 * a visitor meeting one design and meeting both. It flips sides when you
 * switch, so it always names the door you have not opened.
 */
export function AestheticSwitcher() {
  const { isTransitioning, setAesthetic } = useAesthetic();
  // The control reflects the choice the moment it is made, even though the
  // visuals take another second to finish arriving.
  const selected = useCommittedAesthetic();
  const buttons = useRef(new Map<Aesthetic, HTMLButtonElement>());
  const dockRef = useRef<HTMLDivElement>(null);

  /** The one you are not on. The arrow points here. */
  const target: Aesthetic = selected === "signal" ? "blueprint" : "signal";
  const [pointX, setPointX] = useState<number | null>(null);

  /* Measured rather than guessed at. "Signal" and "Blueprint" are different
     widths, so there is no percentage that puts the arrow under both of them —
     and the labels are set in a webfont, which moves those widths again the
     moment it lands. */
  useIsomorphicLayoutEffect(() => {
    const measure = () => {
      const dock = dockRef.current;
      const button = buttons.current.get(target);
      if (!dock || !button) return;
      const dockBox = dock.getBoundingClientRect();
      const buttonBox = button.getBoundingClientRect();
      setPointX(buttonBox.left - dockBox.left + buttonBox.width / 2);
    };

    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [target]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!ARROWS.includes(event.key)) return;
    event.preventDefault();
    const next: Aesthetic = selected === "signal" ? "blueprint" : "signal";
    setAesthetic(next);
    // A roving tabindex is about to move to the other option; focus has to
    // follow it, or the keyboard lands on a control no longer in the tab order.
    buttons.current.get(next)?.focus();
  };

  return (
    <div className="switcher-dock" ref={dockRef}>
      <div
        className="switcher"
        role="radiogroup"
        aria-label="Change your aesthetics"
        onKeyDown={onKeyDown}
      >
        {OPTIONS.map((option) => {
          const checked = option.value === selected;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              /* Not `disabled`: disabling the focused control mid-transition
                 throws focus back to the body. The provider already refuses a
                 second switch while one is running, so this only needs to say so. */
              aria-disabled={isTransitioning || undefined}
              ref={(node) => {
                if (node) buttons.current.set(option.value, node);
                else buttons.current.delete(option.value);
              }}
              className="switcher__option"
              onClick={() => setAesthetic(option.value)}
            >
              {option.label}
              <span className="visually-hidden"> aesthetic</span>
            </button>
          );
        })}
      </div>

      {/* Decorative, and deliberately so: the radiogroup above already announces
          both options and which one is current, so an arrow repeating that to a
          screen reader would only be noise.

          Keyed on the target so React remounts it on every switch — that is
          what replays the nudge, which is the whole point of an arrow that
          moves when you are not looking at it. */}
      {pointX === null ? null : (
        <span
          key={target}
          className="switcher-point"
          style={{ left: `${pointX}px` }}
          aria-hidden="true"
        >
          ↑
        </span>
      )}
    </div>
  );
}

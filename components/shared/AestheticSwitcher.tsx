"use client";

import { useRef } from "react";
import { useAesthetic, useCommittedAesthetic } from "@/lib/aesthetic-context";
import type { Aesthetic } from "@/aesthetics/types";

const OPTIONS: { value: Aesthetic; label: string }[] = [
  { value: "signal", label: "Signal" },
  { value: "blueprint", label: "Blueprint" },
];

const ARROWS = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

/**
 * A real radiogroup: arrow keys move between the two identities, Enter/Space
 * commits, and the current one is announced rather than merely coloured in.
 */
export function AestheticSwitcher() {
  const { isTransitioning, setAesthetic } = useAesthetic();
  // The control reflects the choice the moment it is made, even though the
  // visuals take another second to finish arriving.
  const selected = useCommittedAesthetic();
  const buttons = useRef(new Map<Aesthetic, HTMLButtonElement>());

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
    <div
      className="switcher"
      role="radiogroup"
      aria-label="Change your aesthetics"
      onKeyDown={onKeyDown}
    >
      <span className="switcher__label" aria-hidden="true">
        {/* Narrow screens keep the noun and drop the verb rather than dropping
            the label outright, which left the signature control as two
            unexplained codes. */}
        <span className="switcher__label-verb">Change your </span>aesthetics
      </span>
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
  );
}

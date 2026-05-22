"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { getSkillDescription } from "@/lib/skill-descriptions";

interface SkillBadgeProps {
  skill: string;
  /** "default" = stone, "improved" = amber highlight, "injury" = red */
  variant?: "default" | "improved" | "injury";
  /** "sm" for table rows, "md" for player detail pills */
  size?: "sm" | "md";
  onRemove?: () => void;
}

export function SkillBadge({ skill, variant = "default", size = "md", onRemove }: SkillBadgeProps) {
  const description = getSkillDescription(skill);
  const [tooltip, setTooltip] = useState<{ style: React.CSSProperties; above: boolean } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  const showTooltip = useCallback(() => {
    if (!ref.current || !description) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const above = window.innerHeight - r.bottom < 140;
    setTooltip(
      above
        ? { above: true, style: { position: "fixed", zIndex: 9999, bottom: window.innerHeight - r.top + 8, left: cx, transform: "translateX(-50%)" } }
        : { above: false, style: { position: "fixed", zIndex: 9999, top: r.bottom + 8, left: cx, transform: "translateX(-50%)" } }
    );
  }, [description]);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  const colorClass =
    variant === "improved"
      ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
      : variant === "injury"
        ? "bg-red-900/40 text-red-400"
        : "bg-stone-700 text-stone-200";

  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5 rounded" : "text-xs px-2 py-1 rounded-full";

  return (
    <span
      ref={ref}
      className={`inline-flex items-center gap-1 ${sizeClass} ${colorClass} ${description ? "cursor-help" : ""}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {skill}
      {onRemove && (
        <button onClick={onRemove} className="text-stone-400 hover:text-red-400 ml-0.5">
          ×
        </button>
      )}
      {description && tooltip &&
        createPortal(
          <span
            style={tooltip.style}
            className="w-56 pointer-events-none rounded-lg bg-stone-800 border border-stone-600 shadow-xl px-3 py-2 text-xs text-stone-200 leading-relaxed"
          >
            <span className="block font-semibold text-white mb-1">{skill}</span>
            {description}
            {tooltip.above ? (
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-stone-600" />
            ) : (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-stone-600" />
            )}
          </span>,
          document.body
        )
      }
    </span>
  );
}

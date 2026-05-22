import { getSkillDescription } from "@/lib/skill-descriptions";

interface SkillBadgeProps {
  skill: string;
  /** "default" = stone, "improved" = amber highlight, "injury" = red */
  variant?: "default" | "improved" | "injury";
  /** "sm" for table rows, "md" for player detail pills */
  size?: "sm" | "md";
  onRemove?: () => void;
}

export function SkillBadge({
  skill,
  variant = "default",
  size = "md",
  onRemove,
}: SkillBadgeProps) {
  const description = getSkillDescription(skill);

  const colorClass =
    variant === "improved"
      ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
      : variant === "injury"
        ? "bg-red-900/40 text-red-400"
        : "bg-stone-700 text-stone-200";

  const sizeClass =
    size === "sm"
      ? "text-xs px-1.5 py-0.5 rounded"
      : "text-xs px-2 py-1 rounded-full";

  return (
    <span className={`relative group/skill inline-flex items-center gap-1 ${sizeClass} ${colorClass} ${description ? "cursor-help" : ""}`}>
      {skill}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-stone-400 hover:text-red-400 ml-0.5"
        >
          ×
        </button>
      )}
      {description && (
        <span
          className={[
            // sm badges are inside overflow-x-auto tables — tooltip below avoids top clipping
            size === "sm"
              ? "absolute top-full left-1/2 -translate-x-1/2 mt-2"
              : "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
            "w-56 z-50 pointer-events-none",
            "rounded-lg bg-stone-800 border border-stone-600 shadow-xl",
            "px-3 py-2 text-xs text-stone-200 leading-relaxed",
            "opacity-0 group-hover/skill:opacity-100 transition-opacity duration-150",
          ].join(" ")}
        >
          <span className="block font-semibold text-white mb-1">{skill}</span>
          {description}
          {size === "sm" ? (
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-stone-600" />
          ) : (
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-stone-600" />
          )}
        </span>
      )}
    </span>
  );
}

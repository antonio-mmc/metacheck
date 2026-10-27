"use client";

/**
 * A heading that is also a choice. The visible text sets the width, so the caret
 * sits right after the current option; the native list lies on top, invisible.
 */
export function TitleSelect({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const current = options.find((option) => option.value === value)?.label ?? "";
  return (
    <span
      className={`relative inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-ink focus-within:outline-2 focus-within:outline-action hover:bg-panel2 ${className}`}
    >
      <span aria-hidden>{current}</span>
      <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0 text-soft" aria-hidden>
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </span>
  );
}

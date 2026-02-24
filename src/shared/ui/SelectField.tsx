// src/shared/ui/SelectField.tsx
import type { SelectHTMLAttributes } from "react";


interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  hint,
  error,
  containerClassName = "",
  className = "",
  children,
  ...rest
}) => {
  const selectId = id ?? rest.name ?? `field-${Math.random().toString(16).slice(2)}`;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1 text-sm ${containerClassName}`}>
      <label htmlFor={selectId} className="font-medium">
        {label}
      </label>
      <select
        id={selectId}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        className={`rounded-xl border px-3 py-2 outline-none bg-slate-800 border-white/20 focus:border-[#74f1ff] focus:ring-2 focus:ring-[#74f1ff]/60 ${className}`}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={hintId} className="text-[11px] text-[#9fb0c8]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-[11px] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
};

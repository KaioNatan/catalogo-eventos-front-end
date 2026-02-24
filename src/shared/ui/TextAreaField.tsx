// src/shared/ui/TextAreaField.tsx
import type { TextareaHTMLAttributes } from "react";

interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  label,
  hint,
  error,
  containerClassName = "",
  className = "",
  ...rest
}) => {
  const textAreaId = id ?? rest.name ?? `field-${Math.random().toString(16).slice(2)}`;
  const hintId = hint ? `${textAreaId}-hint` : undefined;
  const errorId = error ? `${textAreaId}-error` : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1 text-sm ${containerClassName}`}>
      <label htmlFor={textAreaId} className="font-medium">
        {label}
      </label>
      <textarea
        id={textAreaId}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        className={`rounded-xl border px-3 py-2 outline-none bg-white/10 border-white/20 focus:border-[#74f1ff] focus:ring-2 focus:ring-[#74f1ff]/60 resize-none ${className}`}
        {...rest}
      />
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

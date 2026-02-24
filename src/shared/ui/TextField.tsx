// src/shared/ui/TextField.tsx
import type { InputHTMLAttributes } from 'react';

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  hint,
  error,
  containerClassName = "",
  className = "",
  ...rest
}) => {
  const inputId = id ?? rest.name ?? `field-${Math.random().toString(16).slice(2)}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1 text-sm ${containerClassName}`}>
      <label htmlFor={inputId} className="font-medium">
        {label}
      </label>
      <input
        id={inputId}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        className={`rounded-xl border px-3 py-2 outline-none bg-white/10 border-white/20 focus:border-[#74f1ff] focus:ring-2 focus:ring-[#74f1ff]/60 ${className}`}
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

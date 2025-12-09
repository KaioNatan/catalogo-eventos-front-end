import React, { useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";

interface ModalProps extends PropsWithChildren {
  onClose: () => void;
  className?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export const Modal: React.FC<ModalProps> = ({
  onClose,
  className = "",
  children,
  ariaLabelledBy,
  ariaDescribedBy,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    // foco inicial simples
    dialogRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        className={`w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900 p-4 md:p-6 ${className}`}
      >
        {children}
      </div>
      <button
        type="button"
        className="fixed inset-0 -z-10 cursor-default"
        onClick={onClose}
        aria-label="Fechar modal"
      />
    </div>
  );
};

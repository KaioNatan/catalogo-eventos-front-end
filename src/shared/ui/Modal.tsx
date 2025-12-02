import React, { type PropsWithChildren } from "react";

interface ModalProps extends PropsWithChildren {
  onClose: () => void;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  onClose,
  className = "",
  children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div
      className={`w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900 p-4 md:p-6 ${className}`}
    >
      {children}
    </div>
    <button
      className="fixed inset-0 -z-10 cursor-default"
      onClick={onClose}
      aria-label="Fechar modal"
    />
  </div>
);

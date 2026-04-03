import type { ReactElement } from "react";

interface IEmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({
  title,
  description,
}: IEmptyStateProps): ReactElement {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  );
}

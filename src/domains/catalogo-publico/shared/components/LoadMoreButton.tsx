import { Button } from "@/design-system/ui";
import type { ReactElement } from "react";

interface ILoadMoreButtonProps {
  isLoading: boolean;
  onClick: () => void | Promise<void>;
  /** Ex.: durante stale-while-revalidate da listagem. */
  disabled?: boolean;
}

export function LoadMoreButton({
  isLoading,
  onClick,
  disabled = false,
}: ILoadMoreButtonProps): ReactElement {
  const isDisabled: boolean = isLoading || disabled;
  return (
    <div className="mt-8 flex justify-center">
      <Button
        variant="ghost"
        isLoading={isLoading}
        onClick={() => {
          void onClick();
        }}
        disabled={isDisabled}
        className="inline-flex min-w-40 items-center justify-center rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Carregar mais
      </Button>
    </div>
  );
}

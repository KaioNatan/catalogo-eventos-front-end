import type { ReactElement } from "react";

const cellClass: string =
  "rounded bg-zinc-200 motion-safe:animate-pulse motion-reduce:animate-none";

interface IAdminCrmListTableSkeletonProps {
  /** Colunas da tabela (Nome, Cidade, …). Padrão alinhado às listagens de eventos/pontos. */
  columnCount?: number;
  rowCount?: number;
}

export function AdminCrmListTableSkeleton({
  columnCount = 6,
  rowCount = 5,
}: IAdminCrmListTableSkeletonProps): ReactElement {
  const columns: number[] = Array.from(
    { length: columnCount },
    (_, index: number) => index,
  );
  const rows: number[] = Array.from(
    { length: rowCount },
    (_, index: number) => index,
  );

  return (
    <div
      className="overflow-x-auto"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando lista"
    >
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200">
            {columns.map((col: number) => (
              <th key={col} className="py-3 pr-4">
                <div className={`h-4 w-24 ${cellClass}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: number) => (
            <tr key={row} className="border-b border-zinc-100">
              {columns.map((col: number) => (
                <td key={col} className="py-4 pr-4">
                  <div
                    className={`h-4 ${col === 0 ? "w-48" : "w-24"} ${cellClass}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

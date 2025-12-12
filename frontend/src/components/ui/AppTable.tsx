import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  rowKey?: (row: T, index: number) => string | number;
  empty?: ReactNode;
};

export function AppTable<T>({ data, columns, rowKey, empty }: Props<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-900/80 text-slate-300 border-b border-slate-800">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className={cn("px-4 py-3 text-left font-medium", col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-center text-slate-400" colSpan={columns.length}>
                {empty ?? "No data"}
              </td>
            </tr>
          )}
          {data.map((row, index) => (
            <tr
              key={rowKey ? rowKey(row, index) : index}
              className="border-t border-slate-800/80 hover:bg-slate-800/50 transition"
            >
              {columns.map((col) => (
                <td key={String(col.key)} className={cn("px-4 py-3 text-slate-100", col.className)}>
                  {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key as string] as ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

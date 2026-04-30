import { ReactNode } from "react";

export type SpecRow = {
  setting: string;
  value: ReactNode;
  notes?: ReactNode;
};

export function SpecTable({ rows }: { rows: SpecRow[] }) {
  return (
    <table className="my-6 w-full border-collapse font-mono text-[13px]">
      <thead>
        <tr>
          {["Setting", "Value", "Notes"].map((h) => (
            <th
              key={h}
              className="border-b border-rule px-3.5 pb-2 pt-2.5 text-left text-[10px] font-normal uppercase tracking-[0.18em] text-red-600"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.setting} className="hover:bg-paper-2">
            <td className="border-b border-rule p-3.5 align-top text-ink">
              {r.setting}
            </td>
            <td className="border-b border-rule p-3.5 align-top text-ink">
              {r.value}
            </td>
            <td className="border-b border-rule p-3.5 align-top font-serif text-sm text-ink-mute">
              {r.notes}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

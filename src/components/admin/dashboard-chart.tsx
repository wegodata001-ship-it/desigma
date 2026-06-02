"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function DashboardChart({
  chart,
}: {
  chart: { date: string; revenue: number; orders: number }[];
}) {
  return (
    <div className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chart}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={(v) => String(v).slice(5)} stroke="#64748b" fontSize={12} />
          <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickFormatter={(v) => `₪${v}`} />
          <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
          <Tooltip
            formatter={(val: unknown, name: unknown) =>
              name === "revenue" ? [`₪${String(val)}`, "Revenue"] : [String(val), "Orders"]
            }
            labelFormatter={(l) => `Date: ${l}`}
          />
          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface WeekData {
  week: string;
  approved: number;
  flagged: number;
}

export default function ReviewsChart({ data }: { data: WeekData[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="week"
          tick={{ fill: "#666", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#666", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px", color: "#666" }} />
        <Bar
          dataKey="approved"
          name="Approved"
          fill="#4ade80"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="flagged"
          name="Flagged"
          fill="#f87171"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

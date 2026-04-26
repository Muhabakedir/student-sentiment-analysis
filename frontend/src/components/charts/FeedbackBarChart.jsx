import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Shorten service names for chart labels
function shortenLabel(name) {
  const map = {
    "Teaching/Learning Process": "Teaching",
    "Library Service": "Library", 
    "ICT / Internet Services": "ICT",
    "Registrar & Records Services": "Registrar",
    "Cafeteria Services": "Cafeteria",
    "Dormitory / Housing Services": "Dormitory",
  };
  return map[name] || name;
}

export default function FeedbackBarChart({ data }) {
  const chartData = data.map((d) => ({
    ...d,
    name: shortenLabel(d.service),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        barSize={18}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.15)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            fontSize: "13px",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: "12px", textTransform: "capitalize" }}>
              {value}
            </span>
          )}
        />
        <Bar dataKey="positive" name="Positive" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="neutral" name="Neutral" fill="#06b6d4" radius={[4, 4, 0, 0]} />
        <Bar dataKey="negative" name="Negative" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

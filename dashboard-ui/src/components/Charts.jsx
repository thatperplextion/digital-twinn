import { useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { motion } from "framer-motion";
import clsx from "clsx";
function RealTimeLineChart({
  data,
  dataKey = "value",
  title,
  color = "#3b82f6",
  height = 200,
  showGrid = true,
  showAxis = true
}) {
  return <div className="w-full">{title && <h4 className="text-sm font-medium text-slate-400 mb-3">{title}</h4>}<ResponsiveContainer width="100%" height={height}><LineChart data={data}>{showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />}{showAxis && <><XAxis
    dataKey="timestamp"
    stroke="#64748b"
    fontSize={11}
    tickLine={false}
    axisLine={false}
  /><YAxis
    stroke="#64748b"
    fontSize={11}
    tickLine={false}
    axisLine={false}
  /></>}<Tooltip
    contentStyle={{
      backgroundColor: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "8px",
      color: "#f1f5f9"
    }}
  /><Line
    type="monotone"
    dataKey={dataKey}
    stroke={color}
    strokeWidth={2}
    dot={false}
    activeDot={{ r: 4, fill: color }}
  /></LineChart></ResponsiveContainer></div>;
}
function MultiLineChart({ data, lines, title, height = 300 }) {
  return <div className="w-full">{title && <h4 className="text-sm font-medium text-slate-400 mb-3">{title}</h4>}<ResponsiveContainer width="100%" height={height}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} /><XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} /><Tooltip
    contentStyle={{
      backgroundColor: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "8px",
      color: "#f1f5f9"
    }}
  /><Legend />{lines.map((line) => <Line
    key={line.key}
    type="monotone"
    dataKey={line.key}
    stroke={line.color}
    strokeWidth={2}
    dot={false}
    name={line.name}
  />)}</LineChart></ResponsiveContainer></div>;
}
function GradientAreaChart({
  data,
  dataKey = "value",
  title,
  color = "#3b82f6",
  height = 200,
  gradient = true
}) {
  const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substr(2, 9)}`, []);
  return <div className="w-full">{title && <h4 className="text-sm font-medium text-slate-400 mb-3">{title}</h4>}<ResponsiveContainer width="100%" height={height}><AreaChart data={data}><defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.3} /><stop offset="95%" stopColor={color} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} /><XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} /><Tooltip
    contentStyle={{
      backgroundColor: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "8px",
      color: "#f1f5f9"
    }}
  /><Area
    type="monotone"
    dataKey={dataKey}
    stroke={color}
    strokeWidth={2}
    fill={gradient ? `url(#${gradientId})` : color}
    fillOpacity={gradient ? 1 : 0.2}
  /></AreaChart></ResponsiveContainer></div>;
}
function BarChartComponent({
  data,
  dataKey = "value",
  categoryKey = "category",
  title,
  color = "#3b82f6",
  height = 200
}) {
  return <div className="w-full">{title && <h4 className="text-sm font-medium text-slate-400 mb-3">{title}</h4>}<ResponsiveContainer width="100%" height={height}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} /><XAxis dataKey={categoryKey} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} /><Tooltip
    contentStyle={{
      backgroundColor: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "8px",
      color: "#f1f5f9"
    }}
  /><Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
function PieChartComponent({ data, title, height = 200, showLabels = true }) {
  return <div className="w-full">{title && <h4 className="text-sm font-medium text-slate-400 mb-3">{title}</h4>}<ResponsiveContainer width="100%" height={height}><PieChart><Pie
    data={data}
    cx="50%"
    cy="50%"
    innerRadius={50}
    outerRadius={80}
    paddingAngle={2}
    dataKey="value"
    label={showLabels ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
    labelLine={showLabels}
  >{data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip
    contentStyle={{
      backgroundColor: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "8px",
      color: "#f1f5f9"
    }}
  /></PieChart></ResponsiveContainer></div>;
}
function MetricGauge({
  value,
  max = 100,
  title,
  color = "#3b82f6",
  size = "md",
  showValue = true
}) {
  const percentage = value / max * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - percentage / 100 * circumference;
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-48 h-48"
  };
  return <div className="flex flex-col items-center">{title && <h4 className="text-sm font-medium text-slate-400 mb-2">{title}</h4>}<div className={clsx("relative", sizeClasses[size])}><svg className="w-full h-full -rotate-90" viewBox="0 0 100 100"><circle
    cx="50"
    cy="50"
    r="45"
    fill="none"
    stroke="#334155"
    strokeWidth="8"
  /><motion.circle
    cx="50"
    cy="50"
    r="45"
    fill="none"
    stroke={color}
    strokeWidth="8"
    strokeLinecap="round"
    strokeDasharray={circumference}
    initial={{ strokeDashoffset: circumference }}
    animate={{ strokeDashoffset }}
    transition={{ duration: 1, ease: "easeOut" }}
  /></svg>{showValue && <div className="absolute inset-0 flex items-center justify-center"><span className="text-2xl font-bold text-white">{value.toFixed(0)}</span></div>}</div></div>;
}
function Sparkline({ data, color = "#3b82f6", height = 40, width = 100 }) {
  const chartData = data.map((value, index) => ({ index, value }));
  return <ResponsiveContainer width={width} height={height}><LineChart data={chartData}><Line
    type="monotone"
    dataKey="value"
    stroke={color}
    strokeWidth={2}
    dot={false}
  /></LineChart></ResponsiveContainer>;
}
function ProgressBar({
  value,
  max = 100,
  color = "blue",
  showLabel = true,
  size = "md"
}) {
  const percentage = Math.min(value / max * 100, 100);
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  };
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600"
  };
  return <div className="w-full"><div className={clsx("w-full bg-slate-700/50 rounded-full overflow-hidden", sizeClasses[size])}><motion.div
    className={clsx("h-full rounded-full bg-gradient-to-r", colorClasses[color])}
    initial={{ width: 0 }}
    animate={{ width: `${percentage}%` }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  /></div>{showLabel && <div className="mt-1 text-right"><span className="text-xs text-slate-400">{percentage.toFixed(1)}%</span></div>}</div>;
}
export {
  BarChartComponent,
  GradientAreaChart,
  MetricGauge,
  MultiLineChart,
  PieChartComponent,
  ProgressBar,
  RealTimeLineChart,
  Sparkline
};

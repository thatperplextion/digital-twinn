import { motion } from "framer-motion";
import clsx from "clsx";
const colorClasses = {
  blue: {
    bg: "from-primary-600/20 to-primary-800/10",
    border: "border-primary-500/20",
    icon: "text-primary-400 bg-primary-500/20",
    glow: "hover:shadow-neon-orange",
    gradient: "from-primary-500 to-primary-600"
  },
  green: {
    bg: "from-success-600/20 to-success-800/10",
    border: "border-success-500/20",
    icon: "text-success-400 bg-success-500/20",
    glow: "hover:shadow-neon-green",
    gradient: "from-success-500 to-success-600"
  },
  yellow: {
    bg: "from-warning-600/20 to-warning-800/10",
    border: "border-warning-500/20",
    icon: "text-warning-400 bg-warning-500/20",
    glow: "hover:shadow-glow-md",
    gradient: "from-warning-500 to-warning-600"
  },
  red: {
    bg: "from-danger-600/20 to-danger-800/10",
    border: "border-danger-500/20",
    icon: "text-danger-400 bg-danger-500/20",
    glow: "hover:shadow-neon-red",
    gradient: "from-danger-500 to-danger-600"
  },
  purple: {
    bg: "from-accent-600/20 to-accent-800/10",
    border: "border-accent-500/20",
    icon: "text-accent-400 bg-accent-500/20",
    glow: "hover:shadow-neon-rose",
    gradient: "from-accent-500 to-accent-600"
  }
};
function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  trend,
  subtitle
}) {
  const colors = colorClasses[color];
  return <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ duration: 0.3 }}
    className={clsx(
      "relative rounded-2xl p-6 glass-card overflow-hidden group",
      colors.border,
      colors.glow,
      "transition-shadow duration-300"
    )}
  >{
    /* Gradient top border */
  }<div className={clsx("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60", colors.gradient)} />{
    /* Background gradient */
  }<div className={clsx("absolute inset-0 bg-gradient-to-br opacity-40 transition-opacity group-hover:opacity-60", colors.bg)} />{
    /* Content */
  }<div className="relative z-10"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold text-white tracking-tight">{value}</p>{subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}</div><motion.div
    whileHover={{ rotate: 5, scale: 1.1 }}
    className={clsx("p-3 rounded-xl backdrop-blur-sm", colors.icon)}
  ><Icon className="h-6 w-6" /></motion.div></div>{(change !== void 0 || changeLabel) && <div className="mt-4 flex items-center gap-2">{change !== void 0 && <span
    className={clsx(
      "inline-flex items-center text-sm font-semibold",
      trend === "up" && "text-success-400",
      trend === "down" && "text-danger-400",
      trend === "neutral" && "text-slate-400"
    )}
  >{trend === "up" && "\u2191"}{trend === "down" && "\u2193"}{change > 0 ? "+" : ""}{change}%
              </span>}{changeLabel && <span className="text-sm text-slate-500">{changeLabel}</span>}</div>}</div>{
    /* Decorative glow orb */
  }<div className={clsx("absolute -right-6 -bottom-6 h-28 w-28 rounded-full blur-3xl opacity-30 transition-opacity group-hover:opacity-50", colors.icon.replace("text-", "bg-").replace("bg-", "bg-"))} />{
    /* Shimmer effect on hover */
  }<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"><div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" /></div></motion.div>;
}
export {
  MetricCard as default
};

import { motion } from 'framer-motion'
import clsx from 'clsx'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

const colorClasses = {
  blue: {
    bg: 'from-blue-600/20 to-blue-800/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-400 bg-blue-500/20',
    glow: 'shadow-blue-500/20',
  },
  green: {
    bg: 'from-green-600/20 to-green-800/20',
    border: 'border-green-500/30',
    icon: 'text-green-400 bg-green-500/20',
    glow: 'shadow-green-500/20',
  },
  yellow: {
    bg: 'from-yellow-600/20 to-yellow-800/20',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400 bg-yellow-500/20',
    glow: 'shadow-yellow-500/20',
  },
  red: {
    bg: 'from-red-600/20 to-red-800/20',
    border: 'border-red-500/30',
    icon: 'text-red-400 bg-red-500/20',
    glow: 'shadow-red-500/20',
  },
  purple: {
    bg: 'from-purple-600/20 to-purple-800/20',
    border: 'border-purple-500/30',
    icon: 'text-purple-400 bg-purple-500/20',
    glow: 'shadow-purple-500/20',
  },
}

export default function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  trend,
  subtitle,
}: MetricCardProps) {
  const colors = colorClasses[color]

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={clsx(
        'relative rounded-2xl p-6 glass border overflow-hidden',
        colors.border,
        `shadow-lg ${colors.glow}`
      )}
    >
      {/* Background gradient */}
      <div className={clsx('absolute inset-0 bg-gradient-to-br opacity-50', colors.bg)} />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          <div className={clsx('p-3 rounded-xl', colors.icon)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {(change !== undefined || changeLabel) && (
          <div className="mt-4 flex items-center gap-2">
            {change !== undefined && (
              <span
                className={clsx(
                  'inline-flex items-center text-sm font-medium',
                  trend === 'up' && 'text-green-400',
                  trend === 'down' && 'text-red-400',
                  trend === 'neutral' && 'text-slate-400'
                )}
              >
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {change > 0 ? '+' : ''}{change}%
              </span>
            )}
            {changeLabel && (
              <span className="text-sm text-slate-500">{changeLabel}</span>
            )}
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </motion.div>
  )
}

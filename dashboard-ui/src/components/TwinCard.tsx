// Minor change for commit history
import { motion } from 'framer-motion'
import { TwinSnapshot } from '../types'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

interface TwinCardProps {
  twin: TwinSnapshot
  compact?: boolean
}

const healthColors = {
  HEALTHY: 'text-success-400 bg-success-500/10 border-success-500/30',
  DEGRADED: 'text-warning-400 bg-warning-500/10 border-warning-500/30',
  WARNING: 'text-warning-400 bg-warning-500/10 border-warning-500/30',
  CRITICAL: 'text-danger-400 bg-danger-500/10 border-danger-500/30',
  UNKNOWN: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
}

const stateColors: Record<string, string> = {
  INITIAL: 'bg-slate-400',
  ACTIVE: 'bg-success-400',
  IDLE: 'bg-primary-400',
  WARNING: 'bg-warning-400',
  CRITICAL: 'bg-danger-400',
  TERMINAL: 'bg-accent-400',
}

export default function TwinCard({ twin, compact = false }: TwinCardProps) {
  const healthColor = healthColors[twin.health?.status || 'UNKNOWN']
  const stateColor = stateColors[twin.currentStateName] || 'bg-slate-400'

  if (compact) {
    return (
      <Link to={`/twins/${twin.id}`}>
        <motion.div
          whileHover={{ scale: 1.02, x: 4 }}
          className="flex items-center gap-4 p-4 glass-card hover:border-primary-500/30 transition-all duration-300 cursor-pointer group"
        >
          <span className="relative flex h-3 w-3">
            <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', stateColor)} />
            <span className={clsx('relative inline-flex rounded-full h-3 w-3', stateColor)} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate group-hover:text-primary-400 transition-colors">{twin.name}</p>
            <p className="text-xs text-slate-500">{twin.entityType}</p>
          </div>
          <div className={clsx('px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm', healthColor)}>
            {twin.health?.status || 'UNKNOWN'}
          </div>
        </motion.div>
      </Link>
    )
  }

  return (
    <Link to={`/twins/${twin.id}`}>
      <motion.div
        whileHover={{ scale: 1.01, y: -4 }}
        className="glass-card overflow-hidden cursor-pointer group transition-all duration-300"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', stateColor)} />
                <span className={clsx('relative inline-flex rounded-full h-4 w-4', stateColor)} />
              </span>
              <div>
                <h3 className="font-semibold text-white group-hover:gradient-text transition-colors">
                  {twin.name}
                </h3>
                <p className="text-sm text-slate-500">{twin.entityType}</p>
              </div>
            </div>
            <div className={clsx('px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm', healthColor)}>
              {twin.health?.status || 'UNKNOWN'}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="p-5 grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">State</p>
              <p className="text-sm font-semibold text-white">{twin.currentStateName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Confidence</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-dark-300 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(twin.stateConfidence || 0) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                  />
                </div>
                <span className="text-sm font-semibold text-white">
                  {((twin.stateConfidence || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Risk Score</p>
              <p className={clsx(
                'text-sm font-semibold',
                twin.behavioralMetrics?.riskScore > 0.7 ? 'text-danger-400' :
                twin.behavioralMetrics?.riskScore > 0.4 ? 'text-warning-400' : 'text-success-400'
              )}>
                {((twin.behavioralMetrics?.riskScore || 0) * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Activity</p>
              <p className="text-sm font-semibold text-white">
                {((twin.behavioralMetrics?.activityScore || 0) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 glass-light border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success-400" />
              </span>
              <span className="font-medium text-success-400">Live</span>
            </div>
            <span>Updated {new Date(twin.lastUpdatedAt).toLocaleTimeString()}</span>
          </div>
          <ChevronRightIcon className="h-4 w-4 text-slate-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
        </div>
      </motion.div>
    </Link>
  )
}

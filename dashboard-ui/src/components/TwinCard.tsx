import { motion } from 'framer-motion'
import { TwinSnapshot } from '../types'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  HeartIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

interface TwinCardProps {
  twin: TwinSnapshot
  compact?: boolean
}

const healthColors = {
  HEALTHY: 'text-green-400 bg-green-500/20 border-green-500/30',
  DEGRADED: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  WARNING: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  CRITICAL: 'text-red-400 bg-red-500/20 border-red-500/30',
  UNKNOWN: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
}

const stateColors: Record<string, string> = {
  INITIAL: 'bg-slate-500',
  ACTIVE: 'bg-green-500',
  IDLE: 'bg-blue-500',
  WARNING: 'bg-yellow-500',
  CRITICAL: 'bg-red-500',
  TERMINAL: 'bg-purple-500',
}

export default function TwinCard({ twin, compact = false }: TwinCardProps) {
  const healthColor = healthColors[twin.health?.status || 'UNKNOWN']
  const stateColor = stateColors[twin.currentStateName] || 'bg-slate-500'

  if (compact) {
    return (
      <Link to={`/twins/${twin.id}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-4 p-4 glass rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-colors cursor-pointer"
        >
          <div className={clsx('h-3 w-3 rounded-full', stateColor)} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{twin.name}</p>
            <p className="text-xs text-slate-400">{twin.entityType}</p>
          </div>
          <div className={clsx('px-2 py-1 rounded-full text-xs font-medium', healthColor)}>
            {twin.health?.status || 'UNKNOWN'}
          </div>
        </motion.div>
      </Link>
    )
  }

  return (
    <Link to={`/twins/${twin.id}`}>
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        className="glass rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 overflow-hidden cursor-pointer group"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={clsx('h-4 w-4 rounded-full animate-pulse', stateColor)} />
              <div>
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {twin.name}
                </h3>
                <p className="text-sm text-slate-400">{twin.entityType}</p>
              </div>
            </div>
            <div className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border', healthColor)}>
              {twin.health?.status || 'UNKNOWN'}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="p-5 grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">State</p>
              <p className="text-sm font-medium text-white">{twin.currentStateName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Confidence</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${(twin.stateConfidence || 0) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-white">
                  {((twin.stateConfidence || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Risk Score</p>
              <p className={clsx(
                'text-sm font-medium',
                twin.behavioralMetrics?.riskScore > 0.7 ? 'text-red-400' :
                twin.behavioralMetrics?.riskScore > 0.4 ? 'text-yellow-400' : 'text-green-400'
              )}>
                {((twin.behavioralMetrics?.riskScore || 0) * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Activity</p>
              <p className="text-sm font-medium text-white">
                {((twin.behavioralMetrics?.activityScore || 0) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-800/30 border-t border-slate-700/30 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <SignalIcon className="h-3.5 w-3.5" />
              <span>Live</span>
            </div>
            <span>Updated {new Date(twin.lastUpdatedAt).toLocaleTimeString()}</span>
          </div>
          <ChevronRightIcon className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
        </div>
      </motion.div>
    </Link>
  )
}

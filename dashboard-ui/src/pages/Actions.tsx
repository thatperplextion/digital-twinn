import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BoltIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { GradientAreaChart, BarChartComponent } from '../components/Charts'
import { Action } from '../types'
import clsx from 'clsx'

const mockActions: Action[] = [
  {
    id: 'ACT-001',
    twinId: 'TWIN-002',
    type: 'MITIGATION',
    name: 'Account Lockout',
    description: 'Temporarily locked user account due to suspicious activity',
    triggerType: 'ANOMALY',
    triggerReference: 'ANOM-001',
    priority: 'HIGH',
    status: 'COMPLETED',
    parameters: { lockDuration: '30m', notifyUser: true },
    result: {
      success: true,
      message: 'Account locked successfully. User notified via email.',
      outputs: { lockId: 'LOCK-123', notificationSent: true },
      sideEffects: ['Email sent to user', 'Security team notified'],
    },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    completedAt: new Date(Date.now() - 1795000).toISOString(),
    executionTimeMs: 5000,
  },
  {
    id: 'ACT-002',
    twinId: 'TWIN-003',
    type: 'ALERT',
    name: 'Maintenance Alert',
    description: 'Critical maintenance alert sent to operations team',
    triggerType: 'PREDICTION',
    triggerReference: 'PRED-002',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    parameters: { recipients: ['ops-team', 'maintenance-lead'], channel: 'slack' },
    createdAt: new Date(Date.now() - 600000).toISOString(),
    startedAt: new Date(Date.now() - 590000).toISOString(),
  },
  {
    id: 'ACT-003',
    twinId: 'TWIN-004',
    type: 'OPTIMIZATION',
    name: 'Route Optimization',
    description: 'Recalculated optimal route to avoid traffic congestion',
    triggerType: 'PREDICTION',
    triggerReference: 'PRED-004',
    priority: 'NORMAL',
    status: 'COMPLETED',
    parameters: { avoidTolls: false, preferHighways: true },
    result: {
      success: true,
      message: 'New route calculated. ETA reduced by 15 minutes.',
      outputs: { newEta: '45min', distanceSaved: '5km' },
      sideEffects: ['Navigation updated', 'Driver notified'],
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3595000).toISOString(),
    executionTimeMs: 5000,
  },
  {
    id: 'ACT-004',
    twinId: 'TWIN-001',
    type: 'NOTIFICATION',
    name: 'Temperature Alert',
    description: 'Notification sent regarding temperature deviation',
    triggerType: 'ANOMALY',
    triggerReference: 'ANOM-003',
    priority: 'LOW',
    status: 'COMPLETED',
    parameters: { type: 'info', channel: 'dashboard' },
    result: {
      success: true,
      message: 'Dashboard notification displayed',
      outputs: {},
      sideEffects: [],
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 7199000).toISOString(),
    executionTimeMs: 1000,
  },
  {
    id: 'ACT-005',
    twinId: 'TWIN-005',
    type: 'WORKFLOW',
    name: 'Approval Workflow',
    description: 'Initiated approval workflow for large transaction',
    triggerType: 'RULE',
    triggerReference: 'RULE-HIGH-VALUE',
    priority: 'HIGH',
    status: 'PENDING',
    parameters: { approvers: ['manager', 'compliance'], threshold: 10000 },
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
]

const actionsPerHour = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${i}:00`,
  count: Math.floor(Math.random() * 20) + 5,
}))

const actionsByType = [
  { category: 'Alerts', value: 45 },
  { category: 'Mitigations', value: 28 },
  { category: 'Optimizations', value: 15 },
  { category: 'Notifications', value: 35 },
  { category: 'Workflows', value: 12 },
]

export default function Actions() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const filteredActions = mockActions.filter(a => {
    const matchesStatus = !statusFilter || a.status === statusFilter
    const matchesType = !typeFilter || a.type === typeFilter
    return matchesStatus && matchesType
  })

  const stats = {
    total: mockActions.length,
    completed: mockActions.filter(a => a.status === 'COMPLETED').length,
    inProgress: mockActions.filter(a => a.status === 'IN_PROGRESS').length,
    pending: mockActions.filter(a => a.status === 'PENDING').length,
    successRate: 95.2,
  }

  const statusColors: Record<string, { text: string; bg: string; icon: React.ReactNode }> = {
    PENDING: {
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      icon: <ClockIcon className="h-5 w-5 text-yellow-400" />,
    },
    IN_PROGRESS: {
      text: 'text-blue-400',
      bg: 'bg-blue-500/20',
      icon: <ArrowPathIcon className="h-5 w-5 text-blue-400 animate-spin" />,
    },
    COMPLETED: {
      text: 'text-green-400',
      bg: 'bg-green-500/20',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
    },
    FAILED: {
      text: 'text-red-400',
      bg: 'bg-red-500/20',
      icon: <XCircleIcon className="h-5 w-5 text-red-400" />,
    },
    CANCELLED: {
      text: 'text-slate-400',
      bg: 'bg-slate-500/20',
      icon: <PauseIcon className="h-5 w-5 text-slate-400" />,
    },
  }

  const typeColors: Record<string, string> = {
    ALERT: 'text-orange-400 bg-orange-500/20',
    MITIGATION: 'text-red-400 bg-red-500/20',
    OPTIMIZATION: 'text-green-400 bg-green-500/20',
    INTERVENTION: 'text-purple-400 bg-purple-500/20',
    NOTIFICATION: 'text-blue-400 bg-blue-500/20',
    WORKFLOW: 'text-cyan-400 bg-cyan-500/20',
  }

  const priorityColors: Record<string, string> = {
    LOW: 'text-slate-400',
    NORMAL: 'text-blue-400',
    HIGH: 'text-orange-400',
    CRITICAL: 'text-red-400',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Action Engine</h1>
          <p className="text-slate-400 mt-1">Autonomous actions and workflow orchestration</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all">
          <PlayIcon className="h-5 w-5" />
          Trigger Manual Action
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <BoltIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Actions</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-green-400">Completed</p>
              <p className="text-xl font-bold text-green-400">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <ArrowPathIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-blue-400">In Progress</p>
              <p className="text-xl font-bold text-blue-400">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
              <ClockIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-yellow-400">Pending</p>
              <p className="text-xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-purple-400">Success Rate</p>
              <p className="text-xl font-bold text-purple-400">{stats.successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Actions Per Hour (24h)</h3>
          <GradientAreaChart
            data={actionsPerHour}
            dataKey="count"
            color="#8b5cf6"
            height={200}
          />
        </div>
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">By Type</h3>
          <BarChartComponent
            data={actionsByType}
            dataKey="value"
            categoryKey="category"
            color="#3b82f6"
            height={200}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 glass rounded-xl border border-slate-700/50 text-white bg-transparent"
        >
          <option value="" className="bg-slate-800">All Status</option>
          <option value="PENDING" className="bg-slate-800">Pending</option>
          <option value="IN_PROGRESS" className="bg-slate-800">In Progress</option>
          <option value="COMPLETED" className="bg-slate-800">Completed</option>
          <option value="FAILED" className="bg-slate-800">Failed</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 glass rounded-xl border border-slate-700/50 text-white bg-transparent"
        >
          <option value="" className="bg-slate-800">All Types</option>
          <option value="ALERT" className="bg-slate-800">Alert</option>
          <option value="MITIGATION" className="bg-slate-800">Mitigation</option>
          <option value="OPTIMIZATION" className="bg-slate-800">Optimization</option>
          <option value="NOTIFICATION" className="bg-slate-800">Notification</option>
          <option value="WORKFLOW" className="bg-slate-800">Workflow</option>
        </select>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {filteredActions.map((action, index) => {
          const statusStyle = statusColors[action.status]
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={clsx('p-3 rounded-xl', statusStyle.bg)}>
                    {statusStyle.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={clsx('px-2 py-1 rounded text-xs font-medium', typeColors[action.type])}>
                        {action.type}
                      </span>
                      <span className={clsx('px-2 py-1 rounded text-xs font-medium', statusStyle.bg, statusStyle.text)}>
                        {action.status}
                      </span>
                      <span className={clsx('text-xs font-medium', priorityColors[action.priority])}>
                        {action.priority} PRIORITY
                      </span>
                    </div>
                    <h4 className="font-medium text-white mt-2">{action.name}</h4>
                    <p className="text-sm text-slate-400 mt-1">{action.description}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Twin: {action.twinId} • Trigger: {action.triggerType} ({action.triggerReference})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    {new Date(action.createdAt).toLocaleString()}
                  </p>
                  {action.executionTimeMs && (
                    <p className="text-xs text-slate-500 mt-1">
                      {action.executionTimeMs}ms
                    </p>
                  )}
                </div>
              </div>

              {action.result && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2">
                    {action.result.success ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-sm text-slate-300">{action.result.message}</span>
                  </div>
                  {action.result.sideEffects.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {action.result.sideEffects.map((effect, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">
                          {effect}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(action.status === 'PENDING' || action.status === 'IN_PROGRESS') && (
                <div className="mt-4 flex gap-2">
                  {action.status === 'PENDING' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
                      Execute Now
                    </button>
                  )}
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-500 transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

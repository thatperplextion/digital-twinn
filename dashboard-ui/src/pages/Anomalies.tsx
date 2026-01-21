import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import { GradientAreaChart, BarChartComponent } from '../components/Charts'
import { Anomaly } from '../types'
import clsx from 'clsx'

const mockAnomalies: Anomaly[] = [
  {
    id: 'ANOM-001',
    twinId: 'TWIN-002',
    type: 'BEHAVIORAL',
    severity: 'HIGH',
    description: 'Unusual login pattern detected - multiple failed attempts from new location',
    affectedMetrics: ['login_attempts', 'location'],
    expectedValue: 2,
    actualValue: 15,
    deviation: 13,
    deviationPercentage: 650,
    detectedAt: new Date(Date.now() - 1800000).toISOString(),
    baselineReference: 'baseline-user-001',
    riskScore: 0.85,
    explanation: {
      rootCause: 'Potential credential stuffing attack or compromised account',
      contributingFactors: [
        { name: 'failed_logins', value: 15, impact: 0.7, direction: 'NEGATIVE' },
        { name: 'new_ip_address', value: true, impact: 0.5, direction: 'NEGATIVE' },
      ],
      historicalContext: 'No similar patterns in past 90 days',
      recommendations: [
        'Temporarily lock account',
        'Send verification email to user',
        'Enable enhanced monitoring',
      ],
    },
    status: 'INVESTIGATING',
  },
  {
    id: 'ANOM-002',
    twinId: 'TWIN-003',
    type: 'STATISTICAL',
    severity: 'CRITICAL',
    description: 'Vibration levels exceeding safe thresholds on motor assembly',
    affectedMetrics: ['vibration_x', 'vibration_y', 'temperature'],
    expectedValue: 0.5,
    actualValue: 2.8,
    deviation: 2.3,
    deviationPercentage: 460,
    detectedAt: new Date(Date.now() - 600000).toISOString(),
    baselineReference: 'baseline-machine-003',
    riskScore: 0.95,
    explanation: {
      rootCause: 'Bearing degradation or misalignment',
      contributingFactors: [
        { name: 'vibration_amplitude', value: 2.8, impact: 0.8, direction: 'NEGATIVE' },
        { name: 'operating_hours', value: 8500, impact: 0.4, direction: 'NEGATIVE' },
      ],
      historicalContext: 'Similar pattern preceded failure 6 months ago',
      recommendations: [
        'Schedule immediate maintenance',
        'Reduce operating speed by 20%',
        'Prepare replacement parts',
      ],
    },
    status: 'DETECTED',
  },
  {
    id: 'ANOM-003',
    twinId: 'TWIN-001',
    type: 'TEMPORAL',
    severity: 'LOW',
    description: 'Sensor reading outside typical time-based pattern',
    affectedMetrics: ['temperature'],
    expectedValue: 70,
    actualValue: 74,
    deviation: 4,
    deviationPercentage: 5.7,
    detectedAt: new Date(Date.now() - 7200000).toISOString(),
    baselineReference: 'baseline-sensor-001',
    riskScore: 0.25,
    explanation: {
      rootCause: 'Ambient temperature variation',
      contributingFactors: [
        { name: 'hvac_status', value: 'reduced', impact: 0.3, direction: 'NEUTRAL' },
      ],
      historicalContext: 'Common during afternoon hours in summer',
      recommendations: ['Continue monitoring', 'No action required'],
    },
    status: 'RESOLVED',
    resolvedAt: new Date(Date.now() - 3600000).toISOString(),
    resolution: 'Temperature normalized after HVAC adjustment',
  },
]

const anomalyTrend = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${i}:00`,
  count: Math.floor(Math.random() * 10) + 1,
  critical: Math.floor(Math.random() * 2),
}))

const severityDistribution = [
  { category: 'Critical', value: 5 },
  { category: 'High', value: 12 },
  { category: 'Medium', value: 28 },
  { category: 'Low', value: 45 },
]

export default function Anomalies() {
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const filteredAnomalies = mockAnomalies.filter(a => {
    const matchesSeverity = !severityFilter || a.severity === severityFilter
    const matchesStatus = !statusFilter || a.status === statusFilter
    const matchesType = !typeFilter || a.type === typeFilter
    return matchesSeverity && matchesStatus && matchesType
  })

  const stats = {
    total: mockAnomalies.length,
    critical: mockAnomalies.filter(a => a.severity === 'CRITICAL').length,
    investigating: mockAnomalies.filter(a => a.status === 'INVESTIGATING').length,
    resolved: mockAnomalies.filter(a => a.status === 'RESOLVED').length,
  }

  const severityColors: Record<string, { text: string; bg: string; border: string }> = {
    LOW: { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
    MEDIUM: { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
    HIGH: { text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
    CRITICAL: { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  }

  const statusIcons: Record<string, React.ReactNode> = {
    DETECTED: <ShieldExclamationIcon className="h-5 w-5 text-red-400" />,
    INVESTIGATING: <ClockIcon className="h-5 w-5 text-yellow-400 animate-pulse" />,
    CONFIRMED: <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />,
    RESOLVED: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
    FALSE_POSITIVE: <XCircleIcon className="h-5 w-5 text-slate-400" />,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Anomaly Detection</h1>
        <p className="text-slate-400 mt-1">Real-time anomaly monitoring and investigation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Anomalies</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <ShieldExclamationIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-red-400">Critical</p>
              <p className="text-xl font-bold text-red-400">{stats.critical}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
              <ClockIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-yellow-400">Investigating</p>
              <p className="text-xl font-bold text-yellow-400">{stats.investigating}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-green-400">Resolved</p>
              <p className="text-xl font-bold text-green-400">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Anomaly Trend (24h)</h3>
          <GradientAreaChart
            data={anomalyTrend}
            dataKey="count"
            color="#ef4444"
            height={200}
          />
        </div>
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">By Severity</h3>
          <BarChartComponent
            data={severityDistribution}
            dataKey="value"
            categoryKey="category"
            color="#f59e0b"
            height={200}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2 glass rounded-xl border border-slate-700/50 text-white bg-transparent"
        >
          <option value="" className="bg-slate-800">All Severities</option>
          <option value="CRITICAL" className="bg-slate-800">Critical</option>
          <option value="HIGH" className="bg-slate-800">High</option>
          <option value="MEDIUM" className="bg-slate-800">Medium</option>
          <option value="LOW" className="bg-slate-800">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 glass rounded-xl border border-slate-700/50 text-white bg-transparent"
        >
          <option value="" className="bg-slate-800">All Status</option>
          <option value="DETECTED" className="bg-slate-800">Detected</option>
          <option value="INVESTIGATING" className="bg-slate-800">Investigating</option>
          <option value="RESOLVED" className="bg-slate-800">Resolved</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 glass rounded-xl border border-slate-700/50 text-white bg-transparent"
        >
          <option value="" className="bg-slate-800">All Types</option>
          <option value="BEHAVIORAL" className="bg-slate-800">Behavioral</option>
          <option value="STATISTICAL" className="bg-slate-800">Statistical</option>
          <option value="TEMPORAL" className="bg-slate-800">Temporal</option>
          <option value="SEQUENCE" className="bg-slate-800">Sequence</option>
        </select>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filteredAnomalies.map((anomaly, index) => {
          const colors = severityColors[anomaly.severity]
          return (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={clsx(
                'glass rounded-2xl p-6 border transition-colors',
                colors.border,
                'hover:border-opacity-70'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {statusIcons[anomaly.status]}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={clsx('px-2 py-1 rounded text-xs font-medium', colors.bg, colors.text)}>
                        {anomaly.severity}
                      </span>
                      <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">
                        {anomaly.type}
                      </span>
                      <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">
                        {anomaly.status}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-medium text-white mt-3">{anomaly.description}</h4>
                  <p className="text-sm text-slate-400 mt-1">Twin: {anomaly.twinId}</p>
                </div>
                <div className="text-right ml-4">
                  <p className={clsx('text-3xl font-bold', colors.text)}>
                    {anomaly.deviationPercentage.toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-400">Deviation</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400">Expected</p>
                  <p className="text-sm font-medium text-white">{anomaly.expectedValue}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400">Actual</p>
                  <p className={clsx('text-sm font-medium', colors.text)}>{anomaly.actualValue}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400">Risk Score</p>
                  <p className="text-sm font-medium text-white">{(anomaly.riskScore * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-sm text-slate-300">
                  <strong>Root Cause:</strong> {anomaly.explanation.rootCause}
                </p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Recommendations:</p>
                    <ul className="space-y-1">
                      {anomaly.explanation.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                          <span className={clsx('h-1.5 w-1.5 rounded-full', colors.text.replace('text-', 'bg-'))} />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-sm text-slate-500 md:text-right space-y-1">
                    <p>Detected: {new Date(anomaly.detectedAt).toLocaleString()}</p>
                    <p>Metrics: {anomaly.affectedMetrics.join(', ')}</p>
                    {anomaly.resolvedAt && (
                      <p className="text-green-400">Resolved: {new Date(anomaly.resolvedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {anomaly.status !== 'RESOLVED' && (
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
                    Investigate
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 transition-colors">
                    Mark Resolved
                  </button>
                  <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors">
                    False Positive
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

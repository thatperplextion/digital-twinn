import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  CubeIcon,
  SignalIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HeartIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline'
import MetricCard from '../components/MetricCard'
import TwinCard from '../components/TwinCard'
import { 
  RealTimeLineChart, 
  MultiLineChart, 
  GradientAreaChart, 
  PieChartComponent,
  MetricGauge,
  ProgressBar,
} from '../components/Charts'
import { useTwinStore, usePredictionStore, useAnomalyStore, useActionStore } from '../store'
import { TwinSnapshot, DashboardStats } from '../types'

// Mock data generator
const generateMockData = () => {
  const now = new Date()
  return Array.from({ length: 20 }, (_, i) => ({
    timestamp: new Date(now.getTime() - (19 - i) * 5000).toLocaleTimeString(),
    events: Math.floor(Math.random() * 100) + 50,
    latency: Math.floor(Math.random() * 30) + 10,
    predictions: Math.floor(Math.random() * 20) + 5,
    anomalies: Math.floor(Math.random() * 5),
  }))
}

const generateMockTwins = (): TwinSnapshot[] => [
  {
    id: 'TWIN-001',
    entityType: 'SMART_SENSOR',
    name: 'Temperature Sensor A1',
    description: 'Industrial temperature monitoring',
    staticAttributes: {},
    dynamicState: { temperature: 72.5, humidity: 45 },
    behavioralMetrics: { activityScore: 0.85, riskScore: 0.12, anomalyScore: 0.05, engagementScore: 0.9, performanceScore: 0.95, customMetrics: {}, lastCalculatedAt: new Date().toISOString() },
    health: { status: 'HEALTHY', healthScore: 98, lastHealthCheck: new Date().toISOString(), issues: [], metrics: {} },
    currentStateName: 'ACTIVE',
    stateConfidence: 0.97,
    lastUpdatedAt: new Date().toISOString(),
    snapshotTime: new Date().toISOString(),
  },
  {
    id: 'TWIN-002',
    entityType: 'USER_BEHAVIOR',
    name: 'User Profile - John Doe',
    description: 'Behavioral modeling for user',
    staticAttributes: {},
    dynamicState: { sessionCount: 145, lastAction: 'checkout' },
    behavioralMetrics: { activityScore: 0.72, riskScore: 0.35, anomalyScore: 0.15, engagementScore: 0.68, performanceScore: 0.82, customMetrics: {}, lastCalculatedAt: new Date().toISOString() },
    health: { status: 'WARNING', healthScore: 75, lastHealthCheck: new Date().toISOString(), issues: [{ type: 'anomaly', severity: 'MEDIUM', message: 'Unusual activity detected', detectedAt: new Date().toISOString(), resolved: false }], metrics: {} },
    currentStateName: 'WARNING',
    stateConfidence: 0.82,
    lastUpdatedAt: new Date().toISOString(),
    snapshotTime: new Date().toISOString(),
  },
  {
    id: 'TWIN-003',
    entityType: 'MACHINE',
    name: 'CNC Machine Unit 5',
    description: 'Manufacturing equipment monitoring',
    staticAttributes: {},
    dynamicState: { rpm: 3500, vibration: 0.02 },
    behavioralMetrics: { activityScore: 0.95, riskScore: 0.08, anomalyScore: 0.02, engagementScore: 0.88, performanceScore: 0.92, customMetrics: {}, lastCalculatedAt: new Date().toISOString() },
    health: { status: 'HEALTHY', healthScore: 95, lastHealthCheck: new Date().toISOString(), issues: [], metrics: {} },
    currentStateName: 'ACTIVE',
    stateConfidence: 0.99,
    lastUpdatedAt: new Date().toISOString(),
    snapshotTime: new Date().toISOString(),
  },
  {
    id: 'TWIN-004',
    entityType: 'VEHICLE',
    name: 'Fleet Vehicle #42',
    description: 'Connected vehicle tracking',
    staticAttributes: {},
    dynamicState: { speed: 65, fuel: 78, location: { lat: 40.7128, lng: -74.0060 } },
    behavioralMetrics: { activityScore: 0.88, riskScore: 0.62, anomalyScore: 0.45, engagementScore: 0.75, performanceScore: 0.70, customMetrics: {}, lastCalculatedAt: new Date().toISOString() },
    health: { status: 'CRITICAL', healthScore: 45, lastHealthCheck: new Date().toISOString(), issues: [{ type: 'maintenance', severity: 'HIGH', message: 'Engine temperature high', detectedAt: new Date().toISOString(), resolved: false }], metrics: {} },
    currentStateName: 'CRITICAL',
    stateConfidence: 0.91,
    lastUpdatedAt: new Date().toISOString(),
    snapshotTime: new Date().toISOString(),
  },
]

export default function Dashboard() {
  const [chartData, setChartData] = useState(generateMockData())
  const [stats] = useState<DashboardStats>({
    totalTwins: 1247,
    activeTwins: 1189,
    healthyTwins: 1056,
    warningTwins: 98,
    criticalTwins: 35,
    totalEvents: 2847293,
    eventsPerSecond: 1247,
    totalPredictions: 89234,
    predictionAccuracy: 94.7,
    totalAnomalies: 423,
    activeAnomalies: 12,
    totalActions: 1892,
    actionsToday: 156,
    avgLatencyMs: 23,
    systemHealth: 98.5,
  })

  const mockTwins = generateMockTwins()

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev.slice(1)]
        const now = new Date()
        newData.push({
          timestamp: now.toLocaleTimeString(),
          events: Math.floor(Math.random() * 100) + 50,
          latency: Math.floor(Math.random() * 30) + 10,
          predictions: Math.floor(Math.random() * 20) + 5,
          anomalies: Math.floor(Math.random() * 5),
        })
        return newData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const healthDistribution = [
    { name: 'Healthy', value: stats.healthyTwins, color: '#22c55e' },
    { name: 'Warning', value: stats.warningTwins, color: '#f59e0b' },
    { name: 'Critical', value: stats.criticalTwins, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Center</h1>
          <p className="text-slate-400 mt-1">Real-time digital twin monitoring and intelligence</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-green-400">All Systems Operational</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Digital Twins"
          value={stats.totalTwins.toLocaleString()}
          change={8.2}
          changeLabel="from last week"
          icon={CubeIcon}
          color="blue"
          trend="up"
          subtitle={`${stats.activeTwins} active`}
        />
        <MetricCard
          title="Events / Second"
          value={stats.eventsPerSecond.toLocaleString()}
          change={12.5}
          changeLabel="throughput"
          icon={SignalIcon}
          color="green"
          trend="up"
          subtitle={`${stats.avgLatencyMs}ms avg latency`}
        />
        <MetricCard
          title="Prediction Accuracy"
          value={`${stats.predictionAccuracy}%`}
          change={2.3}
          changeLabel="improvement"
          icon={ChartBarIcon}
          color="purple"
          trend="up"
          subtitle={`${stats.totalPredictions.toLocaleString()} total`}
        />
        <MetricCard
          title="Active Anomalies"
          value={stats.activeAnomalies}
          change={-15}
          changeLabel="from yesterday"
          icon={ExclamationTriangleIcon}
          color="red"
          trend="down"
          subtitle={`${stats.totalAnomalies} total detected`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Stream Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Real-Time Event Stream</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Events
              </span>
              <span className="flex items-center gap-1 text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Predictions
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Anomalies
              </span>
            </div>
          </div>
          <MultiLineChart
            data={chartData}
            lines={[
              { key: 'events', color: '#3b82f6', name: 'Events' },
              { key: 'predictions', color: '#22c55e', name: 'Predictions' },
              { key: 'anomalies', color: '#ef4444', name: 'Anomalies' },
            ]}
            height={280}
          />
        </div>

        {/* Health Distribution */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Twin Health Distribution</h3>
          <PieChartComponent data={healthDistribution} height={200} showLabels={false} />
          <div className="mt-4 space-y-2">
            {healthDistribution.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-400">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Metrics & Active Twins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Performance Gauges */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-6">System Performance</h3>
          <div className="grid grid-cols-2 gap-6">
            <MetricGauge
              value={stats.systemHealth}
              title="System Health"
              color="#22c55e"
              size="sm"
            />
            <MetricGauge
              value={stats.predictionAccuracy}
              title="Prediction Acc."
              color="#8b5cf6"
              size="sm"
            />
            <div className="col-span-2 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">CPU Usage</span>
                  <span className="text-white">67%</span>
                </div>
                <ProgressBar value={67} color="blue" showLabel={false} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Memory</span>
                  <span className="text-white">54%</span>
                </div>
                <ProgressBar value={54} color="green" showLabel={false} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Kafka Lag</span>
                  <span className="text-white">12ms</span>
                </div>
                <ProgressBar value={12} max={100} color="purple" showLabel={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Active Twins */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Active Digital Twins</h3>
            <a href="/twins" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockTwins.slice(0, 4).map(twin => (
              <TwinCard key={twin.id} twin={twin} compact />
            ))}
          </div>
        </div>
      </div>

      {/* Latency Chart */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Processing Latency (ms)</h3>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">Target: &lt;50ms</span>
          </div>
        </div>
        <GradientAreaChart
          data={chartData}
          dataKey="latency"
          color="#8b5cf6"
          height={200}
        />
      </div>

      {/* Recent Activity Feed */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { type: 'prediction', message: 'Next action predicted for TWIN-001: maintenance_check', time: '2s ago', color: 'text-purple-400' },
            { type: 'anomaly', message: 'Behavioral anomaly detected in TWIN-002', time: '15s ago', color: 'text-red-400' },
            { type: 'action', message: 'Auto-mitigation triggered for TWIN-004', time: '32s ago', color: 'text-yellow-400' },
            { type: 'state', message: 'TWIN-003 transitioned from IDLE to ACTIVE', time: '45s ago', color: 'text-blue-400' },
            { type: 'event', message: '1,247 events processed in last second', time: '1m ago', color: 'text-green-400' },
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <span className={`h-2 w-2 rounded-full ${activity.color.replace('text-', 'bg-')}`} />
              <span className="flex-1 text-sm text-slate-300">{activity.message}</span>
              <span className="text-xs text-slate-500">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

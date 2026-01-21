import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import { 
  MultiLineChart, 
  GradientAreaChart, 
  BarChartComponent, 
  PieChartComponent,
  MetricGauge,
} from '../components/Charts'

// Generate mock analytics data
const generateTimeSeriesData = (days: number) => {
  return Array.from({ length: days }, (_, i) => ({
    timestamp: `Day ${i + 1}`,
    events: Math.floor(Math.random() * 50000) + 10000,
    predictions: Math.floor(Math.random() * 1000) + 200,
    anomalies: Math.floor(Math.random() * 50) + 5,
    actions: Math.floor(Math.random() * 200) + 50,
  }))
}

const entityTypeDistribution = [
  { name: 'Smart Sensors', value: 450, color: '#3b82f6' },
  { name: 'User Profiles', value: 320, color: '#22c55e' },
  { name: 'Machines', value: 180, color: '#f59e0b' },
  { name: 'Vehicles', value: 150, color: '#ef4444' },
  { name: 'Buildings', value: 85, color: '#8b5cf6' },
  { name: 'Processes', value: 62, color: '#06b6d4' },
]

const performanceMetrics = [
  { category: 'Mon', latency: 23, throughput: 1250 },
  { category: 'Tue', latency: 25, throughput: 1180 },
  { category: 'Wed', latency: 21, throughput: 1320 },
  { category: 'Thu', latency: 28, throughput: 1150 },
  { category: 'Fri', latency: 22, throughput: 1280 },
  { category: 'Sat', latency: 19, throughput: 980 },
  { category: 'Sun', latency: 18, throughput: 850 },
]

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const timeSeriesData = generateTimeSeriesData(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">System performance and twin analytics</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Events Processed</p>
              <p className="text-2xl font-bold text-white mt-1">2.84M</p>
              <p className="text-xs text-green-400 mt-1">↑ 12.5% from last period</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/20">
              <ArrowTrendingUpIcon className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg Latency</p>
              <p className="text-2xl font-bold text-white mt-1">23ms</p>
              <p className="text-xs text-green-400 mt-1">↓ 8% improvement</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/20">
              <ClockIcon className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Prediction Accuracy</p>
              <p className="text-2xl font-bold text-white mt-1">94.7%</p>
              <p className="text-xs text-green-400 mt-1">↑ 2.3% improvement</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/20">
              <ChartPieIcon className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Twins</p>
              <p className="text-2xl font-bold text-white mt-1">1,247</p>
              <p className="text-xs text-green-400 mt-1">↑ 45 new this period</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-500/20">
              <CubeIcon className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Event Processing Trend</h3>
          <GradientAreaChart
            data={timeSeriesData}
            dataKey="events"
            color="#3b82f6"
            height={280}
          />
        </div>
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Predictions & Anomalies</h3>
          <MultiLineChart
            data={timeSeriesData}
            lines={[
              { key: 'predictions', color: '#22c55e', name: 'Predictions' },
              { key: 'anomalies', color: '#ef4444', name: 'Anomalies' },
              { key: 'actions', color: '#8b5cf6', name: 'Actions' },
            ]}
            height={280}
          />
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Twin Distribution by Type</h3>
          <PieChartComponent data={entityTypeDistribution} height={220} showLabels={false} />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {entityTypeDistribution.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-400 truncate">{item.name}</span>
                <span className="text-xs text-white ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Weekly Performance</h3>
          <BarChartComponent
            data={performanceMetrics}
            dataKey="throughput"
            categoryKey="category"
            color="#22c55e"
            height={220}
          />
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">System Health</h3>
          <div className="flex justify-center gap-8 mt-4">
            <MetricGauge value={98.5} title="Uptime" color="#22c55e" size="sm" />
            <MetricGauge value={67} title="CPU" color="#3b82f6" size="sm" />
            <MetricGauge value={54} title="Memory" color="#8b5cf6" size="sm" />
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Kafka Lag</span>
              <span className="text-sm text-white">12ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Redis Hit Rate</span>
              <span className="text-sm text-white">99.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">DB Connections</span>
              <span className="text-sm text-white">45/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-4">Top Performing Twins</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-700/50">
                <th className="pb-3 text-sm font-medium text-slate-400">Twin</th>
                <th className="pb-3 text-sm font-medium text-slate-400">Type</th>
                <th className="pb-3 text-sm font-medium text-slate-400">Events</th>
                <th className="pb-3 text-sm font-medium text-slate-400">Predictions</th>
                <th className="pb-3 text-sm font-medium text-slate-400">Accuracy</th>
                <th className="pb-3 text-sm font-medium text-slate-400">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {[
                { id: 'TWIN-001', name: 'Temperature Sensor A1', type: 'SENSOR', events: 125000, predictions: 450, accuracy: 97.2, health: 98 },
                { id: 'TWIN-003', name: 'CNC Machine Unit 5', type: 'MACHINE', events: 98000, predictions: 320, accuracy: 95.8, health: 95 },
                { id: 'TWIN-002', name: 'User Profile - John', type: 'USER', events: 45000, predictions: 180, accuracy: 92.1, health: 75 },
                { id: 'TWIN-004', name: 'Fleet Vehicle #42', type: 'VEHICLE', events: 67000, predictions: 290, accuracy: 88.5, health: 45 },
              ].map(twin => (
                <tr key={twin.id} className="hover:bg-slate-800/30">
                  <td className="py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{twin.name}</p>
                      <p className="text-xs text-slate-500">{twin.id}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs">
                      {twin.type}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-white">{twin.events.toLocaleString()}</td>
                  <td className="py-3 text-sm text-white">{twin.predictions}</td>
                  <td className="py-3">
                    <span className={`text-sm font-medium ${
                      twin.accuracy >= 95 ? 'text-green-400' :
                      twin.accuracy >= 90 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {twin.accuracy}%
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            twin.health >= 80 ? 'bg-green-500' :
                            twin.health >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${twin.health}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{twin.health}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

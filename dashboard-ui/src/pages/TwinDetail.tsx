import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  ClockIcon,
  CubeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  DocumentTextIcon,
  PlayIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { 
  MultiLineChart,
  MetricGauge,
  ProgressBar,
} from '../components/Charts'
import { DigitalTwin, TwinState, Prediction, Anomaly, Action } from '../types'
import clsx from 'clsx'

// Mock data generators
const generateStateHistory = (): TwinState[] => {
  const states = ['INITIAL', 'ACTIVE', 'IDLE', 'WARNING', 'ACTIVE']
  return states.map((state, i) => ({
    id: `STATE-${i}`,
    twinId: 'TWIN-001',
    stateName: state,
    type: state as any,
    properties: {},
    confidence: Math.random() * 0.3 + 0.7,
    transitionType: 'EVENT_DRIVEN' as const,
    transitionProbability: Math.random(),
    enteredAt: new Date(Date.now() - (states.length - i) * 3600000).toISOString(),
    metadata: {},
  }))
}

const generateMetricsData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 60000).toLocaleTimeString(),
    activity: Math.random() * 100,
    risk: Math.random() * 50,
    performance: Math.random() * 100,
  }))
}

export default function TwinDetail() {
  const { twinId } = useParams<{ twinId: string }>()
  const [activeTab, setActiveTab] = useState<'overview' | 'state' | 'predictions' | 'anomalies' | 'actions' | 'explain'>('overview')
  const [metricsData, setMetricsData] = useState(generateMetricsData())
  
  const [twin] = useState<DigitalTwin>({
    id: twinId || 'TWIN-001',
    entityType: 'SMART_SENSOR',
    name: 'Temperature Sensor A1',
    description: 'Industrial temperature monitoring sensor in manufacturing facility Zone A',
    staticAttributes: {
      manufacturer: 'SensorCorp',
      model: 'TC-500',
      installDate: '2024-01-15',
      location: 'Zone A, Rack 12',
    },
    dynamicState: {
      temperature: 72.5,
      humidity: 45.2,
      pressure: 1013.25,
      batteryLevel: 87,
      signalStrength: -42,
    },
    behavioralMetrics: {
      activityScore: 0.85,
      riskScore: 0.12,
      anomalyScore: 0.05,
      engagementScore: 0.9,
      performanceScore: 0.95,
      customMetrics: {
        readingAccuracy: 0.99,
        uptime: 0.998,
      },
      lastCalculatedAt: new Date().toISOString(),
    },
    temporalPatterns: {
      hourlyActivity: {},
      dailyActivity: {},
      weeklyActivity: {},
      peakActivityTimes: ['09:00', '14:00', '18:00'],
      seasonalPatterns: {},
    },
    contextualMemory: {
      shortTermMemory: [],
      longTermPatterns: {},
      frequentContexts: ['normal_operation', 'peak_load', 'maintenance'],
      lastContexts: [],
      memorySize: 1024,
    },
    currentState: {
      id: 'STATE-CURRENT',
      twinId: twinId || 'TWIN-001',
      stateName: 'ACTIVE',
      type: 'ACTIVE',
      properties: { mode: 'monitoring' },
      confidence: 0.97,
      transitionType: 'EVENT_DRIVEN',
      transitionProbability: 0.85,
      enteredAt: new Date(Date.now() - 3600000).toISOString(),
      metadata: {},
    },
    stateHistory: generateStateHistory(),
    health: {
      status: 'HEALTHY',
      healthScore: 98,
      lastHealthCheck: new Date().toISOString(),
      issues: [],
      metrics: {
        responseTime: 23,
        errorRate: 0.001,
        throughput: 1250,
      },
    },
    createdAt: '2024-01-15T10:00:00Z',
    lastUpdatedAt: new Date().toISOString(),
    lastEventAt: new Date(Date.now() - 5000).toISOString(),
    version: 1247,
    tags: ['production', 'zone-a', 'temperature'],
    tenantId: 'tenant-001',
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetricsData(prev => {
        const newData = [...prev.slice(1)]
        newData.push({
          timestamp: new Date().toLocaleTimeString(),
          activity: Math.random() * 100,
          risk: Math.random() * 50,
          performance: Math.random() * 100,
        })
        return newData
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: CubeIcon },
    { id: 'state', label: 'State History', icon: ClockIcon },
    { id: 'predictions', label: 'Predictions', icon: ChartBarIcon },
    { id: 'anomalies', label: 'Anomalies', icon: ExclamationTriangleIcon },
    { id: 'actions', label: 'Actions', icon: BoltIcon },
    { id: 'explain', label: 'Explainability', icon: DocumentTextIcon },
  ]

  const healthColors = {
    HEALTHY: 'text-green-400 bg-green-500/20 border-green-500/30',
    DEGRADED: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    WARNING: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    CRITICAL: 'text-red-400 bg-red-500/20 border-red-500/30',
    UNKNOWN: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            to="/twins"
            className="p-2 glass rounded-lg border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{twin.name}</h1>
              <span className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium border',
                healthColors[twin.health.status]
              )}>
                {twin.health.status}
              </span>
            </div>
            <p className="text-slate-400 mt-1">{twin.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span>ID: {twin.id}</span>
              <span>•</span>
              <span>Type: {twin.entityType}</span>
              <span>•</span>
              <span>Version: {twin.version}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all">
            <PlayIcon className="h-4 w-4" />
            Simulate
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 glass rounded-xl border border-slate-700/50 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab twin={twin} metricsData={metricsData} />
      )}
      {activeTab === 'state' && (
        <StateHistoryTab stateHistory={twin.stateHistory} currentState={twin.currentState} />
      )}
      {activeTab === 'predictions' && (
        <PredictionsTab twinId={twin.id} />
      )}
      {activeTab === 'anomalies' && (
        <AnomaliesTab twinId={twin.id} />
      )}
      {activeTab === 'actions' && (
        <ActionsTab twinId={twin.id} />
      )}
      {activeTab === 'explain' && (
        <ExplainabilityTab twin={twin} />
      )}
    </div>
  )
}

function OverviewTab({ twin, metricsData }: { twin: DigitalTwin; metricsData: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Current State & Metrics */}
      <div className="lg:col-span-2 space-y-6">
        {/* Current State Card */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Current State</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <MetricGauge
                value={twin.behavioralMetrics.activityScore * 100}
                title="Activity"
                color="#3b82f6"
                size="sm"
              />
            </div>
            <div className="text-center">
              <MetricGauge
                value={twin.behavioralMetrics.performanceScore * 100}
                title="Performance"
                color="#22c55e"
                size="sm"
              />
            </div>
            <div className="text-center">
              <MetricGauge
                value={twin.behavioralMetrics.riskScore * 100}
                title="Risk"
                color="#ef4444"
                size="sm"
              />
            </div>
            <div className="text-center">
              <MetricGauge
                value={twin.health.healthScore}
                title="Health"
                color="#8b5cf6"
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Real-time Metrics Chart */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Real-Time Metrics</h3>
          <MultiLineChart
            data={metricsData}
            lines={[
              { key: 'activity', color: '#3b82f6', name: 'Activity' },
              { key: 'performance', color: '#22c55e', name: 'Performance' },
              { key: 'risk', color: '#ef4444', name: 'Risk' },
            ]}
            height={250}
          />
        </div>

        {/* Dynamic State */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Dynamic State Variables</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(twin.dynamicState).map(([key, value]) => (
              <div key={key} className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-xs text-slate-400 uppercase tracking-wide">{key}</p>
                <p className="text-lg font-semibold text-white mt-1">
                  {typeof value === 'number' ? value.toFixed(2) : String(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Info Panels */}
      <div className="space-y-6">
        {/* Static Attributes */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Static Attributes</h3>
          <div className="space-y-3">
            {Object.entries(twin.staticAttributes).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-sm text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm text-white font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {twin.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Timestamps */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-4">Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Created</span>
              <span className="text-sm text-white">{new Date(twin.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Last Updated</span>
              <span className="text-sm text-white">{new Date(twin.lastUpdatedAt).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Last Event</span>
              <span className="text-sm text-white">{new Date(twin.lastEventAt).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Health Check</span>
              <span className="text-sm text-white">{new Date(twin.health.lastHealthCheck).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StateHistoryTab({ stateHistory, currentState }: { stateHistory: TwinState[]; currentState: TwinState }) {
  const stateColors: Record<string, string> = {
    INITIAL: 'bg-slate-500 border-slate-400',
    ACTIVE: 'bg-green-500 border-green-400',
    IDLE: 'bg-blue-500 border-blue-400',
    WARNING: 'bg-yellow-500 border-yellow-400',
    CRITICAL: 'bg-red-500 border-red-400',
    TERMINAL: 'bg-purple-500 border-purple-400',
  }

  return (
    <div className="glass rounded-2xl p-6 border border-slate-700/50">
      <h3 className="font-semibold text-white mb-6">State Transition Timeline</h3>
      
      {/* Current State */}
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30">
        <div className="flex items-center gap-3">
          <div className={clsx('h-4 w-4 rounded-full animate-pulse', stateColors[currentState.stateName]?.split(' ')[0])} />
          <div>
            <p className="font-medium text-white">Current: {currentState.stateName}</p>
            <p className="text-sm text-slate-400">Confidence: {(currentState.confidence * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700" />
        
        <div className="space-y-6">
          {stateHistory.map((state, index) => (
            <motion.div
              key={state.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4"
            >
              <div className={clsx(
                'relative z-10 h-12 w-12 rounded-full border-4 flex items-center justify-center',
                stateColors[state.stateName] || 'bg-slate-500 border-slate-400'
              )}>
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              <div className="flex-1 p-4 glass rounded-xl border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">{state.stateName}</h4>
                  <span className="text-xs text-slate-400">
                    {new Date(state.enteredAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-slate-400">
                    Confidence: <span className="text-white">{(state.confidence * 100).toFixed(1)}%</span>
                  </span>
                  <span className="text-slate-400">
                    Trigger: <span className="text-white">{state.transitionType}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PredictionsTab({ twinId }: { twinId: string }) {
  const predictions: Prediction[] = [
    {
      id: 'PRED-001',
      twinId,
      type: 'NEXT_ACTION',
      description: 'Predicted next maintenance check required',
      predictedOutcome: 'MAINTENANCE_REQUIRED',
      predictedValues: { timeToMaintenance: '72h', confidence: 0.89 },
      probability: 0.89,
      confidence: 0.92,
      timeHorizon: 'PT72H',
      predictionTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      modelUsed: 'predictive-maintenance-v2',
      modelVersion: '2.1.0',
      features: {},
      explanation: {
        summary: 'Based on historical patterns and current sensor readings',
        keyFactors: [
          { name: 'temperature_trend', value: 0.8, impact: 0.35, direction: 'POSITIVE' },
          { name: 'vibration_level', value: 0.6, impact: 0.25, direction: 'POSITIVE' },
        ],
        confidence: 'HIGH',
        methodology: 'Random Forest with Time Series Analysis',
      },
      status: 'PENDING',
    },
    {
      id: 'PRED-002',
      twinId,
      type: 'STATE_TRANSITION',
      description: 'State likely to transition to IDLE',
      predictedOutcome: 'IDLE',
      predictedValues: { probability: 0.75 },
      probability: 0.75,
      confidence: 0.88,
      timeHorizon: 'PT2H',
      predictionTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7200000).toISOString(),
      modelUsed: 'state-transition-model',
      modelVersion: '1.5.0',
      features: {},
      explanation: {
        summary: 'Based on current activity patterns',
        keyFactors: [],
        confidence: 'MEDIUM',
        methodology: 'Markov Chain Model',
      },
      status: 'PENDING',
    },
  ]

  return (
    <div className="space-y-4">
      {predictions.map((pred, index) => (
        <motion.div
          key={pred.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">
                  {pred.type}
                </span>
                <span className="text-xs text-slate-500">{pred.id}</span>
              </div>
              <h4 className="font-medium text-white mt-2">{pred.description}</h4>
              <p className="text-sm text-slate-400 mt-1">
                Predicted outcome: <span className="text-white">{pred.predictedOutcome}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{(pred.probability * 100).toFixed(0)}%</p>
              <p className="text-xs text-slate-400">Probability</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-sm text-slate-400">{pred.explanation.summary}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <span>Model: {pred.modelUsed}</span>
              <span>•</span>
              <span>Confidence: {pred.explanation.confidence}</span>
              <span>•</span>
              <span>Expires: {new Date(pred.expiresAt).toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function AnomaliesTab({ twinId }: { twinId: string }) {
  const anomalies: Anomaly[] = [
    {
      id: 'ANOM-001',
      twinId,
      type: 'STATISTICAL',
      severity: 'LOW',
      description: 'Temperature reading slightly above normal range',
      affectedMetrics: ['temperature'],
      expectedValue: 70.0,
      actualValue: 74.5,
      deviation: 4.5,
      deviationPercentage: 6.4,
      detectedAt: new Date(Date.now() - 3600000).toISOString(),
      baselineReference: 'baseline-2024-01',
      riskScore: 0.25,
      explanation: {
        rootCause: 'Ambient temperature increase in facility',
        contributingFactors: [
          { name: 'hvac_status', value: 'reduced', impact: 0.6, direction: 'NEGATIVE' },
        ],
        historicalContext: 'Similar patterns observed during summer months',
        recommendations: ['Monitor for next 24 hours', 'Check HVAC system'],
      },
      status: 'INVESTIGATING',
    },
  ]

  const severityColors = {
    LOW: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    MEDIUM: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    HIGH: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    CRITICAL: 'text-red-400 bg-red-500/20 border-red-500/30',
  }

  return (
    <div className="space-y-4">
      {anomalies.map((anomaly, index) => (
        <motion.div
          key={anomaly.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={clsx('px-2 py-1 rounded text-xs font-medium border', severityColors[anomaly.severity])}>
                  {anomaly.severity}
                </span>
                <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">
                  {anomaly.type}
                </span>
              </div>
              <h4 className="font-medium text-white mt-2">{anomaly.description}</h4>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">{anomaly.deviationPercentage.toFixed(1)}%</p>
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
              <p className="text-sm font-medium text-red-400">{anomaly.actualValue}</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-400">Risk Score</p>
              <p className="text-sm font-medium text-white">{(anomaly.riskScore * 100).toFixed(0)}%</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-sm text-slate-300"><strong>Root Cause:</strong> {anomaly.explanation.rootCause}</p>
            <div className="mt-2">
              <p className="text-sm text-slate-400">Recommendations:</p>
              <ul className="mt-1 space-y-1">
                {anomaly.explanation.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ActionsTab({ twinId }: { twinId: string }) {
  const actions: Action[] = [
    {
      id: 'ACT-001',
      twinId,
      type: 'NOTIFICATION',
      name: 'Alert Sent',
      description: 'Notification sent to operations team',
      triggerType: 'ANOMALY',
      triggerReference: 'ANOM-001',
      priority: 'NORMAL',
      status: 'COMPLETED',
      parameters: { channel: 'email', recipients: ['ops-team@example.com'] },
      result: {
        success: true,
        message: 'Notification delivered successfully',
        outputs: { messageId: 'MSG-123' },
        sideEffects: [],
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 3590000).toISOString(),
      executionTimeMs: 10000,
    },
  ]

  const statusColors = {
    PENDING: 'text-yellow-400 bg-yellow-500/20',
    IN_PROGRESS: 'text-blue-400 bg-blue-500/20',
    COMPLETED: 'text-green-400 bg-green-500/20',
    FAILED: 'text-red-400 bg-red-500/20',
    CANCELLED: 'text-slate-400 bg-slate-500/20',
  }

  return (
    <div className="space-y-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={clsx('px-2 py-1 rounded text-xs font-medium', statusColors[action.status])}>
                  {action.status}
                </span>
                <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">
                  {action.type}
                </span>
              </div>
              <h4 className="font-medium text-white mt-2">{action.name}</h4>
              <p className="text-sm text-slate-400 mt-1">{action.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Trigger: {action.triggerType}</p>
              <p className="text-xs text-slate-500">{action.triggerReference}</p>
            </div>
          </div>

          {action.result && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <span className={action.result.success ? 'text-green-400' : 'text-red-400'}>
                  {action.result.success ? '✓' : '✗'}
                </span>
                <span className="text-sm text-slate-300">{action.result.message}</span>
              </div>
              {action.executionTimeMs && (
                <p className="text-xs text-slate-500 mt-1">
                  Execution time: {action.executionTimeMs}ms
                </p>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function ExplainabilityTab({ twin: _twin }: { twin: DigitalTwin }) {
  return (
    <div className="space-y-6">
      {/* Event Chain */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-4">Event → State → Decision Chain</h3>
        <div className="flex items-center gap-4 overflow-x-auto pb-4">
          {[
            { type: 'Event', label: 'Temperature Reading', value: '74.5°F' },
            { type: 'State', label: 'State Update', value: 'ACTIVE' },
            { type: 'Prediction', label: 'Risk Assessment', value: '25%' },
            { type: 'Decision', label: 'Action Trigger', value: 'Monitor' },
          ].map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="p-4 bg-slate-800/50 rounded-xl min-w-[150px]">
                <p className="text-xs text-blue-400 font-medium">{step.type}</p>
                <p className="text-sm text-white mt-1">{step.label}</p>
                <p className="text-lg font-bold text-white mt-1">{step.value}</p>
              </div>
              {index < 3 && (
                <div className="px-2 text-slate-600">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Model Transparency */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-4">Model Transparency</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">Feature Importance</h4>
            <div className="space-y-3">
              {[
                { name: 'Temperature', importance: 0.35 },
                { name: 'Vibration', importance: 0.25 },
                { name: 'Humidity', importance: 0.20 },
                { name: 'Time of Day', importance: 0.12 },
                { name: 'Historical Pattern', importance: 0.08 },
              ].map(feature => (
                <div key={feature.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{feature.name}</span>
                    <span className="text-white">{(feature.importance * 100).toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={feature.importance * 100} color="blue" showLabel={false} size="sm" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">Decision Audit Trail</h4>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400">2024-01-22 10:45:32</p>
                <p className="text-white">Anomaly detection triggered → Risk score calculated</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400">2024-01-22 10:45:33</p>
                <p className="text-white">Policy evaluated → Action type: NOTIFICATION</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400">2024-01-22 10:45:34</p>
                <p className="text-white">Action executed → Notification sent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

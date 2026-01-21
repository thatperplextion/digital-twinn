import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BeakerIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { MultiLineChart, GradientAreaChart } from '../components/Charts'
import { SimulationRequest, TwinSnapshot } from '../types'
import clsx from 'clsx'

const mockTwins: { id: string; name: string }[] = [
  { id: 'TWIN-001', name: 'Temperature Sensor A1' },
  { id: 'TWIN-002', name: 'User Profile - John Doe' },
  { id: 'TWIN-003', name: 'CNC Machine Unit 5' },
  { id: 'TWIN-004', name: 'Fleet Vehicle #42' },
]

const scenarios = [
  { id: 'high-load', name: 'High Load Scenario', description: 'Simulate peak traffic conditions' },
  { id: 'failure', name: 'Component Failure', description: 'Simulate critical component failure' },
  { id: 'attack', name: 'Security Attack', description: 'Simulate credential stuffing attack' },
  { id: 'maintenance', name: 'Scheduled Maintenance', description: 'Simulate maintenance window' },
  { id: 'custom', name: 'Custom Scenario', description: 'Define custom parameters' },
]

export default function Simulation() {
  const [selectedTwin, setSelectedTwin] = useState<string>('')
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [simulationData, setSimulationData] = useState<any[]>([])

  const runSimulation = () => {
    if (!selectedTwin || !selectedScenario) return
    
    setIsRunning(true)
    setProgress(0)
    setSimulationData([])

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          return 100
        }
        
        // Add simulation data point
        setSimulationData(data => [
          ...data,
          {
            timestamp: `Step ${data.length + 1}`,
            state: Math.random() * 100,
            risk: Math.random() * 50,
            anomaly: Math.random() * 30,
          }
        ])
        
        return prev + 5
      })
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Simulation Sandbox</h1>
        <p className="text-slate-400 mt-1">Test hypothetical scenarios and predict outcomes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Twin Selection */}
          <div className="glass rounded-2xl p-6 border border-slate-700/50">
            <h3 className="font-semibold text-white mb-4">Select Twin</h3>
            <div className="space-y-2">
              {mockTwins.map(twin => (
                <button
                  key={twin.id}
                  onClick={() => setSelectedTwin(twin.id)}
                  className={clsx(
                    'w-full p-3 rounded-xl text-left transition-colors',
                    selectedTwin === twin.id
                      ? 'bg-blue-600/30 border border-blue-500/50 text-white'
                      : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                  )}
                >
                  <p className="font-medium">{twin.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{twin.id}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Selection */}
          <div className="glass rounded-2xl p-6 border border-slate-700/50">
            <h3 className="font-semibold text-white mb-4">Select Scenario</h3>
            <div className="space-y-2">
              {scenarios.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={clsx(
                    'w-full p-3 rounded-xl text-left transition-colors',
                    selectedScenario === scenario.id
                      ? 'bg-purple-600/30 border border-purple-500/50 text-white'
                      : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                  )}
                >
                  <p className="font-medium">{scenario.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{scenario.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="glass rounded-2xl p-6 border border-slate-700/50">
            <h3 className="font-semibold text-white mb-4">Simulation Controls</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Duration (steps)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  defaultValue="20"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>10</span>
                  <span>100</span>
                </div>
              </div>

              <button
                onClick={runSimulation}
                disabled={!selectedTwin || !selectedScenario || isRunning}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all',
                  isRunning
                    ? 'bg-yellow-600 text-white cursor-wait'
                    : selectedTwin && selectedScenario
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                )}
              >
                {isRunning ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    Running... {progress}%
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-5 w-5" />
                    Run Simulation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Simulation Progress</h3>
                <span className="text-blue-400">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Real-time Results */}
          {simulationData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border border-slate-700/50"
            >
              <h3 className="font-semibold text-white mb-4">Simulation Results</h3>
              <MultiLineChart
                data={simulationData}
                lines={[
                  { key: 'state', color: '#3b82f6', name: 'State Score' },
                  { key: 'risk', color: '#ef4444', name: 'Risk Level' },
                  { key: 'anomaly', color: '#f59e0b', name: 'Anomaly Score' },
                ]}
                height={300}
              />
            </motion.div>
          )}

          {/* Summary */}
          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border border-green-500/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <ChartBarIcon className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-white">Simulation Summary</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400">Total Steps</p>
                  <p className="text-xl font-bold text-white">{simulationData.length}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400">State Changes</p>
                  <p className="text-xl font-bold text-blue-400">12</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400">Anomalies Detected</p>
                  <p className="text-xl font-bold text-yellow-400">3</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-400">Actions Triggered</p>
                  <p className="text-xl font-bold text-purple-400">5</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-400">Key Findings</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    Twin successfully handled simulated load increase
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-yellow-400" />
                    3 minor anomalies detected and auto-resolved
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    All automated actions executed successfully
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  Export Report
                </button>
                <button
                  onClick={() => {
                    setProgress(0)
                    setSimulationData([])
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {simulationData.length === 0 && !isRunning && (
            <div className="glass rounded-2xl p-12 border border-slate-700/50 text-center">
              <BeakerIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Ready to Simulate</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Select a digital twin and scenario to run a simulation. You'll see real-time 
                results and predictions based on the hypothetical conditions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

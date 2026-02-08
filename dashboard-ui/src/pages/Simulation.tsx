import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BeakerIcon,
  PlayIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { MultiLineChart } from '../components/Charts'
import { TwinSnapshot } from '../types'
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold gradient-text">Simulation Sandbox</h1>
        <p className="text-slate-500 mt-1">Test hypothetical scenarios and predict outcomes</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Twin Selection */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold gradient-text mb-4">Select Twin</h3>
            <div className="space-y-2">
              {mockTwins.map(twin => (
                <motion.button
                  key={twin.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTwin(twin.id)}
                  className={clsx(
                    'w-full p-3 rounded-xl text-left transition-all duration-300',
                    selectedTwin === twin.id
                      ? 'glass-light border-primary-500/50 text-white shadow-neon-blue'
                      : 'glass-light border-transparent text-slate-300 hover:border-primary-500/30'
                  )}
                >
                  <p className="font-medium">{twin.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{twin.id}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Scenario Selection */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold gradient-text mb-4">Select Scenario</h3>
            <div className="space-y-2">
              {scenarios.map(scenario => (
                <motion.button
                  key={scenario.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={clsx(
                    'w-full p-3 rounded-xl text-left transition-all duration-300',
                    selectedScenario === scenario.id
                      ? 'glass-light border-accent-500/50 text-white shadow-neon-purple'
                      : 'glass-light border-transparent text-slate-300 hover:border-accent-500/30'
                  )}
                >
                  <p className="font-medium">{scenario.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{scenario.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold gradient-text mb-4">Simulation Controls</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-2">Duration (steps)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  defaultValue="20"
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>10</span>
                  <span>100</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runSimulation}
                disabled={!selectedTwin || !selectedScenario || isRunning}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold transition-all',
                  isRunning
                    ? 'bg-gradient-to-r from-warning-500 to-warning-600 text-white cursor-wait'
                    : selectedTwin && selectedScenario
                      ? 'btn-gradient'
                      : 'bg-dark-300 text-slate-500 cursor-not-allowed'
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
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 border-primary-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold gradient-text">Simulation Progress</h3>
                <span className="text-primary-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-dark-300 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
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
              className="glass-card p-6"
            >
              <h3 className="font-semibold gradient-text mb-4">Simulation Results</h3>
              <MultiLineChart
                data={simulationData}
                lines={[
                  { key: 'state', color: '#f97316', name: 'State Score' },
                  { key: 'risk', color: '#f87171', name: 'Risk Level' },
                  { key: 'anomaly', color: '#fbbf24', name: 'Anomaly Score' },
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
              className="glass-card p-6 border-success-500/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-success-500/20">
                  <ChartBarIcon className="h-5 w-5 text-success-400" />
                </div>
                <h3 className="font-semibold gradient-text">Simulation Summary</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 glass-light rounded-xl">
                  <p className="text-xs text-slate-500 font-medium">Total Steps</p>
                  <p className="text-xl font-bold text-white">{simulationData.length}</p>
                </div>
                <div className="p-4 glass-light rounded-xl">
                  <p className="text-xs text-slate-500 font-medium">State Changes</p>
                  <p className="text-xl font-bold text-primary-400">12</p>
                </div>
                <div className="p-4 glass-light rounded-xl">
                  <p className="text-xs text-slate-500 font-medium">Anomalies Detected</p>
                  <p className="text-xl font-bold text-warning-400">3</p>
                </div>
                <div className="p-4 glass-light rounded-xl">
                  <p className="text-xs text-slate-500 font-medium">Actions Triggered</p>
                  <p className="text-xl font-bold text-accent-400">5</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-400">Key Findings</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-primary-400 shadow-lg" style={{ boxShadow: '0 0 8px rgba(102, 126, 234, 0.5)' }} />
                    Twin successfully handled simulated load increase
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-warning-400 shadow-lg" style={{ boxShadow: '0 0 8px rgba(251, 191, 36, 0.5)' }} />
                    3 minor anomalies detected and auto-resolved
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-success-400 shadow-lg" style={{ boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)' }} />
                    All automated actions executed successfully
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2.5 btn-gradient text-sm"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  Export Report
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setProgress(0)
                    setSimulationData([])
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 glass-light rounded-xl text-slate-300 text-sm font-medium hover:border-primary-500/30 transition-all"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Reset
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {simulationData.length === 0 && !isRunning && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-12 text-center"
            >
              <div className="inline-flex p-4 rounded-2xl glass-light mb-4">
                <BeakerIcon className="h-16 w-16 text-primary-400 opacity-60" />
              </div>
              <h3 className="text-lg font-semibold gradient-text mb-2">Ready to Simulate</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Select a digital twin and scenario to run a simulation. You'll see real-time 
                results and predictions based on the hypothetical conditions.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

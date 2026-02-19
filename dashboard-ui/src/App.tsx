// Minor change for commit history
/**
 * Main Application Component
 * Defines the routing structure for the Digital Twin Dashboard
 */

import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TwinExplorer from './pages/TwinExplorer'
import TwinDetail from './pages/TwinDetail'
import Predictions from './pages/Predictions'
import Anomalies from './pages/Anomalies'
import Actions from './pages/Actions'
import Simulation from './pages/Simulation'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

/**
 * App component with route definitions
 */
function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/twins" element={<TwinExplorer />} />
        <Route path="/twins/:twinId" element={<TwinDetail />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/anomalies" element={<Anomalies />} />
        <Route path="/actions" element={<Actions />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App

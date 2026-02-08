import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  CloudIcon,
  KeyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const settingsSections = [
  { id: 'general', name: 'General', icon: Cog6ToothIcon },
  { id: 'notifications', name: 'Notifications', icon: BellIcon },
  { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  { id: 'integrations', name: 'Integrations', icon: CloudIcon },
  { id: 'api', name: 'API Keys', icon: KeyIcon },
  { id: 'team', name: 'Team', icon: UserGroupIcon },
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Configure your digital twin platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="glass rounded-2xl p-4 border border-slate-700/50 h-fit">
          <nav className="space-y-1">
            {settingsSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  activeSection === section.id
                    ? 'bg-blue-600/30 text-white border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                )}
              >
                <section.icon className="h-5 w-5" />
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'general' && <GeneralSettings />}
          {activeSection === 'notifications' && <NotificationSettings />}
          {activeSection === 'security' && <SecuritySettings />}
          {activeSection === 'integrations' && <IntegrationSettings />}
          {activeSection === 'api' && <ApiSettings />}
          {activeSection === 'team' && <TeamSettings />}
        </div>
      </div>
    </div>
  )
}

function GeneralSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-4">Platform Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Platform Name</label>
            <input
              type="text"
              defaultValue="Digital Twin Platform"
              className="w-full px-4 py-2.5 glass rounded-xl border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tenant ID</label>
            <input
              type="text"
              defaultValue="tenant-001"
              className="w-full px-4 py-2.5 glass rounded-xl border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Time Zone</label>
            <select className="w-full px-4 py-2.5 glass rounded-xl border border-slate-700/50 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <option value="UTC" className="bg-slate-800">UTC</option>
              <option value="EST" className="bg-slate-800">EST (UTC-5)</option>
              <option value="PST" className="bg-slate-800">PST (UTC-8)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-4">Processing Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Real-time Processing</p>
              <p className="text-xs text-slate-400">Enable real-time event processing</p>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Auto-scaling</p>
              <p className="text-xs text-slate-400">Automatically scale resources based on load</p>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Debug Mode</p>
              <p className="text-xs text-slate-400">Enable detailed logging for debugging</p>
            </div>
            <ToggleSwitch />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all">
          Save Changes
        </button>
      </div>
    </motion.div>
  )
}

function NotificationSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Critical Anomalies</p>
              <p className="text-xs text-slate-400">Receive alerts for critical anomalies</p>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Prediction Alerts</p>
              <p className="text-xs text-slate-400">Get notified of high-confidence predictions</p>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Action Completions</p>
              <p className="text-xs text-slate-400">Notify when automated actions complete</p>
            </div>
            <ToggleSwitch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">System Health</p>
              <p className="text-xs text-slate-400">Alerts for system health issues</p>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-4">Channels</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              defaultValue="admin@example.com"
              className="w-full px-4 py-2.5 glass rounded-xl border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Slack Webhook</label>
            <input
              type="url"
              placeholder="https://hooks.slack.com/..."
              className="w-full px-4 py-2.5 glass rounded-xl border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SecuritySettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-4">Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
              <p className="text-xs text-slate-400">Require 2FA for all users</p>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">SSO Integration</p>
              <p className="text-xs text-slate-400">Enable Single Sign-On</p>
            </div>
            <ToggleSwitch />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              defaultValue={60}
              className="w-full px-4 py-2.5 glass rounded-xl border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-4">Data Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Encryption at Rest</p>
              <p className="text-xs text-slate-400">Encrypt all stored data</p>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Audit Logging</p>
              <p className="text-xs text-slate-400">Log all system activities</p>
            </div>
            <ToggleSwitch defaultChecked />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function IntegrationSettings() {
  const integrations = [
    { name: 'Kafka', status: 'connected', icon: '📊' },
    { name: 'Redis', status: 'connected', icon: '🔴' },
    { name: 'PostgreSQL', status: 'connected', icon: '🐘' },
    { name: 'ML Service', status: 'connected', icon: '🤖' },
    { name: 'Prometheus', status: 'disconnected', icon: '📈' },
    { name: 'Grafana', status: 'disconnected', icon: '📉' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-4">Connected Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map(integration => (
            <div
              key={integration.name}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{integration.name}</p>
                  <p className={`text-xs ${
                    integration.status === 'connected' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {integration.status}
                  </p>
                </div>
              </div>
              <button className="px-3 py-1.5 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function ApiSettings() {
  const apiKeys = [
    { name: 'Production API Key', key: 'dt_prod_xxx...xxx', created: '2024-01-01', lastUsed: '2024-01-22' },
    { name: 'Development API Key', key: 'dt_dev_xxx...xxx', created: '2024-01-15', lastUsed: '2024-01-21' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">API Keys</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
            Generate New Key
          </button>
        </div>
        <div className="space-y-4">
          {apiKeys.map((apiKey, index) => (
            <div key={index} className="p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{apiKey.name}</p>
                  <p className="text-xs font-mono text-slate-400 mt-1">{apiKey.key}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
                    Copy
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors">
                    Revoke
                  </button>
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-slate-500">
                <span>Created: {apiKey.created}</span>
                <span>Last used: {apiKey.lastUsed}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function TeamSettings() {
  const members = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: 'JD' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', avatar: 'JS' },
    { name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', avatar: 'BW' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Team Members</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
            Invite Member
          </button>
        </div>
        <div className="space-y-4">
          {members.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  {member.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{member.name}</p>
                  <p className="text-xs text-slate-400">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  member.role === 'Admin' ? 'bg-purple-500/20 text-purple-400' :
                  member.role === 'Editor' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {member.role}
                </span>
                <button className="px-3 py-1.5 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <button
      onClick={() => setChecked(!checked)}
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-blue-600' : 'bg-slate-600'
      )}
    >
      <span
        className={clsx(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}

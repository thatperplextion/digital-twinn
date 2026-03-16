import { useState } from "react";
import { motion } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CubeIcon
} from "@heroicons/react/24/outline";
import TwinCard from "../components/TwinCard";
import clsx from "clsx";
const generateMockTwins = () => {
  const types = ["SMART_SENSOR", "USER_BEHAVIOR", "MACHINE", "VEHICLE", "BUILDING", "PROCESS"];
  const states = ["INITIAL", "ACTIVE", "IDLE", "WARNING", "CRITICAL"];
  const healthStatuses = ["HEALTHY", "DEGRADED", "WARNING", "CRITICAL"];
  return Array.from({ length: 24 }, (_, i) => ({
    id: `TWIN-${String(i + 1).padStart(3, "0")}`,
    entityType: types[Math.floor(Math.random() * types.length)],
    name: `Digital Twin ${i + 1}`,
    description: `Description for twin ${i + 1}`,
    staticAttributes: {},
    dynamicState: {},
    behavioralMetrics: {
      activityScore: Math.random(),
      riskScore: Math.random(),
      anomalyScore: Math.random() * 0.3,
      engagementScore: Math.random(),
      performanceScore: Math.random(),
      customMetrics: {},
      lastCalculatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    health: {
      status: healthStatuses[Math.floor(Math.random() * healthStatuses.length)],
      healthScore: Math.floor(Math.random() * 50) + 50,
      lastHealthCheck: (/* @__PURE__ */ new Date()).toISOString(),
      issues: [],
      metrics: {}
    },
    currentStateName: states[Math.floor(Math.random() * states.length)],
    stateConfidence: Math.random() * 0.3 + 0.7,
    lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    snapshotTime: (/* @__PURE__ */ new Date()).toISOString()
  }));
};
function TwinExplorer() {
  const [twins] = useState(generateMockTwins());
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [healthFilter, setHealthFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const filteredTwins = twins.filter((twin) => {
    const matchesSearch = twin.name.toLowerCase().includes(filter.toLowerCase()) || twin.id.toLowerCase().includes(filter.toLowerCase());
    const matchesType = !entityTypeFilter || twin.entityType === entityTypeFilter;
    const matchesHealth = !healthFilter || twin.health?.status === healthFilter;
    return matchesSearch && matchesType && matchesHealth;
  });
  const entityTypes = [...new Set(twins.map((t) => t.entityType))];
  const healthStatuses = ["HEALTHY", "DEGRADED", "WARNING", "CRITICAL"];
  const stats = {
    total: twins.length,
    healthy: twins.filter((t) => t.health?.status === "HEALTHY").length,
    warning: twins.filter((t) => t.health?.status === "WARNING" || t.health?.status === "DEGRADED").length,
    critical: twins.filter((t) => t.health?.status === "CRITICAL").length
  };
  return <div className="space-y-6">{
    /* Header */
  }<div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-white">Twin Explorer</h1><p className="text-slate-400 mt-1">Manage and monitor all digital twins</p></div><button
    onClick={() => setShowCreateModal(true)}
    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg"
  ><PlusIcon className="h-5 w-5" />
          Create Twin
        </button></div>{
    /* Stats Bar */
  }<div className="grid grid-cols-4 gap-4"><div className="glass rounded-xl p-4 border border-slate-700/50"><p className="text-sm text-slate-400">Total Twins</p><p className="text-2xl font-bold text-white mt-1">{stats.total}</p></div><div className="glass rounded-xl p-4 border border-green-500/30"><p className="text-sm text-green-400">Healthy</p><p className="text-2xl font-bold text-green-400 mt-1">{stats.healthy}</p></div><div className="glass rounded-xl p-4 border border-yellow-500/30"><p className="text-sm text-yellow-400">Warning</p><p className="text-2xl font-bold text-yellow-400 mt-1">{stats.warning}</p></div><div className="glass rounded-xl p-4 border border-red-500/30"><p className="text-sm text-red-400">Critical</p><p className="text-2xl font-bold text-red-400 mt-1">{stats.critical}</p></div></div>{
    /* Filters */
  }<div className="flex items-center gap-4 flex-wrap">{
    /* Search */
  }<div className="relative flex-1 min-w-[300px]"><MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><input
    type="text"
    placeholder="Search by name or ID..."
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    className="w-full pl-10 pr-4 py-2.5 glass rounded-xl border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
  /></div>{
    /* Entity Type Filter */
  }<select
    value={entityTypeFilter}
    onChange={(e) => setEntityTypeFilter(e.target.value)}
    className="px-4 py-2.5 glass rounded-xl border border-slate-700/50 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  ><option value="" className="bg-slate-800">All Types</option>{entityTypes.map((type) => <option key={type} value={type} className="bg-slate-800">{type}</option>)}</select>{
    /* Health Filter */
  }<select
    value={healthFilter}
    onChange={(e) => setHealthFilter(e.target.value)}
    className="px-4 py-2.5 glass rounded-xl border border-slate-700/50 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  ><option value="" className="bg-slate-800">All Health</option>{healthStatuses.map((status) => <option key={status} value={status} className="bg-slate-800">{status}</option>)}</select>{
    /* View Toggle */
  }<div className="flex items-center gap-1 p-1 glass rounded-lg border border-slate-700/50"><button
    onClick={() => setView("grid")}
    className={clsx(
      "p-2 rounded-md transition-colors",
      view === "grid" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
    )}
  ><Squares2X2Icon className="h-5 w-5" /></button><button
    onClick={() => setView("list")}
    className={clsx(
      "p-2 rounded-md transition-colors",
      view === "list" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
    )}
  ><ListBulletIcon className="h-5 w-5" /></button></div></div>{
    /* Results Count */
  }<div className="flex items-center gap-2 text-sm text-slate-400"><CubeIcon className="h-4 w-4" /><span>Showing {filteredTwins.length} of {twins.length} twins</span></div>{
    /* Twin Grid/List */
  }{view === "grid" ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{filteredTwins.map((twin, index) => <motion.div
    key={twin.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  ><TwinCard twin={twin} /></motion.div>)}</div> : <div className="space-y-2">{filteredTwins.map((twin, index) => <motion.div
    key={twin.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.03 }}
  ><TwinCard twin={twin} compact /></motion.div>)}</div>}{
    /* Empty State */
  }{filteredTwins.length === 0 && <div className="text-center py-12"><CubeIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" /><h3 className="text-lg font-medium text-white mb-2">No twins found</h3><p className="text-slate-400">Try adjusting your filters or create a new twin</p></div>}{
    /* Create Modal */
  }{showCreateModal && <CreateTwinModal onClose={() => setShowCreateModal(false)} />}</div>;
}
function CreateTwinModal({ onClose }) {
  const [formData, setFormData] = useState({
    entityType: "SMART_SENSOR",
    name: "",
    description: "",
    staticAttributes: {},
    initialState: {},
    tags: []
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating twin:", formData);
    onClose();
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="w-full max-w-lg glass rounded-2xl border border-slate-700/50 overflow-hidden"
  ><div className="p-6 border-b border-slate-700/50"><h2 className="text-xl font-bold text-white">Create Digital Twin</h2><p className="text-sm text-slate-400 mt-1">Define a new digital twin entity</p></div><form onSubmit={handleSubmit} className="p-6 space-y-4"><div><label className="block text-sm font-medium text-slate-300 mb-1">Entity Type</label><select
    value={formData.entityType}
    onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
    className="w-full px-4 py-2.5 glass rounded-xl border border-slate-700/50 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  ><option value="SMART_SENSOR" className="bg-slate-800">Smart Sensor</option><option value="USER_BEHAVIOR" className="bg-slate-800">User Behavior</option><option value="MACHINE" className="bg-slate-800">Machine</option><option value="VEHICLE" className="bg-slate-800">Vehicle</option><option value="BUILDING" className="bg-slate-800">Building</option><option value="PROCESS" className="bg-slate-800">Process</option></select></div><div><label className="block text-sm font-medium text-slate-300 mb-1">Name</label><input
    type="text"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    placeholder="Enter twin name..."
    className="w-full px-4 py-2.5 glass rounded-xl border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
    required
  /></div><div><label className="block text-sm font-medium text-slate-300 mb-1">Description</label><textarea
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    placeholder="Describe this digital twin..."
    rows={3}
    className="w-full px-4 py-2.5 glass rounded-xl border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
  /></div><div className="flex gap-3 pt-4"><button
    type="button"
    onClick={onClose}
    className="flex-1 px-4 py-2.5 glass rounded-xl border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
  >
              Cancel
            </button><button
    type="submit"
    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all"
  >
              Create Twin
            </button></div></form></motion.div></div>;
}
export {
  TwinExplorer as default
};

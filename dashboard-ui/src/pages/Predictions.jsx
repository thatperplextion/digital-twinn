import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { GradientAreaChart, PieChartComponent } from "../components/Charts";
import clsx from "clsx";
const mockPredictions = [
  {
    id: "PRED-001",
    twinId: "TWIN-001",
    type: "NEXT_ACTION",
    description: "User likely to make a purchase within 24 hours",
    predictedOutcome: "PURCHASE",
    predictedValues: { amount: 150, category: "electronics" },
    probability: 0.87,
    confidence: 0.92,
    timeHorizon: "PT24H",
    predictionTime: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: new Date(Date.now() + 864e5).toISOString(),
    modelUsed: "user-behavior-v3",
    modelVersion: "3.2.1",
    features: {},
    explanation: {
      summary: "Based on browsing patterns and cart activity",
      keyFactors: [
        { name: "cart_value", value: 150, impact: 0.4, direction: "POSITIVE" },
        { name: "session_duration", value: 25, impact: 0.3, direction: "POSITIVE" }
      ],
      confidence: "HIGH",
      methodology: "XGBoost Classifier"
    },
    status: "PENDING"
  },
  {
    id: "PRED-002",
    twinId: "TWIN-003",
    type: "FAILURE_PROBABILITY",
    description: "Machine component showing early wear indicators",
    predictedOutcome: "MAINTENANCE_NEEDED",
    predictedValues: { component: "bearing_a", timeToFailure: "168h" },
    probability: 0.72,
    confidence: 0.85,
    timeHorizon: "PT168H",
    predictionTime: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: new Date(Date.now() + 6048e5).toISOString(),
    modelUsed: "predictive-maintenance-v2",
    modelVersion: "2.1.0",
    features: {},
    explanation: {
      summary: "Vibration patterns indicate bearing degradation",
      keyFactors: [
        { name: "vibration_frequency", value: 120, impact: 0.5, direction: "NEGATIVE" }
      ],
      confidence: "MEDIUM",
      methodology: "LSTM with Attention"
    },
    status: "PENDING"
  },
  {
    id: "PRED-003",
    twinId: "TWIN-002",
    type: "RISK_FORECAST",
    description: "Elevated fraud risk detected for transaction pattern",
    predictedOutcome: "HIGH_RISK",
    predictedValues: { riskLevel: 0.78, factors: ["unusual_location", "high_amount"] },
    probability: 0.78,
    confidence: 0.91,
    timeHorizon: "PT1H",
    predictionTime: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: new Date(Date.now() + 36e5).toISOString(),
    modelUsed: "fraud-detection-v4",
    modelVersion: "4.0.2",
    features: {},
    explanation: {
      summary: "Transaction patterns deviate from established behavior",
      keyFactors: [
        { name: "location_change", value: true, impact: 0.6, direction: "NEGATIVE" },
        { name: "amount_deviation", value: 3.5, impact: 0.4, direction: "NEGATIVE" }
      ],
      confidence: "HIGH",
      methodology: "Ensemble (RF + NN)"
    },
    status: "VALIDATED"
  }
];
const predictionTypes = [
  { name: "Next Action", value: 45, color: "#3b82f6" },
  { name: "State Transition", value: 28, color: "#22c55e" },
  { name: "Risk Forecast", value: 15, color: "#f59e0b" },
  { name: "Failure Probability", value: 12, color: "#ef4444" }
];
const accuracyData = Array.from({ length: 14 }, (_, i) => ({
  timestamp: `Day ${i + 1}`,
  accuracy: 85 + Math.random() * 12,
  predictions: Math.floor(50 + Math.random() * 100)
}));
function Predictions() {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const filteredPredictions = mockPredictions.filter((pred) => {
    const matchesType = !filter || pred.type === filter;
    const matchesStatus = !statusFilter || pred.status === statusFilter;
    return matchesType && matchesStatus;
  });
  const stats = {
    total: mockPredictions.length,
    accuracy: 94.7,
    pending: mockPredictions.filter((p) => p.status === "PENDING").length,
    validated: mockPredictions.filter((p) => p.status === "VALIDATED").length
  };
  const typeColors = {
    NEXT_ACTION: "text-blue-400 bg-blue-500/20",
    STATE_TRANSITION: "text-green-400 bg-green-500/20",
    RISK_FORECAST: "text-yellow-400 bg-yellow-500/20",
    FAILURE_PROBABILITY: "text-red-400 bg-red-500/20",
    BEHAVIOR_TRAJECTORY: "text-purple-400 bg-purple-500/20"
  };
  const statusColors = {
    PENDING: "text-yellow-400 bg-yellow-500/20",
    VALIDATED: "text-green-400 bg-green-500/20",
    OCCURRED: "text-blue-400 bg-blue-500/20",
    EXPIRED: "text-slate-400 bg-slate-500/20",
    INVALIDATED: "text-red-400 bg-red-500/20"
  };
  return <div className="space-y-6">{
    /* Header */
  }<div><h1 className="text-2xl font-bold text-white">Predictions</h1><p className="text-slate-400 mt-1">AI-powered predictive intelligence for digital twins</p></div>{
    /* Stats */
  }<div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="glass rounded-xl p-4 border border-slate-700/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/20 text-blue-400"><ChartBarIcon className="h-5 w-5" /></div><div><p className="text-sm text-slate-400">Total Predictions</p><p className="text-xl font-bold text-white">{stats.total}</p></div></div></div><div className="glass rounded-xl p-4 border border-slate-700/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/20 text-green-400"><ArrowTrendingUpIcon className="h-5 w-5" /></div><div><p className="text-sm text-slate-400">Accuracy Rate</p><p className="text-xl font-bold text-white">{stats.accuracy}%</p></div></div></div><div className="glass rounded-xl p-4 border border-slate-700/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400"><ClockIcon className="h-5 w-5" /></div><div><p className="text-sm text-slate-400">Pending</p><p className="text-xl font-bold text-white">{stats.pending}</p></div></div></div><div className="glass rounded-xl p-4 border border-slate-700/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><CheckCircleIcon className="h-5 w-5" /></div><div><p className="text-sm text-slate-400">Validated</p><p className="text-xl font-bold text-white">{stats.validated}</p></div></div></div></div>{
    /* Charts */
  }<div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-700/50"><h3 className="font-semibold text-white mb-4">Prediction Accuracy Trend</h3><GradientAreaChart
    data={accuracyData}
    dataKey="accuracy"
    color="#22c55e"
    height={250}
  /></div><div className="glass rounded-2xl p-6 border border-slate-700/50"><h3 className="font-semibold text-white mb-4">By Type</h3><PieChartComponent data={predictionTypes} height={200} showLabels={false} /><div className="mt-4 space-y-2">{predictionTypes.map((type) => <div key={type.name} className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} /><span className="text-sm text-slate-400">{type.name}</span></div><span className="text-sm font-medium text-white">{type.value}</span></div>)}</div></div></div>{
    /* Filters */
  }<div className="flex gap-4"><select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    className="px-4 py-2 glass rounded-xl border border-slate-700/50 text-white bg-transparent"
  ><option value="" className="bg-slate-800">All Types</option><option value="NEXT_ACTION" className="bg-slate-800">Next Action</option><option value="STATE_TRANSITION" className="bg-slate-800">State Transition</option><option value="RISK_FORECAST" className="bg-slate-800">Risk Forecast</option><option value="FAILURE_PROBABILITY" className="bg-slate-800">Failure Probability</option></select><select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="px-4 py-2 glass rounded-xl border border-slate-700/50 text-white bg-transparent"
  ><option value="" className="bg-slate-800">All Status</option><option value="PENDING" className="bg-slate-800">Pending</option><option value="VALIDATED" className="bg-slate-800">Validated</option><option value="OCCURRED" className="bg-slate-800">Occurred</option><option value="EXPIRED" className="bg-slate-800">Expired</option></select></div>{
    /* Predictions List */
  }<div className="space-y-4">{filteredPredictions.map((pred, index) => <motion.div
    key={pred.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="glass rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-colors"
  ><div className="flex items-start justify-between"><div className="flex-1"><div className="flex items-center gap-2 flex-wrap"><span className={clsx("px-2 py-1 rounded text-xs font-medium", typeColors[pred.type])}>{pred.type.replace("_", " ")}</span><span className={clsx("px-2 py-1 rounded text-xs font-medium", statusColors[pred.status])}>{pred.status}</span><span className="text-xs text-slate-500">{pred.id}</span><span className="text-xs text-slate-500">•</span><span className="text-xs text-slate-500">Twin: {pred.twinId}</span></div><h4 className="font-medium text-white mt-2">{pred.description}</h4><p className="text-sm text-slate-400 mt-1">
                  Outcome: <span className="text-white">{pred.predictedOutcome}</span></p></div><div className="text-right ml-4"><p className="text-3xl font-bold text-white">{(pred.probability * 100).toFixed(0)}%</p><p className="text-xs text-slate-400">Probability</p></div></div><div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-4"><div><p className="text-sm text-slate-400">{pred.explanation.summary}</p><div className="mt-2 flex flex-wrap gap-2">{pred.explanation.keyFactors.slice(0, 3).map((factor, i) => <span
    key={i}
    className={clsx(
      "px-2 py-1 rounded text-xs",
      factor.direction === "POSITIVE" ? "bg-green-500/20 text-green-400" : factor.direction === "NEGATIVE" ? "bg-red-500/20 text-red-400" : "bg-slate-500/20 text-slate-400"
    )}
  >{factor.name}: {String(factor.value)}</span>)}</div></div><div className="text-sm text-slate-500 md:text-right space-y-1"><p>Model: {pred.modelUsed} v{pred.modelVersion}</p><p>Confidence: {pred.explanation.confidence}</p><p>Expires: {new Date(pred.expiresAt).toLocaleString()}</p></div></div></motion.div>)}</div></div>;
}
export {
  Predictions as default
};

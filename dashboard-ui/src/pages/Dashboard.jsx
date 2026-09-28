import { motion } from "framer-motion";
import {
  CubeIcon,
  BoltIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import MetricCard from "../components/MetricCard";
import TwinCard from "../components/TwinCard";
import { PieChartComponent, MetricGauge } from "../components/Charts";
import { SkeletonCard, EmptyState } from "../components/common";
import { useDashboardStats, useTwins } from "../hooks/useQueries";

const HEALTH_COLORS = {
  HEALTHY: "#34d399",
  WARNING: "#fbbf24",
  DEGRADED: "#fbbf24",
  CRITICAL: "#f87171",
  UNKNOWN: "#94a3b8"
};

function buildHealthDistribution(twins) {
  const counts = twins.reduce((acc, twin) => {
    const status = twin.health?.status || "UNKNOWN";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: HEALTH_COLORS[name] || HEALTH_COLORS.UNKNOWN
  }));
}

function averageScore(twins, path) {
  if (!twins.length) return 0;
  const total = twins.reduce((sum, twin) => sum + (path(twin) || 0), 0);
  return (total / twins.length) * 100;
}

function Dashboard() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
  const { data: twins, isLoading: twinsLoading, isError: twinsError } = useTwins();

  const isLoading = statsLoading || twinsLoading;
  const isError = statsError || twinsError;
  const twinList = twins || [];

  const healthDistribution = buildHealthDistribution(twinList);
  const avgHealthScore = averageScore(twinList, (t) => (t.health?.healthScore ?? 0) / 100);
  const avgRiskScore = averageScore(twinList, (t) => t.behavioralMetrics?.riskScore);
  const recentTwins = [...twinList]
    .sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Command Center</h1>
          <p className="text-slate-500 mt-1">Real-time digital twin monitoring and intelligence</p>
        </div>
        <motion.div
          animate={{
            boxShadow: isError
              ? ["0 0 0 rgba(248, 113, 113, 0)", "0 0 20px rgba(248, 113, 113, 0.3)", "0 0 0 rgba(248, 113, 113, 0)"]
              : ["0 0 0 rgba(52, 211, 153, 0)", "0 0 20px rgba(52, 211, 153, 0.3)", "0 0 0 rgba(52, 211, 153, 0)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isError ? "bg-danger-400" : "bg-success-400"}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isError ? "bg-danger-400" : "bg-success-400"}`} />
          </span>
          <span className={`text-sm font-medium ${isError ? "text-danger-400" : "text-success-400"}`}>
            {isError ? "Connection Issue" : "All Systems Operational"}
          </span>
        </motion.div>
      </motion.div>

      {isError && (
        <div className="glass-card p-4 border border-danger-500/30 text-sm text-danger-300">
          Couldn't reach the dashboard API. Showing the last known data where available.
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Digital Twins"
              value={(stats?.totalTwins ?? twinList.length).toLocaleString()}
              icon={CubeIcon}
              color="blue"
              subtitle={`${healthDistribution.find((h) => h.name === "HEALTHY")?.value ?? 0} healthy`}
            />
            <MetricCard
              title="Active Predictions"
              value={(stats?.activePredictions ?? 0).toLocaleString()}
              icon={ChartBarIcon}
              color="purple"
            />
            <MetricCard
              title="Active Anomalies"
              value={(stats?.activeAnomalies ?? 0).toLocaleString()}
              icon={ExclamationTriangleIcon}
              color="red"
            />
            <MetricCard
              title="Pending Actions"
              value={(stats?.pendingActions ?? 0).toLocaleString()}
              icon={BoltIcon}
              color="green"
            />
          </div>

          {twinList.length === 0 ? (
            <div className="glass-card p-6">
              <EmptyState
                title="No digital twins yet"
                description="Twins will show up here as soon as they're registered with the platform."
              />
            </div>
          ) : (
            <>
              {/* Health & Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6"
                >
                  <h3 className="font-semibold gradient-text mb-4">Twin Health Distribution</h3>
                  <PieChartComponent data={healthDistribution} height={200} showLabels={false} />
                  <div className="mt-4 space-y-2">
                    {healthDistribution.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full shadow-lg" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}40` }} />
                          <span className="text-sm text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2 glass-card p-6"
                >
                  <h3 className="font-semibold gradient-text mb-6">Fleet Performance</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <MetricGauge value={avgHealthScore} title="Avg Health Score" color="#34d399" size="sm" />
                    <MetricGauge value={avgRiskScore} title="Avg Risk Score" color="#f87171" size="sm" />
                  </div>
                </motion.div>
              </div>

              {/* Active Twins */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold gradient-text">Recently Updated Twins</h3>
                  <a href="/twins" className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium">
                    View All →
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentTwins.map((twin) => <TwinCard key={twin.id} twin={twin} compact />)}
                </div>
              </motion.div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;

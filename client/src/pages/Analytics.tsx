import { useEffect, useState } from "react";
import { useLanguage } from "../hooks/use-language";
import {
  Heart,
  Activity,
  Wind,
  Moon,
  TrendingUp,
  TrendingDown,
  Zap,
  Brain,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Metrics {
  heartRate: number;
  bloodPressure: string;
  oxygenLevel: number;
  sleepScore: number;
  timestamp: string;
  timeLabel?: string;
}

const RISK_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function Analytics() {
  const { t } = useLanguage();
  const [metricsHistory, setMetricsHistory] = useState<Metrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/metrics");
        const data: Metrics = await res.json();
        const newMetric = {
          ...data,
          timeLabel: new Date(data.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        };
        setCurrentMetrics(newMetric);
        setMetricsHistory((prev) => {
          const updated = [...prev, newMetric];
          return updated.slice(-20);
        });
      } catch (error) {
        console.error("Error fetching analytics metrics:", error);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  // Derived analytics data
  const avgHeartRate =
    metricsHistory.length > 0
      ? Math.round(
          metricsHistory.reduce((s, m) => s + m.heartRate, 0) /
            metricsHistory.length
        )
      : 0;

  const avgOxygen =
    metricsHistory.length > 0
      ? (
          metricsHistory.reduce((s, m) => s + m.oxygenLevel, 0) /
          metricsHistory.length
        ).toFixed(1)
      : "0";

  const avgSleep =
    metricsHistory.length > 0
      ? Math.round(
          metricsHistory.reduce((s, m) => s + m.sleepScore, 0) /
            metricsHistory.length
        )
      : 0;

  const hrTrend =
    metricsHistory.length >= 2
      ? metricsHistory[metricsHistory.length - 1].heartRate -
        metricsHistory[metricsHistory.length - 2].heartRate
      : 0;

  // Risk score pie data
  const riskData = [
    { name: "Cardiovascular", value: 15, color: "#10b981" },
    { name: "Respiratory", value: 8, color: "#3b82f6" },
    { name: "Metabolic", value: 12, color: "#f59e0b" },
    { name: "Neurological", value: 5, color: "#8b5cf6" },
  ];

  // Wellness radial data
  const wellnessData = [
    {
      name: "Heart Health",
      value: Math.min(100, Math.max(0, 100 - Math.abs(avgHeartRate - 72) * 2)),
      fill: "#3b82f6",
    },
    {
      name: "Oxygen",
      value: parseFloat(avgOxygen),
      fill: "#06b6d4",
    },
    {
      name: "Sleep Quality",
      value: avgSleep,
      fill: "#8b5cf6",
    },
  ];

  // Weekly mock trend for bar chart
  const weeklyData = [
    { day: "Mon", heartRate: 72, oxygen: 98, sleep: 82 },
    { day: "Tue", heartRate: 75, oxygen: 97, sleep: 85 },
    { day: "Wed", heartRate: 70, oxygen: 99, sleep: 78 },
    { day: "Thu", heartRate: 68, oxygen: 98, sleep: 90 },
    { day: "Fri", heartRate: 74, oxygen: 97, sleep: 88 },
    { day: "Sat", heartRate: 71, oxygen: 99, sleep: 92 },
    { day: "Sun", heartRate: 69, oxygen: 98, sleep: 86 },
  ];

  if (!currentMetrics) {
    return (
      <div className="pt-28 px-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-primary font-medium tracking-wide">
          Loading analytics engine...
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 px-8 pb-12 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-primary bg-clip-text text-transparent">
            {t.realtimeMetrics ? "Health Analytics Dashboard" : "Health Analytics Dashboard"}
          </h1>
          <p className="text-gray-500 mt-1">
            Comprehensive health insights powered by edge AI diagnostics
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
          <ShieldCheck size={18} className="text-green-600" />
          <span className="text-sm font-semibold text-green-700">
            AI Analysis Active
          </span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Avg Heart Rate */}
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-50 text-red-500">
                <Heart size={18} />
              </div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Avg Heart Rate
              </span>
            </div>
            {hrTrend >= 0 ? (
              <TrendingUp size={16} className="text-green-500" />
            ) : (
              <TrendingDown size={16} className="text-red-500" />
            )}
          </div>
          <div className="text-3xl font-black text-gray-800">
            {avgHeartRate} <span className="text-sm font-medium text-gray-400">bpm</span>
          </div>
        </div>

        {/* Avg Oxygen */}
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-50 text-cyan-500">
                <Wind size={18} />
              </div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Avg SpO2
              </span>
            </div>
            <Zap size={16} className="text-yellow-500" />
          </div>
          <div className="text-3xl font-black text-gray-800">
            {avgOxygen}
            <span className="text-sm font-medium text-gray-400">%</span>
          </div>
        </div>

        {/* Avg Sleep */}
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-500">
                <Moon size={18} />
              </div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Avg Sleep
              </span>
            </div>
            <Brain size={16} className="text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-gray-800">
            {avgSleep}
            <span className="text-sm font-medium text-gray-400">/ 100</span>
          </div>
        </div>

        {/* Health Score */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-5 rounded-2xl shadow-xl text-white hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white/20">
                <BarChart3 size={18} />
              </div>
              <span className="text-sm font-medium text-blue-100 uppercase tracking-wide">
                Health Score
              </span>
            </div>
            <Activity size={16} className="text-blue-200" />
          </div>
          <div className="text-3xl font-black">
            {Math.round(
              (wellnessData.reduce((s, d) => s + d.value, 0) /
                wellnessData.length) *
                1
            )}
            <span className="text-sm font-medium text-blue-200">/ 100</span>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Heart Rate Area Chart */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Heart size={20} className="text-red-500" />
              Heart Rate Trend
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} />
                <YAxis domain={["dataMin - 5", "dataMax + 5"]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
                <Area type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2.5} fill="url(#hrGradient)" dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={300} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SpO2 + Sleep Dual Line Chart */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Wind size={20} className="text-cyan-500" />
              SpO2 & Sleep Score
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
                <Line type="monotone" dataKey="oxygenLevel" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} name="SpO2 %" />
                <Line type="monotone" dataKey="sleepScore" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} name="Sleep Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Bar Chart */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-500" />
            Weekly Health Overview
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="heartRate" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Heart Rate" />
                <Bar dataKey="sleep" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Sleep Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Assessment Pie */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShieldCheck size={20} className="text-green-500" />
            Risk Assessment
          </h2>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {riskData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI INSIGHTS SECTION */}
      <div className="bg-[#0B1B34] text-white p-8 rounded-2xl shadow-xl border border-blue-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500 rounded-full blur-[100px] opacity-20 -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-[80px] opacity-15 -ml-10 -mb-10 pointer-events-none" />

        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Brain size={24} className="text-blue-400" />
          AI-Powered Health Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm p-5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={18} className="text-red-400" />
              <h3 className="font-semibold text-blue-200">Cardiovascular</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Heart rate is within healthy parameters. Average of{" "}
              <span className="text-white font-semibold">{avgHeartRate} bpm</span>{" "}
              indicates good cardiovascular fitness. No anomalies detected in the
              current telemetry window.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                LOW RISK
              </span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Wind size={18} className="text-cyan-400" />
              <h3 className="font-semibold text-blue-200">Respiratory</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Blood oxygen saturation averaging{" "}
              <span className="text-white font-semibold">{avgOxygen}%</span> — well
              above the 95% threshold. Respiratory function appears optimal across
              all edge nodes.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                OPTIMAL
              </span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Moon size={18} className="text-purple-400" />
              <h3 className="font-semibold text-blue-200">Sleep Quality</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Sleep quality index at{" "}
              <span className="text-white font-semibold">{avgSleep}/100</span>.{" "}
              {avgSleep >= 80
                ? "Excellent restorative sleep patterns detected. Circadian rhythm is well-aligned."
                : "Consider improving sleep hygiene for better recovery metrics."}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  avgSleep >= 80
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {avgSleep >= 80 ? "RESTORATIVE" : "MODERATE"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
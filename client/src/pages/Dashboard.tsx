import { useEffect, useState } from "react";
import { Plus, Activity, Heart, Wind, Moon, X, Wifi, Smartphone, Watch, Stethoscope, CheckCircle2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Metrics {
  heartRate: number;
  bloodPressure: string;
  oxygenLevel: number;
  sleepScore: number;
  timestamp: string;
}
import { useLanguage } from "../hooks/use-language";

export default function Dashboard() {
  const [metricsHistory, setMetricsHistory] = useState<Metrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<Metrics | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("Smartwatch");
  const [connectedDevices, setConnectedDevices] = useState<{name: string, type: string, status: string}[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/metrics");
        const data: Metrics = await res.json();
        
        // Add a readable time format for the chart
        const newMetric = {
          ...data,
          timeLabel: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };

        setCurrentMetrics(newMetric);
        setMetricsHistory((prev) => {
          const updated = [...prev, newMetric];
          return updated.slice(-15); // Keep last 15 data points
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!currentMetrics) {
    return (
      <div className="pt-28 px-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-lg text-primary font-medium tracking-wide">
          Initializing secure edge stream...
        </div>
      </div>
    );
  }

  const isHeartNormal = currentMetrics.heartRate >= 60 && currentMetrics.heartRate <= 100;

  return (
    <div className="pt-28 px-8 pb-12 space-y-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-primary bg-clip-text text-transparent">
            {t.realtimeMetrics || "Real-Time Edge Metrics"}
          </h1>
          <p className="text-gray-500 mt-1">{t.systemStatus ? "Live telemetry strictly monitored from decentralized nodes" : "Live telemetry strictly monitored from decentralized nodes"}</p>
        </div>

        {/* ➕ Add Device Button */}
        <button
          onClick={() => setShowDeviceModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 font-medium"
        >
          <Plus size={18} />
          <span>{t.connectDevice || "Provision Device"}</span>
        </button>
      </div>

      {/* DEVICE MODAL */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowDeviceModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Provision New Device</h2>
              <button onClick={() => setShowDeviceModal(false)} className="p-1 rounded-lg hover:bg-gray-100 transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Device Name</label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={e => setDeviceName(e.target.value)}
                  placeholder="e.g., My Fitness Band"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Device Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "Smartwatch", icon: Watch, label: "Smartwatch" },
                    { value: "Phone", icon: Smartphone, label: "Smartphone" },
                    { value: "Medical", icon: Stethoscope, label: "Medical Device" },
                    { value: "IoT", icon: Wifi, label: "IoT Sensor" }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDeviceType(opt.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        deviceType === opt.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <opt.icon size={18} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Connected Devices List */}
            {connectedDevices.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Connected Devices:</p>
                {connectedDevices.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                    <CheckCircle2 size={16} />
                    <span className="font-medium">{d.name}</span>
                    <span className="text-green-500">• {d.type}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={async () => {
                if (!deviceName.trim()) return;
                setIsConnecting(true);
                await new Promise(r => setTimeout(r, 1500));
                setConnectedDevices(prev => [...prev, { name: deviceName, type: deviceType, status: "Connected" }]);
                setDeviceName("");
                setIsConnecting(false);
              }}
              disabled={!deviceName.trim() || isConnecting}
              className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting...</>
              ) : (
                <><Wifi size={18} /> Connect Device</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* Heart Rate */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Heart size={64} className={isHeartNormal ? "text-blue-500" : "text-red-500"} />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${isHeartNormal ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
              <Heart size={20} className={isHeartNormal ? "" : "animate-pulse"} />
            </div>
            <h3 className="text-gray-600 font-medium tracking-wide text-sm uppercase">{t.heartRate || "Heart Rate"}</h3>
          </div>
          <div className="mt-4">
            <span className={`text-4xl font-black ${isHeartNormal ? "text-gray-800" : "text-red-500"}`}>
              {currentMetrics.heartRate}
            </span>
            <span className="text-gray-400 font-medium ml-1">bpm</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isHeartNormal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isHeartNormal ? "NOMINAL" : "ALERT"}
            </span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Activity size={64} className="text-indigo-500" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Activity size={20} />
            </div>
            <h3 className="text-gray-600 font-medium tracking-wide text-sm uppercase">{t.bloodPressure || "Blood Pressure"}</h3>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-gray-800">
              {currentMetrics.bloodPressure}
            </span>
            <span className="text-gray-400 font-medium ml-1">mmHg</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
             <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">STABLE</span>
          </div>
        </div>

        {/* Oxygen Level */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Wind size={64} className="text-cyan-500" />
          </div>
          <div className="flex items-center gap-2 mb-2">
             <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
              <Wind size={20} />
            </div>
            <h3 className="text-gray-600 font-medium tracking-wide text-sm uppercase">{t.oxygenLevel || "Blood Oxygen"}</h3>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-gray-800">
              {currentMetrics.oxygenLevel}
            </span>
            <span className="text-gray-400 font-medium ml-1">%</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
             <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">OPTIMAL</span>
          </div>
        </div>

        {/* Sleep Score */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Moon size={64} className="text-purple-500" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Moon size={20} />
            </div>
            <h3 className="text-gray-600 font-medium tracking-wide text-sm uppercase">{t.sleepScore || "Sleep Score"}</h3>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-gray-800">
              {currentMetrics.sleepScore}
            </span>
            <span className="text-gray-400 font-medium ml-1">/ 100</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
             <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">RESTORATIVE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">{t.activityTrends || "Telemetry Stream"}</h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Sync</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timeLabel" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#888' }} 
                  dy={10} 
                />
                <YAxis 
                  domain={['dataMin - 10', 'dataMax + 10']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#888' }} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#333', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="heartRate" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: '#1d4ed8', strokeWidth: 2 }}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="space-y-6">
          {/* SYSTEM STATUS */}
          <div className="bg-[#0B1B34] text-white p-6 rounded-2xl shadow-xl border border-blue-900/50 relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
            
            <h2 className="text-sm font-semibold text-blue-300 tracking-widest uppercase mb-6 flex items-center gap-2">
              <Activity size={16} /> {t.systemStatus || "Grid Status"}
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t.edgeNetwork || "Edge Network"}</span>
                <span className="font-medium text-green-400">Connected</span>
              </div>
              <div className="w-full bg-blue-900/50 rounded-full h-1.5">
                 <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400">{t.nodeConnectivity || "Node Sync"}</span>
                <span className="font-medium text-green-400">100%</span>
              </div>
              <div className="w-full bg-blue-900/50 rounded-full h-1.5">
                 <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400">{t.aiProcessing || "AI Diagnostic Accuracy"}</span>
                <span className="font-medium text-green-400">100%</span>
              </div>
               <div className="w-full bg-blue-900/50 rounded-full h-1.5">
                 <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          {/* RECENT ALERTS */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
            <h2 className="text-sm font-semibold text-gray-500 tracking-widest uppercase mb-5">
              {t.recentAlerts || "Protocol Log"}
            </h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Irregular heart rate detected</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Medication protocol completed</p>
                  <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Weekly cryptographic proof verified</p>
                  <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
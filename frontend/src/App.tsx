import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BarChart3,
  Zap,
  TrendingUp,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  HardDrive,
  Cpu,
  Upload,
  Download,
  Lock,
  LogIn,
  LayoutGrid,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricCard } from './components/MetricCard';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Metrics {
  activeConnections: number;
  totalRequests: number;
  responses2xx: number;
  responses3xx: number;
  responses4xx: number;
  responses5xx: number;
  bytesReceived: number;
  bytesSent: number;
  totalProcessingTimeMs: number;
}

interface TimeseriesPoint {
  time: string;
  rps: number;
  avgLatency: number;
  activeConnections: number;
  bytesSentRate: number;
  bytesRecvRate: number;
  errorRate: number;
  avgReqSize: number;
  avgResSize: number;
  efficiency: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatMs = (ms: number): string => {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const POLL_INTERVAL_MS = 2000;
const MAX_HISTORY = 30;

// ─── Main App ───────────────────────────────────────────────────────────────────
function App() {
  const [auth, setAuth] = useState<string | null>(() => sessionStorage.getItem('dashboard_auth'));
  const [activeTab, setActiveTab] = useState<'overview' | 'server'>('overview');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [history, setHistory] = useState<TimeseriesPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState<number>(Date.now());
  const prevMetrics = useRef<Metrics | null>(null);
  const prevTimestamp = useRef<number>(Date.now());

  const fetchMetrics = useCallback(async () => {
    if (!auth) return;

    try {
      const response = await fetch('/api/metrics', {
        headers: { 'Authorization': auth }
      });

      if (response.status === 401) {
        setAuth(null);
        sessionStorage.removeItem('dashboard_auth');
        return;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: Metrics = await response.json();
      const now = Date.now();

      setMetrics(data);
      setError(null);

      const prev = prevMetrics.current;
      const dtSec = (now - prevTimestamp.current) / 1000;

      if (prev && dtSec > 0) {
        const reqDelta = data.totalRequests - prev.totalRequests;
        const rps = reqDelta / dtSec;
        const sentDelta = data.bytesSent - prev.bytesSent;
        const recvDelta = data.bytesReceived - prev.bytesReceived;
        const processingDelta = data.totalProcessingTimeMs - prev.totalProcessingTimeMs;
        const avgLatency = reqDelta > 0 ? processingDelta / reqDelta : 0;
        const errorDelta = (data.responses4xx + data.responses5xx) - (prev.responses4xx + prev.responses5xx);
        const errorRate = reqDelta > 0 ? (errorDelta / reqDelta) * 100 : 0;

        const avgReqSize = reqDelta > 0 ? recvDelta / reqDelta : 0;
        const avgResSize = reqDelta > 0 ? sentDelta / reqDelta : 0;
        const efficiency = processingDelta > 0 ? (reqDelta / (processingDelta / 1000)) : 0;

        const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        setHistory((h) => {
          const next = [...h, {
            time: timeLabel,
            rps: Math.max(0, parseFloat(rps.toFixed(2))),
            avgLatency: Math.max(0, parseFloat(avgLatency.toFixed(2))),
            activeConnections: data.activeConnections,
            bytesSentRate: Math.max(0, sentDelta / dtSec),
            bytesRecvRate: Math.max(0, recvDelta / dtSec),
            errorRate: Math.max(0, parseFloat(errorRate.toFixed(2))),
            avgReqSize: Math.max(0, parseFloat(avgReqSize.toFixed(0))),
            avgResSize: Math.max(0, parseFloat(avgResSize.toFixed(0))),
            efficiency: Math.max(0, parseFloat(efficiency.toFixed(1))),
          }];
          return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
        });
      }

      prevMetrics.current = data;
      prevTimestamp.current = now;
    } catch (err) {
      console.error(err);
      setError('Connection lost. Retrying...');
    }
  }, [auth]);

  const fetchLogs = useCallback(async () => {
    if (!auth || activeTab !== 'server') return;

    try {
      const response = await fetch('/api/logs', {
        headers: { 'Authorization': auth }
      });

      if (response.status === 401) {
        setAuth(null);
        sessionStorage.removeItem('dashboard_auth');
        return;
      }

      const data = await response.json();
      setLogs(data.logs);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  }, [auth, activeTab]);

  useEffect(() => {
    if (auth) {
      fetchMetrics();
      const id = setInterval(fetchMetrics, POLL_INTERVAL_MS);
      return () => clearInterval(id);
    }
  }, [fetchMetrics, auth]);

  useEffect(() => {
    if (auth && activeTab === 'server') {
      fetchLogs();
      const id = setInterval(fetchLogs, POLL_INTERVAL_MS);
      return () => clearInterval(id);
    }
  }, [fetchLogs, auth, activeTab]);

  // Handle Login
  const handleLogin = (base64Auth: string) => {
    setAuth(base64Auth);
    sessionStorage.setItem('dashboard_auth', base64Auth);
  };

  const handleLogout = () => {
    setAuth(null);
    sessionStorage.removeItem('dashboard_auth');
  };

  // ── Auth Screen ─────────────────────────────────────────────────────────────
  if (!auth) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const latest = history.length > 0 ? history[history.length - 1] : null;
  const prevPt = history.length > 1 ? history[history.length - 2] : null;

  const currentRps = latest?.rps ?? 0;
  const currentLatency = latest?.avgLatency ?? 0;
  const rpsDelta = latest && prevPt ? latest.rps - prevPt.rps : 0;
  const latencyDelta = latest && prevPt ? latest.avgLatency - prevPt.avgLatency : 0;

  const totalResponses = metrics
    ? metrics.responses2xx + metrics.responses3xx + metrics.responses4xx + metrics.responses5xx
    : 0;
  const successRate = totalResponses > 0 && metrics
    ? ((metrics.responses2xx / totalResponses) * 100).toFixed(1)
    : '100.0';

  const avgReqSizeCumulative = metrics && metrics.totalRequests > 0
    ? metrics.bytesReceived / metrics.totalRequests : 0;
  const avgResSizeCumulative = metrics && metrics.totalRequests > 0
    ? metrics.bytesSent / metrics.totalRequests : 0;
  const totalDataTransferred = metrics
    ? metrics.bytesReceived + metrics.bytesSent : 0;
  const processingEfficiency = metrics && metrics.totalProcessingTimeMs > 0
    ? (metrics.totalRequests / (metrics.totalProcessingTimeMs / 1000)).toFixed(1) : '0';

  const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
  const uptimeStr = uptimeSec < 60 ? `${uptimeSec}s`
    : uptimeSec < 3600 ? `${Math.floor(uptimeSec / 60)}m ${uptimeSec % 60}s`
      : `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m`;

  const statusData = metrics
    ? [
      { name: '2xx Success', value: metrics.responses2xx, color: '#27ae60' },
      { name: '3xx Redirect', value: metrics.responses3xx, color: '#2980b9' },
      { name: '4xx Client', value: metrics.responses4xx, color: '#f39c12' },
      { name: '5xx Server', value: metrics.responses5xx, color: '#e74c3c' },
    ].filter((d) => d.value > 0)
    : [];

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!metrics && !error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Activity color="#e67e22" size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', maxWidth: 1600, margin: '0 auto', padding: '22px 10px', position: 'relative' }}>

      {/* ── Floating Tab Selector ─────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '6px',
        borderRadius: '16px',
        display: 'flex',
        gap: '4px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'server', label: 'Server Logs', icon: LayoutGrid },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #344767, #4a6fa5)' : 'transparent',
                color: isActive ? '#fff' : '#7b809a',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 4px 12px rgba(52, 71, 103, 0.2)' : 'none'
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 12, color: '#7b809a', margin: '0 0 4px' }}>HTTPServer</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#344767', margin: 0 }}>Server Metrics</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, fontSize: 12, fontWeight: 500 }}
              >
                <AlertTriangle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#7b809a' }}>
            ⏱ {uptimeStr}
          </div>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#344767', cursor: 'pointer' }}
          >
            <Lock size={14} /> Logout
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#15803d' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            Live
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ paddingTop: 20 }}
          >

            {/* ── Summary Cards Row 1 ────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28, marginBottom: 32, paddingTop: 16 }}>
              <MetricCard
                title="Requests/sec"
                value={currentRps.toFixed(1)}
                subtitle={rpsDelta !== 0 ? `${rpsDelta > 0 ? '+' : ''}${rpsDelta.toFixed(1)} from last poll` : 'Stable'}
                icon={Zap}
                gradient="linear-gradient(135deg, #e67e22, #f39c12)"
                delay={0}
              />
              <MetricCard
                title="Active Connections"
                value={metrics?.activeConnections ?? 0}
                subtitle="Currently connected clients"
                icon={Users}
                gradient="linear-gradient(135deg, #27ae60, #2ecc71)"
                delay={0.05}
              />
              <MetricCard
                title="Avg Req. Processing Time"
                value={formatMs(currentLatency)}
                subtitle={latencyDelta !== 0 ? `${latencyDelta > 0 ? '+' : ''}${latencyDelta.toFixed(1)}ms from last poll` : 'Stable'}
                icon={Clock}
                gradient="linear-gradient(135deg, #e74c3c, #c0392b)"
                delay={0.1}
              />
              <MetricCard
                title="Total Requests"
                value={metrics?.totalRequests ?? 0}
                subtitle={`${successRate}% success rate`}
                icon={BarChart3}
                gradient="linear-gradient(135deg, #344767, #4a6fa5)"
                delay={0.15}
              />
            </div>

            {/* ── Summary Cards Row 2 ────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28, marginBottom: 32 }}>
              <MetricCard
                title="Avg Request Size"
                value={formatBytes(avgReqSizeCumulative)}
                subtitle="Average inbound payload"
                icon={Download}
                gradient="linear-gradient(135deg, #2980b9, #3498db)"
                delay={0.2}
              />
              <MetricCard
                title="Avg Response Size"
                value={formatBytes(avgResSizeCumulative)}
                subtitle="Average outbound payload"
                icon={Upload}
                gradient="linear-gradient(135deg, #8e44ad, #9b59b6)"
                delay={0.25}
              />
              <MetricCard
                title="Processing Efficiency"
                value={`${processingEfficiency} req/s`}
                subtitle="Requests per second of CPU time"
                icon={Cpu}
                gradient="linear-gradient(135deg, #16a085, #1abc9c)"
                delay={0.3}
              />
              <MetricCard
                title="Total Data Transferred"
                value={formatBytes(totalDataTransferred)}
                subtitle={`↑ ${formatBytes(metrics?.bytesSent ?? 0)}  ↓ ${formatBytes(metrics?.bytesReceived ?? 0)}`}
                icon={HardDrive}
                gradient="linear-gradient(135deg, #2c3e50, #34495e)"
                delay={0.35}
              />
            </div>

            {/* ── 4-Column Grid of Chart Cards ───────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }}>

              {/* RPS */}
              <SquareCard title="Requests per Second" subtitle="Live traffic throughput" delay={0.4}>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="gRps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e67e22" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#e67e22" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="time" stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip suffix=" req/s" />} />
                    <Area type="monotone" dataKey="rps" stroke="#e67e22" strokeWidth={2.5} fillOpacity={1} fill="url(#gRps)" dot={false} animationDuration={600} />
                  </AreaChart>
                </ResponsiveContainer>
              </SquareCard>

              {/* Processing Time */}
              <SquareCard title="Avg Request Processing Time" subtitle="Server-side processing duration" delay={0.45}>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="gProc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#e74c3c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="time" stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} unit="ms" />
                    <Tooltip content={<CustomTooltip suffix="ms" />} />
                    <Area type="monotone" dataKey="avgLatency" stroke="#e74c3c" strokeWidth={2.5} fillOpacity={1} fill="url(#gProc)" dot={false} animationDuration={600} />
                  </AreaChart>
                </ResponsiveContainer>
              </SquareCard>

              {/* Active Connections */}
              <SquareCard title="Active Connections" subtitle="Connected clients over time" delay={0.5}>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="gConn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#344767" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#344767" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="time" stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip suffix="" />} />
                    <Area type="stepAfter" dataKey="activeConnections" stroke="#344767" strokeWidth={2.5} fillOpacity={1} fill="url(#gConn)" dot={false} animationDuration={600} />
                  </AreaChart>
                </ResponsiveContainer>
              </SquareCard>

              {/* Network Bandwidth */}
              <SquareCard title="Network Bandwidth" subtitle="Bytes sent & received" delay={0.55}>
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#27ae60" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#27ae60" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gRecv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2980b9" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2980b9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="time" stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatBytes(v)} />
                    <Tooltip content={<BandwidthTooltip />} />
                    <Area type="monotone" dataKey="bytesSentRate" stroke="#27ae60" strokeWidth={2} fillOpacity={1} fill="url(#gSent)" dot={false} name="Sent/s" />
                    <Area type="monotone" dataKey="bytesRecvRate" stroke="#2980b9" strokeWidth={2} fillOpacity={1} fill="url(#gRecv)" dot={false} name="Recv/s" />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: '#7b809a' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ArrowUpRight size={12} color="#27ae60" /> Sent: <strong style={{ color: '#344767' }}>{formatBytes(metrics?.bytesSent ?? 0)}</strong></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ArrowDownRight size={12} color="#2980b9" /> Recv: <strong style={{ color: '#344767' }}>{formatBytes(metrics?.bytesReceived ?? 0)}</strong></span>
                </div>
              </SquareCard>

              {/* Error Rate */}
              <SquareCard title="Error Rate" subtitle="4xx + 5xx as % of requests" delay={0.6}>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="gErr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#e74c3c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="time" stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} unit="%" domain={[0, 'auto']} />
                    <Tooltip content={<CustomTooltip suffix="%" />} />
                    <Area type="monotone" dataKey="errorRate" stroke="#e74c3c" strokeWidth={2.5} fillOpacity={1} fill="url(#gErr)" dot={false} animationDuration={600} />
                  </AreaChart>
                </ResponsiveContainer>
              </SquareCard>

              {/* Average Payload Sizes */}
              <SquareCard title="Avg Payload Sizes" subtitle="Request vs response size per interval" delay={0.65}>
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="gReqSize" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2980b9" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2980b9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gResSize" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8e44ad" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#8e44ad" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="time" stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatBytes(v)} />
                    <Tooltip content={<PayloadTooltip />} />
                    <Area type="monotone" dataKey="avgReqSize" stroke="#2980b9" strokeWidth={2} fillOpacity={1} fill="url(#gReqSize)" dot={false} name="Avg Request" animationDuration={600} />
                    <Area type="monotone" dataKey="avgResSize" stroke="#8e44ad" strokeWidth={2} fillOpacity={1} fill="url(#gResSize)" dot={false} name="Avg Response" animationDuration={600} />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: '#7b809a' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Download size={12} color="#2980b9" /> Req: <strong style={{ color: '#344767' }}>{formatBytes(avgReqSizeCumulative)}</strong></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Upload size={12} color="#8e44ad" /> Res: <strong style={{ color: '#344767' }}>{formatBytes(avgResSizeCumulative)}</strong></span>
                </div>
              </SquareCard>

              {/* Processing Efficiency */}
              <SquareCard title="Processing Efficiency" subtitle="Current requests processed per second of CPU time" delay={0.7}>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="gEff" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a085" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16a085" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="time" stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip suffix=" req/s CPU" />} />
                    <Area type="monotone" dataKey="efficiency" stroke="#16a085" strokeWidth={2.5} fillOpacity={1} fill="url(#gEff)" dot={false} animationDuration={600} />
                  </AreaChart>
                </ResponsiveContainer>
              </SquareCard>

              {/* Response Status Donut */}
              <SquareCard title="Response Status" subtitle={`${totalResponses.toLocaleString()} total responses`} delay={0.75}>
                {statusData.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height={75}>
                        <PieChart>
                          <Pie data={statusData} cx="50%" cy="50%" innerRadius={25} outerRadius={37} paddingAngle={3} dataKey="value" animationDuration={800}>
                            {statusData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      <LegendItem label="2xx Success" count={metrics?.responses2xx ?? 0} color="#27ae60" icon={CheckCircle2} />
                      <LegendItem label="3xx Redirect" count={metrics?.responses3xx ?? 0} color="#2980b9" icon={TrendingUp} />
                      <LegendItem label="4xx Client" count={metrics?.responses4xx ?? 0} color="#f39c12" icon={AlertTriangle} />
                      <LegendItem label="5xx Server" count={metrics?.responses5xx ?? 0} color="#e74c3c" icon={XCircle} />
                    </div>
                    <div style={{ borderTop: '1px solid #e9ecef', marginTop: 12, paddingTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7b809a' }}>
                      <Shield size={14} color="#27ae60" />
                      Success rate: <strong style={{ color: '#344767' }}>{successRate}%</strong>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, fontSize: 14, color: '#7b809a' }}>
                    No responses yet
                  </div>
                )}
              </SquareCard>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="server"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ paddingTop: 20, textAlign: 'center' }}
          >
            <div style={{ padding: '0px 20px 10px' }}>
              <LogViewer
                logs={logs}
                autoScroll={autoScroll}
                onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
                onClear={() => setLogs([])}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer style={{ marginTop: 36, paddingBottom: 6, textAlign: 'center', fontSize: 12, color: '#7b809a' }}>
        HTTPServer Metrics Dashboard
      </footer>
    </div>
  );
}

// ─── Log Viewer Component ───────────────────────────────────────────────────

function LogViewer({ logs, autoScroll, onToggleAutoScroll, onClear }: {
  logs: string[];
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
  onClear: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLogColor = (line: string) => {
    if (line.includes('[ERROR]')) return '#ef4444';
    if (line.includes('[WARNING]')) return '#f59e0b';
    if (line.includes('[INFO]')) return '#3b82f6';
    if (line.includes('[DEBUG]')) return '#6b7280';
    return '#adb5bd';
  };

  return (
    <div style={{
      background: '#1e1e1e',
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(85vh - 110px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      overflow: 'hidden',
      border: '1px solid #333'
    }}>
      {/* Terminal Header */}
      <div style={{
        padding: '12px 20px',
        background: '#252526',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <span style={{ fontSize: 12, color: '#858585', fontWeight: 500, fontFamily: 'monospace' }}>server.log</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={onToggleAutoScroll}
            style={{
              background: 'transparent',
              border: 'none',
              color: autoScroll ? '#27c93f' : '#858585',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <ChevronDown size={14} style={{ transform: autoScroll ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
            Auto-scroll
          </button>
          <button
            onClick={onClear}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#858585',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* Log Content */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
          fontSize: 13,
          lineHeight: 1.6,
          backgroundColor: '#1a1a1a'
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: '#555', textAlign: 'center', marginTop: 100 }}>
            Waiting for logs...
          </div>
        ) : (
          logs.map((line, i) => {
            const color = getLogColor(line);
            return (
              <div key={i} style={{ display: 'flex', gap: 12, borderBottom: '1px solid #222', padding: '2px 0' }}>
                <span style={{ color: '#555', minWidth: 24, textAlign: 'right', userSelect: 'none' }}>{i + 1}</span>
                <span style={{ color }}>{line}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (auth: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const credentials = btoa(`${username}:${password}`);
    onLogin(`Basic ${credentials}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%', maxWidth: 400, padding: 40, background: '#fff', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #e9ecef' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #344767, #4a6fa5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#344767', margin: '0 0 8px' }}>Admin Login</h2>
          <p style={{ fontSize: 14, color: '#7b809a', margin: 0 }}>Enter credentials to access dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#344767', marginLeft: 4 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #d2d6da', fontSize: 14, outline: 'none' }}
              placeholder="Username"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#344767', marginLeft: 4 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #d2d6da', fontSize: 14, outline: 'none' }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            style={{ marginTop: 12, padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #344767, #4a6fa5)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <LogIn size={18} /> Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function SquareCard({ title, subtitle, delay = 0, children }: {
  title: string;
  subtitle: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
      }}
    >
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#344767', margin: '0 0 2px' }}>{title}</h3>
      <p style={{ fontSize: 11, color: '#7b809a', margin: '0 0 16px' }}>{subtitle}</p>
      {children}
    </motion.div>
  );
}

function LegendItem({ label, count, color, icon: Icon }: {
  label: string;
  count: number;
  color: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
        <Icon size={12} style={{ color }} />
        <span style={{ fontSize: 12, color: '#7b809a' }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#344767', fontVariantNumeric: 'tabular-nums' }}>{count.toLocaleString()}</span>
    </div>
  );
}

// ─── Tooltips ───────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, suffix }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}>
      <p style={{ color: '#7b809a', margin: '0 0 2px' }}>{label}</p>
      <p style={{ fontWeight: 700, color: '#344767', margin: 0 }}>
        {typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value}{suffix}
      </p>
    </div>
  );
}

function BandwidthTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}>
      <p style={{ color: '#7b809a', margin: '0 0 4px' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontWeight: 500, color: p.stroke, margin: 0 }}>
          {p.name}: {formatBytes(p.value)}/s
        </p>
      ))}
    </div>
  );
}

function PayloadTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}>
      <p style={{ color: '#7b809a', margin: '0 0 4px' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontWeight: 500, color: p.stroke, margin: 0 }}>
          {p.name}: {formatBytes(p.value)}
        </p>
      ))}
    </div>
  );
}

export default App;

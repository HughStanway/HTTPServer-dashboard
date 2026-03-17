import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import { LogViewer } from './components/LogViewer';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { TabSelector } from './components/TabSelector';
import { OverviewSummary } from './components/OverviewSummary';
import { OverviewCharts } from './components/OverviewCharts';
import { LoadingScreen } from './components/LoadingScreen';

// Hooks & Utils
import { useWindowSize } from './hooks/useWindowSize';
import type { Metrics, TimeseriesPoint } from './types';

const POLL_INTERVAL_MS = 2000;
const MAX_HISTORY = 30;

// ─── Main App ───────────────────────────────────────────────────────────────────
function Dashboard() {
  const [auth, setAuth] = useState<string | null>(() => sessionStorage.getItem('dashboard_auth'));
  const [activeTab, setActiveTab] = useState<'overview' | 'server'>('overview');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1200;
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
    return <LoadingScreen />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 1600,
      margin: '0 auto',
      padding: isMobile ? '16px 12px 100px' : '22px 20px',
      position: 'relative'
    }}>

      <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} />

      <Header isMobile={isMobile} error={error} uptimeStr={uptimeStr} onLogout={handleLogout} />

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
            <OverviewSummary
              metrics={metrics}
              currentRps={currentRps}
              rpsDelta={rpsDelta}
              currentLatency={currentLatency}
              latencyDelta={latencyDelta}
              successRate={successRate}
              avgReqSizeCumulative={avgReqSizeCumulative}
              avgResSizeCumulative={avgResSizeCumulative}
              processingEfficiency={processingEfficiency}
              totalDataTransferred={totalDataTransferred}
              isMobile={isMobile}
            />

            <OverviewCharts
              history={history}
              metrics={metrics}
              statusData={statusData}
              totalResponses={totalResponses}
              successRate={successRate}
              avgReqSizeCumulative={avgReqSizeCumulative}
              avgResSizeCumulative={avgResSizeCumulative}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </motion.div>
        ) : (
          <motion.div
            key="server"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ paddingTop: isMobile ? 0 : 20, textAlign: 'center' }}
          >
            <div style={{ padding: isMobile ? '0 0 10px' : '0px 20px 10px' }}>
              <LogViewer
                logs={logs}
                autoScroll={autoScroll}
                onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
                onClear={() => setLogs([])}
                isMobile={isMobile}
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

export default Dashboard;

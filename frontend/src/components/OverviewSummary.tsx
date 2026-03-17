import { Zap, Users, Clock, BarChart3, Download, Upload, Cpu, HardDrive } from 'lucide-react';
import { MetricCard } from './MetricCard';
import type { Metrics } from '../types';
import { formatBytes, formatMs } from '../utils/format';

interface OverviewSummaryProps {
  metrics: Metrics | null;
  currentRps: number;
  rpsDelta: number;
  currentLatency: number;
  latencyDelta: number;
  successRate: string;
  avgReqSizeCumulative: number;
  avgResSizeCumulative: number;
  processingEfficiency: string;
  totalDataTransferred: number;
  isMobile: boolean;
}

export function OverviewSummary({
  metrics,
  currentRps,
  rpsDelta,
  currentLatency,
  latencyDelta,
  successRate,
  avgReqSizeCumulative,
  avgResSizeCumulative,
  processingEfficiency,
  totalDataTransferred,
  isMobile
}: OverviewSummaryProps) {
  return (
    <>
      {/* ── Summary Cards Row 1 ────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: isMobile ? 20 : 28,
        marginBottom: 32,
        paddingTop: 16
      }}>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: isMobile ? 20 : 28,
        marginBottom: 32
      }}>
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
    </>
  );
}

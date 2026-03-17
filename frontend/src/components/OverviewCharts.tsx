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
import { ArrowUpRight, ArrowDownRight, Download, Upload, CheckCircle2, TrendingUp, AlertTriangle, XCircle, Shield } from 'lucide-react';
import { SquareCard } from './SquareCard';
import { LegendItem } from './LegendItem';
import { CustomTooltip, BandwidthTooltip, PayloadTooltip } from './Tooltips';
import type { TimeseriesPoint, Metrics } from '../types';
import { formatBytes } from '../utils/format';

interface OverviewChartsProps {
  history: TimeseriesPoint[];
  metrics: Metrics | null;
  statusData: any[];
  totalResponses: number;
  successRate: string;
  avgReqSizeCumulative: number;
  avgResSizeCumulative: number;
  isMobile: boolean;
  isTablet: boolean;
}

export function OverviewCharts({
  history,
  metrics,
  statusData,
  totalResponses,
  successRate,
  avgReqSizeCumulative,
  avgResSizeCumulative,
  isMobile,
  isTablet
}: OverviewChartsProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
      gap: isMobile ? 20 : 28
    }}>
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
              <linearGradient id="gRecv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2980b9" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2980b9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8e44ad" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8e44ad" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="time" stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="#d1d5db" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatBytes(v)} />
            <Tooltip content={<BandwidthTooltip />} />
            <Area type="monotone" dataKey="bytesRecvRate" stroke="#2980b9" strokeWidth={2} fillOpacity={1} fill="url(#gRecv)" dot={false} name="Recv/s" stackId="bandwidth" />
            <Area type="monotone" dataKey="bytesSentRate" stroke="#8e44ad" strokeWidth={2} fillOpacity={1} fill="url(#gSent)" dot={false} name="Sent/s" stackId="bandwidth" />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: '#7b809a' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ArrowDownRight size={12} color="#2980b9" /> Recv: <strong style={{ color: '#344767' }}>{formatBytes(metrics?.bytesReceived ?? 0)}</strong></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ArrowUpRight size={12} color="#8e44ad" /> Sent: <strong style={{ color: '#344767' }}>{formatBytes(metrics?.bytesSent ?? 0)}</strong></span>
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
  );
}

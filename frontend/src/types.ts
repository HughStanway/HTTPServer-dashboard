export interface Metrics {
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

export interface TimeseriesPoint {
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

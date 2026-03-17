import { formatBytes } from '../utils/format';

export function CustomTooltip({ active, payload, label, suffix }: any) {
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

export function BandwidthTooltip({ active, payload, label }: any) {
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

export function PayloadTooltip({ active, payload, label }: any) {
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

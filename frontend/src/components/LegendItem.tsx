import type { LucideIcon } from 'lucide-react';

interface LegendItemProps {
  label: string;
  count: number;
  color: string;
  icon: LucideIcon;
}

export function LegendItem({ label, count, color, icon: Icon }: LegendItemProps) {
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

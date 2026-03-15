import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  delay?: number;
}

export const MetricCard = ({ title, value, subtitle, icon: Icon, gradient, delay = 0 }: MetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '16px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Floating icon badge */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          left: 20,
          width: 56,
          height: 56,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: gradient,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
      >
        <Icon size={22} color="#fff" />
      </div>

      {/* Content aligned right */}
      <div style={{ textAlign: 'right', paddingTop: 4 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: '#7b809a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          {title}
        </p>
        <p style={{ fontSize: 24, fontWeight: 700, color: '#344767', margin: '4px 0 0', fontVariantNumeric: 'tabular-nums' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>

      {/* Divider + subtitle */}
      {subtitle && (
        <>
          <hr style={{ border: 'none', borderTop: '1px solid #e9ecef', margin: '12px 0 8px' }} />
          <p style={{ fontSize: 11, color: '#7b809a', margin: 0 }}>{subtitle}</p>
        </>
      )}
    </motion.div>
  );
};

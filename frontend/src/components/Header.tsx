import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Lock } from 'lucide-react';

interface HeaderProps {
  isMobile: boolean;
  error: string | null;
  uptimeStr: string;
  onLogout: () => void;
}

export function Header({ isMobile, error, uptimeStr, onLogout }: HeaderProps) {
  return (
    <header style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      marginBottom: isMobile ? 30 : 20,
      gap: isMobile ? 20 : 0
    }}>
      <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
        <p style={{ fontSize: 12, color: '#7b809a', margin: '0 0 4px' }}>HTTPServer</p>
        <h1 style={{ fontSize: isMobile ? 22 : 24, fontWeight: 700, color: '#344767', margin: 0 }}>Server Metrics</h1>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: 12
      }}>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500
              }}
            >
              <AlertTriangle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{
          display: 'flex',
          alignItems: 'center', gap: 8,
          padding: '6px 14px',
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 500,
          color: '#7b809a'
        }}>
          ⏱ {uptimeStr}
        </div>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: '#fff',
            border: '1px solid #e9ecef',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            color: '#344767',
            cursor: 'pointer'
          }}
        >
          <Lock size={14} /> Logout
        </button>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 500,
          color: '#15803d'
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          Live
        </div>
      </div>
    </header>
  );
}

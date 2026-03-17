import { useEffect, useRef } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { LogLine } from './LogLine';

interface LogViewerProps {
  logs: string[];
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
  onClear: () => void;
  isMobile: boolean;
}

export function LogViewer({ logs, autoScroll, onToggleAutoScroll, onClear, isMobile }: LogViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <div style={{
      background: '#1e1e1e',
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      height: isMobile ? 'calc(95vh - 200px)' : 'calc(85vh - 110px)',
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
          logs.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, borderBottom: '1px solid #222', padding: '2px 0' }}>
              <span style={{ color: '#555', minWidth: 24, textAlign: 'right', userSelect: 'none' }}>{i + 1}</span>
              <LogLine content={line} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

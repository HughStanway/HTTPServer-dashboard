import { Activity, LayoutGrid } from 'lucide-react';

interface TabSelectorProps {
  activeTab: 'overview' | 'server';
  setActiveTab: (tab: 'overview' | 'server') => void;
  isMobile: boolean;
}

export function TabSelector({ activeTab, setActiveTab, isMobile }: TabSelectorProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'server', label: 'Server Logs', icon: LayoutGrid },
  ] as const;

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? 24 : 'auto',
      top: isMobile ? 'auto' : 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      padding: '6px',
      borderRadius: '20px',
      display: 'flex',
      gap: '4px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      width: isMobile ? 'calc(100% - 40px)' : 'auto',
      maxWidth: isMobile ? '400px' : 'none',
      justifyContent: isMobile ? 'center' : 'flex-start'
    }}>
      {tabs.map((tab) => {
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
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isActive ? '0 4px 12px rgba(52, 71, 103, 0.2)' : 'none',
              flex: isMobile ? 1 : 'none',
              justifyContent: 'center'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

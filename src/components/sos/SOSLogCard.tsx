import React from 'react';

const logs = [
  {
    id: '1',
    icon: '🧪',
    message: 'Test alert triggered successfully',
    timestamp: '2026-03-03 · 09:14 AM · 37.77°N 122.41°W',
    bgColor: 'bg-red-dim',
  },
  {
    id: '2',
    icon: '✓',
    message: 'System check — all contacts reachable',
    timestamp: '2026-03-02 · 08:00 AM · System',
    bgColor: 'bg-green-dim',
  },
];

export const SOSLogCard: React.FC = () => {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 md:p-6">
      <div className="font-mono text-[10px] tracking-widest uppercase text-text-muted mb-4">
        // Recent SOS Events
      </div>

      <div className="flex flex-col">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 py-2.5 border-b border-border last:border-b-0">
            <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-sm flex-shrink-0 ${log.bgColor}`}>
              {log.icon}
            </div>
            <div className="flex-1">
              <div className="text-xs text-text-primary mb-0.5">{log.message}</div>
              <div className="font-mono text-[9px] text-text-muted">{log.timestamp}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <div className="font-mono text-[10px] text-text-muted text-center">
          No real SOS events triggered<br />
          Last check: 08:00 AM today
        </div>
      </div>
    </div>
  );
}; 

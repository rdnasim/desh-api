import React from 'react';
import { History, Trash2, ArrowUpRight } from 'lucide-react';
import type { RequestHistoryItem } from '../types';

interface HistoryDrawerProps {
  history: RequestHistoryItem[];
  onSelect: (item: RequestHistoryItem) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelect,
  onClear,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="card history-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={16} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Calls Telemetry ({history.length})</h3>
        </div>
        <button
          onClick={onClear}
          className="btn"
          style={{ padding: '4px 8px', fontSize: 12 }}
          title="Clear session history"
        >
          <Trash2 size={13} />
          <span>Clear</span>
        </button>
      </div>

      <div className="history-list">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="history-item"
            title="Click to view this response"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 5px',
                  borderRadius: 3,
                  background: item.success ? 'var(--emerald-subtle)' : 'var(--crimson-subtle)',
                  color: item.success ? 'var(--emerald)' : 'var(--crimson)',
                }}
              >
                {item.status}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.url}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.durationMs}ms</span>
              <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{item.timestamp}</span>
              <ArrowUpRight size={14} style={{ opacity: 0.5 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

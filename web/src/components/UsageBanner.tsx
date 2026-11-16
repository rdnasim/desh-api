import { Activity, Clock, Key, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { DeveloperQuota } from '../types';

interface UsageBannerProps {
  baseUrl: string;
  apiKey: string;
  setApiKey: (key: string) => void;
  lastRequestTime?: number;
}

export const UsageBanner: React.FC<UsageBannerProps> = ({
  baseUrl,
  apiKey,
  setApiKey,
  lastRequestTime,
}) => {
  const [quota, setQuota] = useState<DeveloperQuota | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (apiKey.trim()) {
        headers['X-API-Key'] = apiKey.trim();
      }

      const res = await fetch(`${baseUrl}/v1/developer/quota`, { headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setQuota(json.data);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to fetch quota');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, apiKey]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota, lastRequestTime]);

  const usedPercentage = quota
    ? Math.min(100, Math.round((quota.daily_used / (quota.daily_quota || 1)) * 100))
    : 0;

  const getProgressClass = () => {
    if (usedPercentage > 85) return 'progress-bar danger';
    if (usedPercentage > 60) return 'progress-bar warning';
    return 'progress-bar';
  };

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="usage-banner">
      <div className="usage-header">
        <div className="usage-title-row">
          <Activity size={20} color="var(--crimson)" />
          <h2 className="usage-title">Real-Time API Read Usage & Quota</h2>
          <span
            style={{
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 4,
              background: 'var(--bg-elevated)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
          >
            Tier: {quota?.tier_name || 'Anonymous (Public)'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="btn"
            style={{ padding: '6px 12px', fontSize: 13 }}
            title="Configure Custom API Key"
          >
            <Key size={14} />
            <span>{apiKey ? 'API Key Set' : 'Add API Key'}</span>
          </button>

          <button
            onClick={fetchQuota}
            disabled={loading}
            className="btn"
            style={{ padding: '6px 12px', fontSize: 13 }}
            title="Refresh Quota"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {showKeyInput && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <Key size={16} style={{ opacity: 0.7 }} />
          <input
            type="text"
            placeholder="Paste your X-API-Key (e.g. desh_live_...)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
            }}
          />
          {apiKey && (
            <button
              onClick={() => setApiKey('')}
              className="btn"
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {error ? (
        <div style={{ color: 'var(--crimson)', fontSize: 13, margin: '8px 0' }}>
          Could not load live quota ({error}). Local or live endpoint reachable at {baseUrl}.
        </div>
      ) : (
        <>
          <div className="usage-stats-grid">
            <div className="stat-card">
              <div className="stat-label">Daily Remaining</div>
              <div className="stat-value" style={{ color: 'var(--emerald)' }}>
                {quota ? quota.daily_remaining.toLocaleString() : '10,000'}
              </div>
              <div className="stat-subtext">
                of {quota ? quota.daily_quota.toLocaleString() : '10,000'} calls today
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Requests Used Today</div>
              <div className="stat-value">{quota ? quota.daily_used.toLocaleString() : '0'}</div>
              <div className="stat-subtext">{usedPercentage}% of daily allocation</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Rate Limit</div>
              <div className="stat-value">
                {quota?.rate_limit_per_minute ?? 120}
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>
                  {' '}
                  req/min
                </span>
              </div>
              <div className="stat-subtext">Automatic IP burst protection</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Quota Resets In</div>
              <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={18} style={{ color: 'var(--text-muted)' }} />
                <span>{quota?.reset_seconds ? formatSeconds(quota.reset_seconds) : '24h'}</span>
              </div>
              <div className="stat-subtext">Resets daily at midnight UTC</div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              <span>Daily Quota Consumption</span>
              <span>{usedPercentage}% used</span>
            </div>
            <div className="progress-container">
              <div
                className={getProgressClass()}
                style={{ width: `${Math.max(usedPercentage, 1)}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

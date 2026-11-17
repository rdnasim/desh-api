import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Activity } from 'lucide-react';

export interface ApiCallDetails {
  method: string;
  url: string;
  path: string;
  status: number;
  durationMs: number;
  headers?: Record<string, string>;
  data: any;
  title: string;
}

interface ApiInspectorModalProps {
  details: ApiCallDetails | null;
  onClose: () => void;
  onOpenInExplorer?: (path: string) => void;
}

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({
  details,
  onClose,
  onOpenInExplorer,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [tab, setTab] = useState<'data' | 'headers' | 'curl'>('data');

  if (!details) return null;

  const curlCommand = `curl "${details.url}"`;

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={18} color="var(--crimson)" />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Real API Call Inspector</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{details.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-icon" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-meta-bar">
          <span className="method-tag get">{details.method}</span>
          <span className="modal-url">{details.path}</span>
          <span className="status-badge success">{details.status} OK</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ⚡ {details.durationMs} ms
          </span>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === 'data' ? 'active' : ''}`}
            onClick={() => setTab('data')}
          >
            Response JSON
          </button>
          <button
            className={`modal-tab ${tab === 'headers' ? 'active' : ''}`}
            onClick={() => setTab('headers')}
          >
            Headers
          </button>
          <button
            className={`modal-tab ${tab === 'curl' ? 'active' : ''}`}
            onClick={() => setTab('curl')}
          >
            cURL
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {onOpenInExplorer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInExplorer(details.path);
                }}
                className="btn"
                style={{ padding: '4px 10px', fontSize: 12 }}
              >
                <ExternalLink size={13} />
                <span>Test in Explorer</span>
              </button>
            )}
            <button
              onClick={() => {
                const text =
                  tab === 'curl'
                    ? curlCommand
                    : tab === 'headers'
                    ? JSON.stringify(details.headers || {}, null, 2)
                    : JSON.stringify(details.data, null, 2);
                copyText(text);
              }}
              className="btn"
              style={{ padding: '4px 10px', fontSize: 12 }}
            >
              {copied ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="modal-body">
          {tab === 'data' && (
            <pre className="code-view">{JSON.stringify(details.data, null, 2)}</pre>
          )}
          {tab === 'headers' && (
            <pre className="code-view">
              {details.headers && Object.keys(details.headers).length > 0
                ? JSON.stringify(details.headers, null, 2)
                : '// No headers recorded'}
            </pre>
          )}
          {tab === 'curl' && (
            <pre className="code-view" style={{ color: 'var(--emerald)' }}>
              {curlCommand}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

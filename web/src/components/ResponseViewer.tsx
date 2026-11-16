import { Check, Copy, FileCode, Layers, Terminal } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface ResponseViewerProps {
  status: number | null;
  statusText: string | null;
  durationMs: number | null;
  sizeBytes: number | null;
  response: any;
  headers: Record<string, string>;
  curlCommand: string;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  status,
  statusText,
  durationMs,
  sizeBytes,
  response,
  headers,
  curlCommand,
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'headers' | 'curl'>('json');
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isSuccess = status !== null && status >= 200 && status < 300;
  const jsonString = response ? JSON.stringify(response, null, 2) : '';

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="response-container">
      <div className="response-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {status ? (
            <span className={`status-badge ${isSuccess ? 'success' : 'error'}`}>
              {status} {statusText || (isSuccess ? 'OK' : 'Error')}
            </span>
          ) : (
            <span
              className="status-badge"
              style={{ background: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              Ready to Send
            </span>
          )}

          {durationMs !== null && (
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ⚡ {durationMs} ms
            </span>
          )}

          {sizeBytes !== null && sizeBytes > 0 && (
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              📦 {formatBytes(sizeBytes)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setActiveTab('json')}
              style={{
                border: 'none',
                background: activeTab === 'json' ? 'var(--crimson)' : 'transparent',
                color: activeTab === 'json' ? '#fff' : 'var(--text-muted)',
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <FileCode size={13} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
              Response
            </button>

            <button
              onClick={() => setActiveTab('headers')}
              style={{
                border: 'none',
                background: activeTab === 'headers' ? 'var(--crimson)' : 'transparent',
                color: activeTab === 'headers' ? '#fff' : 'var(--text-muted)',
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Layers size={13} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
              Headers ({Object.keys(headers).length})
            </button>

            <button
              onClick={() => setActiveTab('curl')}
              style={{
                border: 'none',
                background: activeTab === 'curl' ? 'var(--crimson)' : 'transparent',
                color: activeTab === 'curl' ? '#fff' : 'var(--text-muted)',
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Terminal size={13} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
              cURL
            </button>
          </div>

          <button
            onClick={() => {
              const textToCopy =
                activeTab === 'curl'
                  ? curlCommand
                  : activeTab === 'headers'
                    ? JSON.stringify(headers, null, 2)
                    : jsonString;
              copyToClipboard(textToCopy);
            }}
            className="btn"
            style={{ padding: '4px 8px', fontSize: 12 }}
            title="Copy current content"
          >
            {copied ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {activeTab === 'json' && (
          <pre className="response-json">
            {jsonString || '// Press "Send Request" to call the live API endpoint and view data.'}
          </pre>
        )}

        {activeTab === 'headers' && (
          <pre className="response-json">
            {Object.keys(headers).length > 0
              ? JSON.stringify(headers, null, 2)
              : '// Response headers will appear here once a request is executed.'}
          </pre>
        )}

        {activeTab === 'curl' && (
          <pre className="response-json" style={{ color: 'var(--emerald)' }}>
            {curlCommand}
          </pre>
        )}
      </div>
    </div>
  );
};

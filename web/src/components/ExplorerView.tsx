import React from 'react';
import { Search, Send } from 'lucide-react';
import { ResponseViewer } from './ResponseViewer';
import { HistoryDrawer } from './HistoryDrawer';
import { API_MODULES } from '../data/endpoints';
import type { ApiEndpoint, RequestHistoryItem, HttpMethod } from '../types';

interface ExplorerViewProps {
  baseUrl: string;
  selectedModule: string;
  setSelectedModule: (mod: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredEndpoints: ApiEndpoint[];
  selectedEndpoint: ApiEndpoint;
  handleSelectEndpoint: (ep: ApiEndpoint) => void;
  requestPath: string;
  setRequestPath: (p: string) => void;
  requestMethod: HttpMethod;
  paramValues: Record<string, string>;
  handleParamChange: (name: string, val: string) => void;
  requestBody: string;
  setRequestBody: (b: string) => void;
  handleSend: () => void;
  isSending: boolean;
  response: any;
  responseHeaders: Record<string, string>;
  responseStatus: number | null;
  responseStatusText: string | null;
  durationMs: number | null;
  sizeBytes: number | null;
  curlCommand: string;
  history: RequestHistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<RequestHistoryItem[]>>;
  setRequestMethod: (m: HttpMethod) => void;
  setResponseStatus: (s: number | null) => void;
  setResponseStatusText: (t: string | null) => void;
  setDurationMs: (d: number | null) => void;
  setSizeBytes: (b: number | null) => void;
  setResponse: (r: any) => void;
  setResponseHeaders: (h: Record<string, string>) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  baseUrl,
  selectedModule,
  setSelectedModule,
  searchQuery,
  setSearchQuery,
  filteredEndpoints,
  selectedEndpoint,
  handleSelectEndpoint,
  requestPath,
  setRequestPath,
  requestMethod,
  paramValues,
  handleParamChange,
  requestBody,
  setRequestBody,
  handleSend,
  isSending,
  response,
  responseHeaders,
  responseStatus,
  responseStatusText,
  durationMs,
  sizeBytes,
  curlCommand,
  history,
  setHistory,
  setRequestMethod,
  setResponseStatus,
  setResponseStatusText,
  setDurationMs,
  setSizeBytes,
  setResponse,
  setResponseHeaders,
}) => {
  return (
    <div className="explorer-grid">
      {/* Left Sidebar: Endpoints Catalog & Search */}
      <aside className="sidebar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search endpoints, modules, Bangla..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter Pills */}
        <div className="module-pills">
          {API_MODULES.map((mod) => (
            <button
              key={mod}
              className={`module-pill ${selectedModule === mod ? 'active' : ''}`}
              onClick={() => setSelectedModule(mod)}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* Endpoint List */}
        <div className="endpoint-list">
          {filteredEndpoints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No endpoints matched your search.
            </div>
          ) : (
            filteredEndpoints.map((ep) => (
              <div
                key={ep.id}
                className={`endpoint-item ${selectedEndpoint.id === ep.id ? 'selected' : ''}`}
                onClick={() => handleSelectEndpoint(ep)}
              >
                <div className="endpoint-top">
                  <span className={`method-tag ${ep.method.toLowerCase()}`}>
                    {ep.method}
                  </span>
                  <span className="endpoint-path">{ep.path}</span>
                </div>
                <div className="endpoint-title">{ep.name}</div>
                {ep.nameBn && (
                  <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                    {ep.nameBn}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Right Main Console: Request Builder & Live Response */}
      <div className="console-panel">
        <div className="card">
          <div className="card-header">
            <div>
              <h1 className="card-title">{selectedEndpoint.name}</h1>
              {selectedEndpoint.nameBn && (
                <div style={{ fontSize: 14, color: 'var(--crimson)', fontWeight: 600 }}>
                  {selectedEndpoint.nameBn}
                </div>
              )}
              <p className="card-subtitle">{selectedEndpoint.description}</p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="btn btn-primary"
                style={{ minWidth: 140 }}
              >
                <Send size={15} />
                <span>{isSending ? 'Sending…' : 'Send Request'}</span>
              </button>
            </div>
          </div>

          {/* URL Bar */}
          <div className="url-bar-container">
            <span className="base-selector">{baseUrl}</span>
            <input
              type="text"
              className="url-input"
              value={requestPath}
              onChange={(e) => setRequestPath(e.target.value)}
              placeholder="/v1/..."
            />
          </div>

          {/* Dynamic Query & Path Parameters */}
          {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
            <div className="params-section">
              <div className="section-label">Parameters</div>
              {selectedEndpoint.params.map((p) => (
                <div key={p.name} className="param-row">
                  <div className="param-name">
                    <span>{p.name}</span>
                    {p.required && <span style={{ color: 'var(--crimson)' }}> *</span>}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                      {p.description}
                    </div>
                  </div>

                  {p.options ? (
                    <select
                      className="param-input"
                      value={paramValues[p.name] ?? p.default ?? ''}
                      onChange={(e) => handleParamChange(p.name, e.target.value)}
                    >
                      {p.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="param-input"
                      placeholder={p.default || `Enter ${p.name}`}
                      value={paramValues[p.name] ?? ''}
                      onChange={(e) => handleParamChange(p.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* POST Request Body Editor if needed */}
          {requestMethod === 'POST' && (
            <div className="params-section">
              <div className="section-label">JSON Request Body</div>
              <textarea
                rows={4}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-strong)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)',
                  resize: 'vertical',
                }}
              />
            </div>
          )}

          {/* Response Viewer */}
          <ResponseViewer
            status={responseStatus}
            statusText={responseStatusText}
            durationMs={durationMs}
            sizeBytes={sizeBytes}
            response={response}
            headers={responseHeaders}
            curlCommand={curlCommand}
          />
        </div>

        {/* Recent Request History Drawer */}
        <HistoryDrawer
          history={history}
          onSelect={(item) => {
            setRequestPath(item.url);
            setRequestMethod(item.method);
            setResponseStatus(item.status);
            setResponseStatusText(item.statusText);
            setDurationMs(item.durationMs);
            setSizeBytes(item.sizeBytes);
            setResponse(item.response);
            setResponseHeaders(item.headers);
          }}
          onClear={() => setHistory([])}
        />
      </div>
    </div>
  );
};

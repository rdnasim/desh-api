import { Search, Send } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Navbar } from './components/Navbar';
import { ResponseViewer } from './components/ResponseViewer';
import { UsageBanner } from './components/UsageBanner';
import { API_MODULES, ENDPOINTS } from './data/endpoints';
import type { ApiEndpoint, HttpMethod, RequestHistoryItem } from './types';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('desh-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('desh-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Base API URL & Auth
  const [baseUrl, setBaseUrl] = useState<string>('https://deshapi.riadul.com');
  const [apiKey, setApiKey] = useState<string>('');

  // Endpoint Navigation
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(ENDPOINTS[1]); // default: Geo divisions or districts

  // Request Console State
  const [requestMethod, setRequestMethod] = useState<HttpMethod>('GET');
  const [requestPath, setRequestPath] = useState<string>(ENDPOINTS[1].defaultPathWithParams);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [requestBody, setRequestBody] = useState<string>('');

  // Response State
  const [isSending, setIsSending] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [sizeBytes, setSizeBytes] = useState<number | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(Date.now());

  // History
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);

  // When selected endpoint changes, reset path and params
  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    setRequestMethod(ep.method);
    setRequestPath(ep.defaultPathWithParams);
    setRequestBody(ep.bodyExample || '');

    // initialize params
    const initialParams: Record<string, string> = {};
    if (ep.params) {
      ep.params.forEach((p) => {
        if (p.default) initialParams[p.name] = p.default;
      });
    }
    setParamValues(initialParams);
  };

  // Filtered endpoints
  const filteredEndpoints = useMemo(() => {
    return ENDPOINTS.filter((ep) => {
      const matchModule = selectedModule === 'All' || ep.module === selectedModule;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ep.name.toLowerCase().includes(q) ||
        ep.path.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q) ||
        (ep.nameBn && ep.nameBn.includes(q));
      return matchModule && matchSearch;
    });
  }, [selectedModule, searchQuery]);

  // Update URL when a parameter changes in the input fields
  const handleParamChange = (name: string, val: string) => {
    const updated = { ...paramValues, [name]: val };
    setParamValues(updated);

    // Reconstruct URL path
    let newPath = selectedEndpoint.path;
    const queryParts: string[] = [];

    // Replace path variables like :slug or :code
    Object.entries(updated).forEach(([k, v]) => {
      if (newPath.includes(`:${k}`)) {
        newPath = newPath.replace(`:${k}`, encodeURIComponent(v));
      } else if (v.trim()) {
        queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v.trim())}`);
      }
    });

    if (queryParts.length > 0) {
      newPath += `?${queryParts.join('&')}`;
    }

    setRequestPath(newPath);
  };

  // Send request
  const handleSend = useCallback(async () => {
    setIsSending(true);
    setResponseStatus(null);
    setResponseStatusText(null);
    setDurationMs(null);

    const fullUrl = `${baseUrl}${requestPath.startsWith('/') ? '' : '/'}${requestPath}`;
    const startTime = performance.now();

    const headers: Record<string, string> = {};
    if (apiKey.trim()) {
      headers['X-API-Key'] = apiKey.trim();
    }
    if (requestMethod === 'POST') {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(fullUrl, {
        method: requestMethod,
        headers,
        body: requestMethod === 'POST' ? requestBody : undefined,
      });

      const elapsed = Math.round(performance.now() - startTime);
      const text = await res.text();
      const bytes = new Blob([text]).size;

      // Collect response headers
      const collectedHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        collectedHeaders[key] = val;
      });

      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }

      setResponseStatus(res.status);
      setResponseStatusText(res.statusText || (res.ok ? 'OK' : 'Error'));
      setDurationMs(elapsed);
      setSizeBytes(bytes);
      setResponse(parsed);
      setResponseHeaders(collectedHeaders);
      setLastRequestTime(Date.now());

      // Add to session history
      const historyItem: RequestHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        method: requestMethod,
        url: requestPath,
        status: res.status,
        statusText: res.statusText,
        durationMs: elapsed,
        sizeBytes: bytes,
        success: res.ok,
        response: parsed,
        headers: collectedHeaders,
      };

      setHistory((prev) => [historyItem, ...prev.slice(0, 19)]);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setResponseStatus(0);
      setResponseStatusText('Network Error');
      setDurationMs(elapsed);
      setSizeBytes(0);
      setResponse({
        error: 'Network Error',
        message:
          err.message ||
          'Failed to reach API endpoint. Please check your internet connection or CORS.',
      });
      setResponseHeaders({});
    } finally {
      setIsSending(false);
    }
  }, [baseUrl, requestPath, requestMethod, apiKey, requestBody]);

  // Construct cURL string
  const curlCommand = useMemo(() => {
    const fullUrl = `${baseUrl}${requestPath.startsWith('/') ? '' : '/'}${requestPath}`;
    let cmd = `curl -X ${requestMethod} "${fullUrl}"`;
    if (apiKey.trim()) {
      cmd += ` \\\n  -H "X-API-Key: ${apiKey.trim()}"`;
    }
    if (requestMethod === 'POST') {
      cmd += ` \\\n  -H "Content-Type: application/json"`;
      if (requestBody) {
        cmd += ` \\\n  -d '${requestBody.replace(/'/g, "'\\''")}'`;
      }
    }
    return cmd;
  }, [baseUrl, requestPath, requestMethod, apiKey, requestBody]);

  // Execute initial request on mount
  useEffect(() => {
    handleSend();
  }, []);

  return (
    <div className="app-layout">
      <Navbar theme={theme} toggleTheme={toggleTheme} baseUrl={baseUrl} setBaseUrl={setBaseUrl} />

      <main className="main-content">
        {/* Real-time Usage & Quota Banner */}
        <UsageBanner
          baseUrl={baseUrl}
          apiKey={apiKey}
          setApiKey={setApiKey}
          lastRequestTime={lastRequestTime}
        />

        {/* Explorer Two-Column Workspace */}
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
                <div
                  style={{
                    textAlign: 'center',
                    padding: '24px 0',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                  }}
                >
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
                      <span className={`method-tag ${ep.method.toLowerCase()}`}>{ep.method}</span>
                      <span className="endpoint-path">{ep.path}</span>
                    </div>
                    <div className="endpoint-title">{ep.name}</div>
                    {ep.nameBn && (
                      <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{ep.nameBn}</div>
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
      </main>

      <footer className="footer">
        <p>
          <strong>Desh API Explorer</strong> · Open public API for Bangladesh reference data, Bangla
          language tools, and calculators.
        </p>
        <p style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
          Hosted at{' '}
          <a href="https://deshapi.riadul.com" target="_blank" rel="noreferrer">
            https://deshapi.riadul.com
          </a>{' '}
          · Code MIT · Data CC BY 4.0
        </p>
      </footer>
    </div>
  );
};

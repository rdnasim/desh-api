import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, Calendar, CheckCircle, Terminal } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { UsageBanner } from './components/UsageBanner';
import { ExplorerView } from './components/ExplorerView';
import { ApiInspectorModal, type ApiCallDetails } from './components/ApiInspectorModal';

import { PrayerWidget } from './components/portal/PrayerWidget';
import { MarketPricesWidget } from './components/portal/MarketPricesWidget';
import { GoldZakatWidget } from './components/portal/GoldZakatWidget';
import { MetroRailWidget } from './components/portal/MetroRailWidget';
import { BanglaToolkitWidget } from './components/portal/BanglaToolkitWidget';
import { FinanceCalculatorWidget } from './components/portal/FinanceCalculatorWidget';
import { EmergencyHealthWidget } from './components/portal/EmergencyHealthWidget';
import { GeoLookupWidget } from './components/portal/GeoLookupWidget';
import { WeatherAqiWidget } from './components/portal/WeatherAqiWidget';
import { TravelGeographyWidget } from './components/portal/TravelGeographyWidget';

import { ENDPOINTS } from './data/endpoints';
import type { ApiEndpoint, RequestHistoryItem, HttpMethod } from './types';

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

  // Active View: Consumer Website Portal vs Developer API Explorer
  const [currentView, setCurrentView] = useState<'portal' | 'explorer'>('portal');

  // Inspector Modal state
  const [inspectorDetails, setInspectorDetails] = useState<ApiCallDetails | null>(null);

  // Live Portal Tickers
  const [banglaDateStr, setBanglaDateStr] = useState<string>('');
  const [holidayStatus, setHolidayStatus] = useState<string>('');

  // Explorer State
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(ENDPOINTS[1] || ENDPOINTS[0]);
  const [requestMethod, setRequestMethod] = useState<HttpMethod>('GET');
  const [requestPath, setRequestPath] = useState<string>(ENDPOINTS[1]?.defaultPathWithParams || '/v1/divisions');
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

  // Fetch today's Bangla date and holiday check for the Hero ticker
  useEffect(() => {
    let isCurrent = true;
    const fetchTickers = async () => {
      try {
        // Fetch bangla date
        const dRes = await fetch(`${baseUrl}/v1/bangla/date`);
        const dJson = await dRes.json();
        if (isCurrent && dJson.success && dJson.data) {
          const d = dJson.data;
          setBanglaDateStr(d.formatted_bn || `${d.day_bn} ${d.month?.name_bn} ${d.year_bn} বঙ্গাব্দ (${d.season?.name_bn} ঋতু)`);
        }

        // Fetch upcoming public holiday or check date
        const hRes = await fetch(`${baseUrl}/v1/holidays?year=2027`);
        const hJson = await hRes.json();
        if (isCurrent && hJson.success && Array.isArray(hJson.data)) {
          const generalHolidays = hJson.data.filter((h: any) => h.type === 'general');
          const firstHoliday = generalHolidays[0];
          if (firstHoliday) {
            setHolidayStatus(`আসন্ন জাতীয় ছুটি: ${firstHoliday.name_bn} (${firstHoliday.dates?.[0]})`);
          } else {
            setHolidayStatus('সরকারি ছুটির ক্যালেন্ডার ২০২৭ সক্রিয়');
          }
        }
      } catch (err) {
        if (isCurrent) {
          setHolidayStatus('গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের উন্মুক্ত ডেটা পোর্টাল');
        }
      }
    };

    fetchTickers();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl]);

  // When selected endpoint changes in Explorer, reset path and params
  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    setRequestMethod(ep.method);
    setRequestPath(ep.defaultPathWithParams);
    setRequestBody(ep.bodyExample || '');

    const initialParams: Record<string, string> = {};
    if (ep.params) {
      ep.params.forEach((p) => {
        if (p.default) initialParams[p.name] = p.default;
      });
    }
    setParamValues(initialParams);
  };

  // Filtered endpoints for explorer
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

  // Update URL when a parameter changes
  const handleParamChange = (name: string, val: string) => {
    const updated = { ...paramValues, [name]: val };
    setParamValues(updated);

    let newPath = selectedEndpoint.path;
    const queryParts: string[] = [];

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

  // Send request in Explorer
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
        message: err.message || 'Failed to reach API endpoint.',
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

  return (
    <div className="app-layout">
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        baseUrl={baseUrl}
        setBaseUrl={setBaseUrl}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="main-content">
        {/* Real-time Usage & Quota Bar */}
        <UsageBanner
          baseUrl={baseUrl}
          apiKey={apiKey}
          setApiKey={setApiKey}
          lastRequestTime={lastRequestTime}
        />

        {currentView === 'portal' ? (
          <>
            {/* Real Website Hero Section */}
            <div className="portal-hero">
              <div className="hero-title-row">
                <div>
                  <h1 className="hero-heading">আমার দেশ · Bangladesh Digital Services Portal</h1>
                  <p className="hero-subheading">লাইভ ডেটা ও নাগরিক সেবা সম্বলিত মুক্ত পোর্টাল</p>
                  <p className="hero-desc">
                    বাংলাদেশের প্রশাসনিক তথ্য, ওয়াক্ত ও সাহরি-ইফতারের সময়সূচি, নিত্যপ্রয়োজনীয় বাজারদর, স্বর্ণের দর ও যাকাত, মেট্রোরেল, সিভিল এভিয়েশন বিমানবন্দর, ইউনেস্কো হেরিটেজ ও পর্যটন, নদ-নদী, স্থলবন্দর, বাংলা ভাষার টুলস এবং জরুরি সেবার সমন্বিত ওয়েব প্ল্যাটফর্ম — সম্পূর্ণ ওপেন <strong>Desh API</strong> দ্বারা পরিচালিত।
                  </p>
                </div>

                <button
                  onClick={() => setCurrentView('explorer')}
                  className="btn btn-primary"
                  style={{ gap: 8, padding: '10px 18px', fontSize: 14 }}
                >
                  <Terminal size={16} />
                  <span>Developer API Explorer</span>
                </button>
              </div>

              {/* Real-time ticker badges */}
              <div className="hero-pills-row">
                {banglaDateStr && (
                  <div className="hero-pill" style={{ borderColor: 'var(--crimson)' }}>
                    <Calendar size={14} style={{ color: 'var(--crimson)' }} />
                    <span>{banglaDateStr}</span>
                  </div>
                )}
                {holidayStatus && (
                  <div className="hero-pill">
                    <CheckCircle size={14} style={{ color: 'var(--emerald)' }} />
                    <span>{holidayStatus}</span>
                  </div>
                )}
                <div className="hero-pill" style={{ background: 'var(--bg-elevated)' }}>
                  <Sparkles size={14} style={{ color: 'var(--amber)' }} />
                  <span>Public Rate Limit: 120 req/min · 10,000 req/day</span>
                </div>
              </div>
            </div>

            {/* Portal Consumer Widgets Grid */}
            <div className="portal-grid">
              {/* 1. Prayer Times & Ramadan */}
              <PrayerWidget baseUrl={baseUrl} onInspectApi={setInspectorDetails} />

              {/* 2. Market Prices & Fuel */}
              <MarketPricesWidget baseUrl={baseUrl} onInspectApi={setInspectorDetails} />

              {/* 3. Gold & Zakat Calculator */}
              <GoldZakatWidget baseUrl={baseUrl} onInspectApi={setInspectorDetails} />

              {/* 4. Dhaka Metro Rail Transit Guide */}
              <MetroRailWidget baseUrl={baseUrl} onInspectApi={setInspectorDetails} />

              {/* 5. Bangla Language Toolkit */}
              <BanglaToolkitWidget baseUrl={baseUrl} onInspectApi={setInspectorDetails} />

              {/* 6. Finance & Tax Calculator */}
              <FinanceCalculatorWidget baseUrl={baseUrl} onInspectApi={setInspectorDetails} />

              {/* 7. Emergency & Health Hotline Directory */}
              <EmergencyHealthWidget baseUrl={baseUrl} onInspectApi={setInspectorDetails} />

              {/* 8. Geographic & Institutional Registry */}
              <GeoLookupWidget baseUrl={baseUrl} onInspectApi={setInspectorDetails} />

              {/* 9. Weather & AQI Advisory */}
              <div style={{ gridColumn: '1 / -1' }}>
                <WeatherAqiWidget baseUrl={baseUrl} onInspectApi={setInspectorDetails} />
              </div>

              {/* 10. Travel, Waterways & Ports */}
              <div style={{ gridColumn: '1 / -1' }}>
                <TravelGeographyWidget baseUrl={baseUrl} onInspectApi={setInspectorDetails} />
              </div>
            </div>
          </>
        ) : (
          /* Developer API Explorer View */
          <ExplorerView
            baseUrl={baseUrl}
            selectedModule={selectedModule}
            setSelectedModule={setSelectedModule}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredEndpoints={filteredEndpoints}
            selectedEndpoint={selectedEndpoint}
            handleSelectEndpoint={handleSelectEndpoint}
            requestPath={requestPath}
            setRequestPath={setRequestPath}
            requestMethod={requestMethod}
            paramValues={paramValues}
            handleParamChange={handleParamChange}
            requestBody={requestBody}
            setRequestBody={setRequestBody}
            handleSend={handleSend}
            isSending={isSending}
            response={response}
            responseHeaders={responseHeaders}
            responseStatus={responseStatus}
            responseStatusText={responseStatusText}
            durationMs={durationMs}
            sizeBytes={sizeBytes}
            curlCommand={curlCommand}
            history={history}
            setHistory={setHistory}
            setRequestMethod={setRequestMethod}
            setResponseStatus={setResponseStatus}
            setResponseStatusText={setResponseStatusText}
            setDurationMs={setDurationMs}
            setSizeBytes={setSizeBytes}
            setResponse={setResponse}
            setResponseHeaders={setResponseHeaders}
          />
        )}
      </main>

      {/* Real API Call Inspector Modal */}
      <ApiInspectorModal
        details={inspectorDetails}
        onClose={() => setInspectorDetails(null)}
        onOpenInExplorer={(path) => {
          setRequestPath(path);
          setCurrentView('explorer');
          handleSend();
        }}
      />

      <footer className="footer">
        <p>
          <strong>Desh Portal</strong> · Real-world Bangladesh Public Services Portal powered by <a href="https://deshapi.riadul.com" target="_blank" rel="noreferrer">Desh API</a>.
        </p>
        <p style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
          Bilingual Bengali & English reference data · Open Source MIT · Open Data CC BY 4.0
        </p>
      </footer>
    </div>
  );
};

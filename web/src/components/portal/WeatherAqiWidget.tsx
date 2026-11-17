import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { ApiCallDetails } from '../ApiInspectorModal';

interface WeatherAqiWidgetProps {
  baseUrl: string;
  onInspectApi: (details: ApiCallDetails) => void;
}

export const WeatherAqiWidget: React.FC<WeatherAqiWidgetProps> = ({
  baseUrl,
  onInspectApi,
}) => {
  const [aqiValue, setAqiValue] = useState<number>(165);
  const [aqiData, setAqiData] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [activeSeason, setActiveSeason] = useState<number>(0);
  const [apiCall, setApiCall] = useState<ApiCallDetails | null>(null);

  // AQI lookup
  useEffect(() => {
    let isCurrent = true;
    const fetchAqi = async () => {
      const url = `${baseUrl}/v1/weather/aqi/lookup?value=${aqiValue}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setAqiData(json.data);
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/weather/aqi/lookup?value=${aqiValue}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: `Air Quality Index Lookup (${aqiValue})`,
          });
        }
      } catch (err) {
        console.error('Failed to lookup AQI', err);
      }
    };

    const timer = setTimeout(fetchAqi, 200);
    return () => {
      clearTimeout(timer);
      isCurrent = false;
    };
  }, [baseUrl, aqiValue]);

  // Seasons
  useEffect(() => {
    let isCurrent = true;
    const fetchSeasons = async () => {
      const url = `${baseUrl}/v1/weather/seasons`;
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (isCurrent && json.success) {
          setSeasons(json.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch seasons', err);
      }
    };
    fetchSeasons();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl]);

  const categoryColor = aqiData?.category?.color_hex || '#ef4444';

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="portal-icon-badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <CloudSun size={18} />
          </div>
          <div>
            <h3 className="portal-card-title">Air Quality Index (AQI) & Weather Advisory</h3>
            <p className="portal-card-sub">বায়ুমান সূচক, স্বাস্থ্য পরামর্শ ও আবহাওয়া অধিদপ্তর সতর্কতা</p>
          </div>
        </div>

        {apiCall && (
          <button
            onClick={() => onInspectApi(apiCall)}
            className="api-call-badge"
            title="Inspect underlying API call and response"
          >
            <Sparkles size={11} />
            <span>API ({apiCall.durationMs}ms)</span>
          </button>
        )}
      </div>

      {/* AQI Interactive Gauge */}
      <div className="aqi-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Wind size={16} style={{ color: categoryColor }} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Dhaka Realtime Air Quality Index:</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Score: {aqiValue}</span>
        </div>

        <input
          type="range"
          min="0"
          max="350"
          value={aqiValue}
          onChange={(e) => setAqiValue(parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: categoryColor, cursor: 'pointer' }}
        />

        {aqiData && (
          <div className="aqi-card" style={{ borderLeft: `4px solid ${categoryColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="aqi-status" style={{ color: categoryColor, fontWeight: 700, fontSize: 16 }}>
                    {aqiData.category?.name_bn} ({aqiData.category?.name_en})
                  </span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'var(--bg-card-subtle)', color: 'var(--text-muted)' }}>
                    রেঞ্জ: {aqiData.category?.min_aqi} - {aqiData.category?.max_aqi}
                  </span>
                </div>
                <p className="aqi-desc" style={{ marginBottom: 4, fontWeight: 500 }}>
                  {aqiData.category?.health_implication_bn || aqiData.category?.health_implication_en}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--crimson)', fontWeight: 600 }}>
                  <AlertTriangle size={13} />
                  <span>পরামর্শ: {aqiData.recommendation_bn || aqiData.recommendation_en}</span>
                </div>
              </div>
              <div className="aqi-score-badge" style={{ background: categoryColor, color: '#fff', padding: '6px 14px', borderRadius: 8, fontWeight: 800, fontSize: 18, minWidth: 50, textAlign: 'center' }}>
                {aqiValue}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6 Seasons Strip */}
      {seasons.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              বাংলার ষড়ঋতু চক্র (Traditional Six Seasons):
            </span>
            <span style={{ fontSize: 12, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={13} />
              বাংলা একাডেমি বর্ষপঞ্জি
            </span>
          </div>

          <div className="seasons-strip">
            {seasons.map((s: any, idx: number) => (
              <div
                key={s.slug}
                onClick={() => setActiveSeason(idx)}
                className={`season-item ${activeSeason === idx ? 'active' : ''}`}
                style={{
                  cursor: 'pointer',
                  borderColor: activeSeason === idx ? 'var(--emerald)' : 'var(--border)',
                  background: activeSeason === idx ? 'var(--bg-card-subtle)' : 'transparent',
                }}
              >
                <span className="season-name-bn" style={{ fontWeight: 700 }}>{s.name_bn}</span>
                <span className="season-name-en">{s.name_en}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {s.bangla_months?.join('-')}
                </span>
              </div>
            ))}
          </div>

          {seasons[activeSeason] && (
            <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: 'var(--bg-card-subtle)', fontSize: 13, border: '1px solid var(--border)' }}>
              <strong>{seasons[activeSeason].name_bn} ঋতু ({seasons[activeSeason].name_en}):</strong> {seasons[activeSeason].description_bn} · <em>{seasons[activeSeason].approx_gregorian_span}</em>
            </div>
          )}
        </div>
      )}

      <div className="portal-footer-note">
        <span>সূত্র: পরিবেশ অধিদপ্তর (DoE) এয়ার কোয়ালিটি ইনডেক্স ও বাংলাদেশ আবহাওয়া অধিদপ্তর (BMD)</span>
      </div>
    </div>
  );
};

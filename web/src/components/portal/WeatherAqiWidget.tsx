import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, Sparkles } from 'lucide-react';
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

  const getAqiColor = (score: number) => {
    if (score <= 50) return '#10b981'; // Good
    if (score <= 100) return '#f59e0b'; // Moderate
    if (score <= 150) return '#f97316'; // Unhealthy for sensitive
    if (score <= 200) return '#ef4444'; // Unhealthy
    if (score <= 300) return '#8b5cf6'; // Very unhealthy
    return '#7f1d1d'; // Hazardous
  };

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
            <Wind size={16} style={{ color: getAqiColor(aqiValue) }} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Dhaka Air Quality Level:</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Score: {aqiValue}</span>
        </div>

        <input
          type="range"
          min="0"
          max="350"
          value={aqiValue}
          onChange={(e) => setAqiValue(parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: getAqiColor(aqiValue), cursor: 'pointer' }}
        />

        {aqiData && (
          <div className="aqi-card" style={{ borderLeftColor: getAqiColor(aqiValue) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="aqi-status" style={{ color: getAqiColor(aqiValue) }}>
                  {aqiData.category?.name_bn || aqiData.category?.name_en} ({aqiData.category?.name_en})
                </span>
                <p className="aqi-desc">{aqiData.category?.health_advisory_bn || aqiData.recommendation_en}</p>
              </div>
              <div className="aqi-score-badge" style={{ background: getAqiColor(aqiValue) }}>
                {aqiValue}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6 Seasons Strip */}
      {seasons.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            বাংলার ষড়ঋতু চক্র (Traditional Six Seasons):
          </span>
          <div className="seasons-strip">
            {seasons.map((s: any) => (
              <div key={s.slug} className="season-item">
                <span className="season-name-bn">{s.name_bn}</span>
                <span className="season-name-en">{s.name_en}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="portal-footer-note">
        <span>সূত্র: পরিবেশ অধিদপ্তর (DoE) এয়ার কোয়ালিটি ইনডেক্স ও বাংলাদেশ আবহাওয়া অধিদপ্তর (BMD)</span>
      </div>
    </div>
  );
};

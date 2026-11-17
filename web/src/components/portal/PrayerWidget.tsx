import React, { useState, useEffect } from 'react';
import { Moon, Sparkles, MapPin } from 'lucide-react';
import type { ApiCallDetails } from '../ApiInspectorModal';

interface PrayerWidgetProps {
  baseUrl: string;
  onInspectApi: (details: ApiCallDetails) => void;
}

const DISTRICT_OPTIONS = [
  { slug: 'dhaka', name: 'Dhaka (ঢাকা)' },
  { slug: 'chattogram', name: 'Chattogram (চট্টগ্রাম)' },
  { slug: 'sylhet', name: 'Sylhet (সিলেট)' },
  { slug: 'rajshahi', name: 'Rajshahi (রাজশাহী)' },
  { slug: 'khulna', name: 'Khulna (খুলনা)' },
  { slug: 'barishal', name: 'Barishal (বরিশাল)' },
  { slug: 'rangpur', name: 'Rangpur (রংপুর)' },
  { slug: 'mymensingh', name: 'Mymensingh (ময়মনসিংহ)' },
  { slug: 'cumilla', name: 'Cumilla (কুমিল্লা)' },
  { slug: 'bogura', name: 'Bogura (বগুড়া)' },
];

export const PrayerWidget: React.FC<PrayerWidgetProps> = ({ baseUrl, onInspectApi }) => {
  const [district, setDistrict] = useState<string>('dhaka');
  const [prayerData, setPrayerData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiCall, setApiCall] = useState<ApiCallDetails | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const fetchTimes = async () => {
      setLoading(true);
      const url = `${baseUrl}/v1/prayer/times?district=${district}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);

        if (isCurrent && json.success) {
          setPrayerData(json.data);
          const details: ApiCallDetails = {
            method: 'GET',
            url,
            path: `/v1/prayer/times?district=${district}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: `Prayer Times (${district.toUpperCase()})`,
          };
          setApiCall(details);
        }
      } catch (err) {
        console.error('Failed to fetch prayer times', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchTimes();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl, district]);

  const times = prayerData?.times;
  const times12 = prayerData?.times_12h;

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="portal-icon-badge" style={{ background: 'var(--emerald-subtle)', color: 'var(--emerald)' }}>
            <Moon size={18} />
          </div>
          <div>
            <h3 className="portal-card-title">Daily Prayer & Ramadan Timings</h3>
            <p className="portal-card-sub">ইসলামিক ফাউন্ডেশন বাংলাদেশের ওয়াক্ত ও সাহরি-ইফতারের সময়সূচি</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
            <MapPin size={13} style={{ color: 'var(--crimson)' }} />
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="portal-select-inline"
              aria-label="Select District"
            >
              {DISTRICT_OPTIONS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
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
      </div>

      {loading ? (
        <div className="portal-loading">Loading prayer times…</div>
      ) : times ? (
        <>
          <div className="prayer-grid">
            <div className="prayer-cell highlight">
              <span className="prayer-name">Sehri Cutoff (সাহরি শেষ)</span>
              <span className="prayer-time">{times.sehri_cutoff}</span>
              <span className="prayer-sub">{times12?.sehri_cutoff}</span>
            </div>
            <div className="prayer-cell">
              <span className="prayer-name">Fajr (ফজর)</span>
              <span className="prayer-time">{times.fajr}</span>
              <span className="prayer-sub">{times12?.fajr}</span>
            </div>
            <div className="prayer-cell">
              <span className="prayer-name">Sunrise (সূর্যোদয়)</span>
              <span className="prayer-time">{times.sunrise}</span>
              <span className="prayer-sub">{times12?.sunrise}</span>
            </div>
            <div className="prayer-cell">
              <span className="prayer-name">Dhuhr (যোহর)</span>
              <span className="prayer-time">{times.dhuhr}</span>
              <span className="prayer-sub">{times12?.dhuhr}</span>
            </div>
            <div className="prayer-cell">
              <span className="prayer-name">Asr (আসর)</span>
              <span className="prayer-time">{times.asr}</span>
              <span className="prayer-sub">{times12?.asr}</span>
            </div>
            <div className="prayer-cell highlight-maghrib">
              <span className="prayer-name">Maghrib / Iftar (ইফতার)</span>
              <span className="prayer-time">{times.maghrib}</span>
              <span className="prayer-sub">{times12?.maghrib}</span>
            </div>
            <div className="prayer-cell">
              <span className="prayer-name">Isha (এশা)</span>
              <span className="prayer-time">{times.isha}</span>
              <span className="prayer-sub">{times12?.isha}</span>
            </div>
          </div>

          <div className="portal-footer-note">
            <span>আজকের তারিখ: {prayerData.date_bangla} ({prayerData.date})</span>
            <span style={{ marginLeft: 'auto' }}>হানাফি পদ্ধতি · ইসলামিক ফাউন্ডেশন বাংলাদেশ</span>
          </div>
        </>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 12 }}>Unable to load prayer times.</div>
      )}
    </div>
  );
};

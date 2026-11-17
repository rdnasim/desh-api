import React, { useState, useEffect } from 'react';
import { Moon, Sparkles, MapPin, Compass } from 'lucide-react';
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
  { slug: 'coxs-bazar', name: "Cox's Bazar (কক্সবাজার)" },
];

export const PrayerWidget: React.FC<PrayerWidgetProps> = ({ baseUrl, onInspectApi }) => {
  const [district, setDistrict] = useState<string>('dhaka');
  const [prayerData, setPrayerData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h' | 'bn'>('12h');
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

  const getTime = (key: string) => {
    if (!prayerData) return '--:--';
    if (timeFormat === 'bn') return prayerData.times_bn?.[key] ?? prayerData.times?.[key];
    if (timeFormat === '12h') return prayerData.times_12h?.[key] ?? prayerData.times?.[key];
    return prayerData.times?.[key] ?? '--:--';
  };

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="portal-icon-badge" style={{ background: 'var(--emerald-subtle)', color: 'var(--emerald)' }}>
            <Moon size={20} />
          </div>
          <div>
            <h3 className="portal-card-title">Daily Prayer & Ramadan Timings</h3>
            <p className="portal-card-sub">ইসলামিক ফাউন্ডেশন বাংলাদেশের ওয়াক্ত ও সাহরি-ইফতারের সময়সূচি</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-elevated)', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <MapPin size={14} style={{ color: 'var(--crimson)' }} />
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

          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <button
              onClick={() => setTimeFormat('12h')}
              style={{
                border: 'none',
                background: timeFormat === '12h' ? 'var(--emerald)' : 'transparent',
                color: timeFormat === '12h' ? '#fff' : 'var(--text-muted)',
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              12H
            </button>
            <button
              onClick={() => setTimeFormat('24h')}
              style={{
                border: 'none',
                background: timeFormat === '24h' ? 'var(--emerald)' : 'transparent',
                color: timeFormat === '24h' ? '#fff' : 'var(--text-muted)',
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              24H
            </button>
            <button
              onClick={() => setTimeFormat('bn')}
              style={{
                border: 'none',
                background: timeFormat === 'bn' ? 'var(--emerald)' : 'transparent',
                color: timeFormat === 'bn' ? '#fff' : 'var(--text-muted)',
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              বাংলা
            </button>
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
      ) : prayerData ? (
        <>
          <div className="prayer-grid">
            <div className="prayer-cell highlight">
              <span className="prayer-name">Sehri Cutoff (সাহরি শেষ)</span>
              <span className="prayer-time">{getTime('sehri_cutoff')}</span>
              <span className="prayer-sub">তাহাজ্জুদ শেষ</span>
            </div>
            <div className="prayer-cell">
              <span className="prayer-name">Fajr (ফজর)</span>
              <span className="prayer-time">{getTime('fajr')}</span>
              <span className="prayer-sub">শুরু</span>
            </div>
            <div className="prayer-cell">
              <span className="prayer-name">Sunrise (সূর্যোদয়)</span>
              <span className="prayer-time">{getTime('sunrise')}</span>
              <span className="prayer-sub">ইশরাক শুরু</span>
            </div>
            <div className="prayer-cell">
              <span className="prayer-name">Dhuhr (যোহর)</span>
              <span className="prayer-time">{getTime('dhuhr')}</span>
              <span className="prayer-sub">মধ্যাহ্ন</span>
            </div>
            <div className="prayer-cell">
              <span className="prayer-name">Asr (আসর)</span>
              <span className="prayer-time">{getTime('asr')}</span>
              <span className="prayer-sub">হানাফি মাযহাব</span>
            </div>
            <div className="prayer-cell highlight-maghrib">
              <span className="prayer-name">Maghrib / Iftar (ইফতার)</span>
              <span className="prayer-time">{getTime('maghrib')}</span>
              <span className="prayer-sub">সূর্যাস্ত ও ইফতার</span>
            </div>
            <div className="prayer-cell">
              <span className="prayer-name">Isha (এশা)</span>
              <span className="prayer-time">{getTime('isha')}</span>
              <span className="prayer-sub">তারাবিহ শুরু</span>
            </div>
          </div>

          <div className="portal-footer-note">
            <span>
              <Compass size={13} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--emerald)' }} />
              {prayerData.bangla_date || 'বাংলা পঞ্জিকা'} · হিজরি: {prayerData.hijri_date_bn || prayerData.hijri_date}
            </span>
            <span>ইসলামিক ফাউন্ডেশন বাংলাদেশ মানদণ্ড</span>
          </div>
        </>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 12 }}>Unable to load prayer times.</div>
      )}
    </div>
  );
};

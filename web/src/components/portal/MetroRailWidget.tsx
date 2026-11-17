import React, { useState, useEffect } from 'react';
import { Train, ArrowRight, Sparkles, Clock, Ticket } from 'lucide-react';
import type { ApiCallDetails } from '../ApiInspectorModal';

interface MetroRailWidgetProps {
  baseUrl: string;
  onInspectApi: (details: ApiCallDetails) => void;
}

const METRO_STATIONS = [
  { slug: 'uttara-north', name: 'Uttara North (উত্তরা উত্তর)' },
  { slug: 'uttara-center', name: 'Uttara Center (উত্তরা সেন্টার)' },
  { slug: 'uttara-south', name: 'Uttara South (উত্তরা দক্ষিণ)' },
  { slug: 'pallabi', name: 'Pallabi (পল্লবী)' },
  { slug: 'mirpur-11', name: 'Mirpur 11 (মিরপুর ১১)' },
  { slug: 'mirpur-10', name: 'Mirpur 10 (মিরপুর ১০)' },
  { slug: 'kazipara', name: 'Kazipara (কাজীপাড়া)' },
  { slug: 'shewrapara', name: 'Shewrapara (শেওড়াপাড়া)' },
  { slug: 'agargaon', name: 'Agargaon (আগারগাঁও)' },
  { slug: 'bijoy-sarani', name: 'Bijoy Sarani (বিজয় সরণি)' },
  { slug: 'farmgate', name: 'Farmgate (ফার্মগেট)' },
  { slug: 'karwan-bazar', name: 'Karwan Bazar (কারওয়ান বাজার)' },
  { slug: 'shahbagh', name: 'Shahbagh (শাহবাগ)' },
  { slug: 'dhaka-university', name: 'Dhaka University (ঢাকা বিশ্ববিদ্যালয়)' },
  { slug: 'bangladesh-secretariat', name: 'Secretariat (বাংলাদেশ সচিবালয়)' },
  { slug: 'motijheel', name: 'Motijheel (মতিঝিল)' },
];

export const MetroRailWidget: React.FC<MetroRailWidgetProps> = ({
  baseUrl,
  onInspectApi,
}) => {
  const [fromStation, setFromStation] = useState<string>('uttara-north');
  const [toStation, setToStation] = useState<string>('motijheel');
  const [fareData, setFareData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiCall, setApiCall] = useState<ApiCallDetails | null>(null);

  useEffect(() => {
    if (fromStation === toStation) return;
    let isCurrent = true;

    const fetchFare = async () => {
      setLoading(true);
      const url = `${baseUrl}/v1/metro/fare?from=${fromStation}&to=${toStation}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setFareData(json.data);
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/metro/fare?from=${fromStation}&to=${toStation}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: `MRT-6 Fare: ${fromStation} -> ${toStation}`,
          });
        }
      } catch (err) {
        console.error('Failed to fetch metro fare', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchFare();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl, fromStation, toStation]);

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="portal-icon-badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <Train size={18} />
          </div>
          <div>
            <h3 className="portal-card-title">Dhaka Metro Rail (MRT Line-6) Transit Guide</h3>
            <p className="portal-card-sub">স্টেশন নির্বাচন ও দ্রুত পাস / একক যাত্রার ভাড়া ক্যালকুলেটর</p>
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

      {/* Station Selectors Row */}
      <div className="metro-selectors-row">
        <div className="metro-select-group">
          <label className="metro-label">যাত্রা শুরু (Origin):</label>
          <select
            className="portal-select"
            value={fromStation}
            onChange={(e) => setFromStation(e.target.value)}
          >
            {METRO_STATIONS.map((s) => (
              <option key={s.slug} value={s.slug} disabled={s.slug === toStation}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="metro-arrow">
          <ArrowRight size={20} />
        </div>

        <div className="metro-select-group">
          <label className="metro-label">গন্তব্য (Destination):</label>
          <select
            className="portal-select"
            value={toStation}
            onChange={(e) => setToStation(e.target.value)}
          >
            {METRO_STATIONS.map((s) => (
              <option key={s.slug} value={s.slug} disabled={s.slug === fromStation}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fare Cards */}
      {loading ? (
        <div className="portal-loading">Calculating MRT fare…</div>
      ) : fareData ? (
        <div className="metro-fare-grid">
          <div className="metro-fare-card highlight-pass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="fare-badge-pass">MRT Pass / Rapid Pass (১০% ছাড়)</span>
              <Ticket size={16} style={{ color: 'var(--emerald)' }} />
            </div>
            <div className="fare-amount-row">
              <span className="fare-amount">৳{fareData.fare_mrt_pass ?? fareData.discounted_fare}</span>
              <span className="fare-sub">ডিসকাউন্টেড ভাড়া</span>
            </div>
          </div>

          <div className="metro-fare-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="fare-badge-reg">Single Journey Ticket (সাধারণ)</span>
              <Ticket size={16} style={{ opacity: 0.5 }} />
            </div>
            <div className="fare-amount-row">
              <span className="fare-amount">৳{fareData.fare_single_journey ?? fareData.regular_fare}</span>
              <span className="fare-sub">একক যাত্রা টিকিট</span>
            </div>
          </div>

          <div className="metro-fare-card info-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={15} style={{ color: 'var(--sky)' }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>আনুমানিক ভ্রমণ সময়:</span>
            </div>
            <div className="fare-amount-row">
              <span className="fare-amount" style={{ fontSize: 20 }}>
                ~{fareData.duration_minutes ?? Math.abs(METRO_STATIONS.findIndex(s=>s.slug===fromStation) - METRO_STATIONS.findIndex(s=>s.slug===toStation)) * 2.5} মিনিট
              </span>
              <span className="fare-sub">
                {fareData.stations_count ?? Math.abs(METRO_STATIONS.findIndex(s=>s.slug===fromStation) - METRO_STATIONS.findIndex(s=>s.slug===toStation)) + 1} টি স্টেশন
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="portal-footer-note">
        <span>সূত্র: ঢাকা ম্যাস ট্রানজিট কোম্পানি লিমিটেড (DMTCL) · সকাল ৭:১০ থেকে রাত ৯:৪০ পর্যন্ত চলমান</span>
      </div>
    </div>
  );
};

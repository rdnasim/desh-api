import React, { useState, useEffect } from 'react';
import { Train, ArrowRight, Sparkles, Clock, Ticket, ShieldCheck } from 'lucide-react';
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
            title: `MRT-6 Transit Fare: ${fromStation} -> ${toStation}`,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="portal-icon-badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <Train size={20} />
          </div>
          <div>
            <h3 className="portal-card-title">Dhaka Metro Rail (MRT Line-6) Navigator</h3>
            <p className="portal-card-sub">স্টেশন নির্বাচন, ভ্রমণ সময় ও একক যাত্রা বনাম এমআরটি পাস ডিসকাউন্টেড ভাড়া</p>
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
          <label className="metro-label">যাত্রা শুরু (Origin Station):</label>
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
          <ArrowRight size={22} />
        </div>

        <div className="metro-select-group">
          <label className="metro-label">গন্তব্য (Destination Station):</label>
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
        <div className="portal-loading">Calculating MRT fare route…</div>
      ) : fareData ? (
        <>
          <div className="metro-fare-grid">
            <div className="metro-fare-card highlight-pass">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="fare-badge-pass">MRT Pass / Rapid Pass (১০% ছাড়)</span>
                <Ticket size={18} style={{ color: 'var(--emerald)' }} />
              </div>
              <div className="fare-amount-row">
                <span className="fare-amount" style={{ color: 'var(--emerald)' }}>
                  ৳{fareData.mrt_pass_fare}
                </span>
                <span className="fare-sub">({fareData.mrt_pass_fare_bn} টাকা)</span>
              </div>
            </div>

            <div className="metro-fare-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="fare-badge-reg">Single Journey Ticket (সাধারণ টিকিট)</span>
                <Ticket size={18} style={{ opacity: 0.5 }} />
              </div>
              <div className="fare-amount-row">
                <span className="fare-amount">৳{fareData.single_journey_fare}</span>
                <span className="fare-sub">({fareData.single_journey_fare_bn} টাকা)</span>
              </div>
            </div>

            <div className="metro-fare-card info-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} style={{ color: 'var(--sky)' }} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>ভ্রমণ সময় ও দূরত্ব:</span>
              </div>
              <div className="fare-amount-row">
                <span className="fare-amount" style={{ fontSize: 22 }}>
                  ~{fareData.estimated_time_minutes} মিনিট
                </span>
                <span className="fare-sub">({fareData.distance_km} কি.মি., {fareData.stations_traversed} স্টেশন)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--emerald)' }} />
            <span>বীর মুক্তিযোদ্ধা ও ৩ ফুটের কম শিশুদের জন্য অভিভাবকের সাথে ভ্রমণ সম্পূর্ণ ফ্রি।</span>
          </div>
        </>
      ) : null}

      <div className="portal-footer-note">
        <span>সূত্র: ঢাকা ম্যাস ট্রানজিট কোম্পানি লিমিটেড (DMTCL) · ১৬টি স্টেশন পূর্ণাঙ্গ কার্যকর</span>
        <span>সকাল ৭:১০ – রাত ৯:৪০ (শুক্রবার বন্ধ)</span>
      </div>
    </div>
  );
};

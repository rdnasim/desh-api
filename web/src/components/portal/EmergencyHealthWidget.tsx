import React, { useState, useEffect } from 'react';
import { PhoneCall, HeartPulse, Sparkles, Building2 } from 'lucide-react';
import type { ApiCallDetails } from '../ApiInspectorModal';

interface EmergencyHealthWidgetProps {
  baseUrl: string;
  onInspectApi: (details: ApiCallDetails) => void;
}

const EMERGENCY_HOTLINES = [
  { number: '999', name_en: 'National Emergency', name_bn: 'জাতীয় জরুরি সেবা (পুলিশ, অ্যাম্বুলেন্স, ফায়ার)', toll_free: true },
  { number: '333', name_en: 'Citizen & Govt Portal', name_bn: 'সরকারি তথ্য ও সেবা হেল্পলাইন', toll_free: true },
  { number: '16263', name_en: 'Health Helpline (DGHS)', name_bn: 'স্বাস্থ্য বাতায়ন (২৪/৭ সরকারি টেলিমেডিসিন)', toll_free: false },
  { number: '109', name_en: 'Women & Child Abuse', name_bn: 'নারী ও শিশু নির্যাতন প্রতিরোধ সেল', toll_free: true },
  { number: '106', name_en: 'Anti-Corruption (ACC)', name_bn: 'দুর্দান্ত দমন কমিশন (দুদক হটলাইন)', toll_free: true },
  { number: '16122', name_en: 'Land Service Hotline', name_bn: 'ভূমিসেবা কল সেন্টার (ভূমি মন্ত্রণালয়)', toll_free: false },
];

export const EmergencyHealthWidget: React.FC<EmergencyHealthWidgetProps> = ({
  baseUrl,
  onInspectApi,
}) => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiCall, setApiCall] = useState<ApiCallDetails | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const fetchHospitals = async () => {
      setLoading(true);
      const url = `${baseUrl}/v1/health/emergency`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setHospitals(json.data?.hospitals || json.data || []);
          setApiCall({
            method: 'GET',
            url,
            path: '/v1/health/emergency',
            status: res.status,
            durationMs: duration,
            data: json,
            title: 'National 24/7 Emergency Hospitals',
          });
        }
      } catch (err) {
        console.error('Failed to fetch emergency hospitals', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchHospitals();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl]);

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="portal-icon-badge" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <HeartPulse size={18} />
          </div>
          <div>
            <h3 className="portal-card-title">National Emergency Hotlines & Hospitals</h3>
            <p className="portal-card-sub">জরুরি সেবা হটলাইন (৯৯৯/৩৩৩) ও ২৪/৭ সরকারি বিশেষায়িত হাসপাতাল</p>
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

      {/* Emergency Hotlines Grid */}
      <div className="hotlines-grid">
        {EMERGENCY_HOTLINES.map((h) => (
          <a
            key={h.number}
            href={`tel:${h.number}`}
            className="hotline-card"
            title={`Call ${h.number}`}
          >
            <div className="hotline-number">
              <PhoneCall size={16} />
              <span>{h.number}</span>
            </div>
            <div className="hotline-name-bn">{h.name_bn}</div>
            <div className="hotline-name-en">{h.name_en}</div>
          </a>
        ))}
      </div>

      {/* 24/7 Hospitals List */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Building2 size={16} style={{ color: 'var(--crimson)' }} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>24/7 National Emergency & Trauma Centers (DGHS):</span>
        </div>

        {loading ? (
          <div className="portal-loading">Loading emergency hospitals…</div>
        ) : hospitals.length > 0 ? (
          <div className="hospitals-list-grid">
            {hospitals.slice(0, 4).map((h: any, i: number) => (
              <div key={i} className="hospital-card">
                <div>
                  <h4 className="hospital-name">{h.name_bn || h.name_en}</h4>
                  <p className="hospital-name-en">{h.name_en}</p>
                  <p className="hospital-meta">
                    {h.location_address || h.district} · শয্যা সংখ্যা: {h.bed_capacity?.toLocaleString() || '1,000+'}
                  </p>
                </div>
                {h.emergency_phone && (
                  <a href={`tel:${h.emergency_phone}`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12, flexShrink: 0 }}>
                    <PhoneCall size={13} />
                    <span>{h.emergency_phone}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 8 }}>
            Hospitals directory currently synchronizing.
          </div>
        )}
      </div>

      <div className="portal-footer-note">
        <span>সূত্র: স্বাস্থ্য অধিদপ্তর (DGHS) ও বাংলাদেশ জাতীয় পোর্টাল · যেকোনো জরুরি বিপদে ৯৯৯ ডায়াল করুন</span>
      </div>
    </div>
  );
};

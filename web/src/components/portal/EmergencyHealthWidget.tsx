import React, { useState, useEffect } from 'react';
import { PhoneCall, HeartPulse, Sparkles, Building2, Truck } from 'lucide-react';
import type { ApiCallDetails } from '../ApiInspectorModal';

interface EmergencyHealthWidgetProps {
  baseUrl: string;
  onInspectApi: (details: ApiCallDetails) => void;
}

const DEFAULT_HOTLINES = [
  { number: '999', name_en: 'National Emergency Service', name_bn: 'জাতীয় জরুরি সেবা (পুলিশ, অ্যাম্বুলেন্স, ফায়ার)', description_bn: 'টোল-ফ্রি ২৪/৭ জরুরি সেবা' },
  { number: '16263', name_en: 'Shastho Batayan', name_bn: 'স্বাস্থ্য বাতায়ন (ডিজিএইচএস)', description_bn: 'সার্বক্ষণিক টেলিমেডিসিন ও স্বাস্থ্য পরামর্শ' },
  { number: '10655', name_en: 'IEDCR Disease Control', name_bn: 'আইইডিসিআর নিয়ন্ত্রণ কক্ষ', description_bn: 'সংক্রামক রোগ ও মহামারী পরামর্শ' },
  { number: '333', name_en: 'National Citizen Service', name_bn: 'জাতীয় তথ্য বাতায়ন ও নাগরিক সেবা', description_bn: 'সরকারি সেবা ও সহায়তা তথ্য' },
  { number: '109', name_en: 'Women & Child Abuse Helpline', name_bn: 'নারী ও শিশু নির্যাতন প্রতিরোধ সেল', description_bn: 'টোল-ফ্রি ২৪/৭ আইনি ও মনস্তাত্ত্বিক সহায়তা' },
  { number: '106', name_en: 'Anti-Corruption Helpline', name_bn: 'দুর্নীতি দমন কমিশন (দুদক হটলাইন)', description_bn: 'দুর্নীতি অভিযোগ দাখিল সেল' },
];

export const EmergencyHealthWidget: React.FC<EmergencyHealthWidgetProps> = ({
  baseUrl,
  onInspectApi,
}) => {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'ambulance'>('hospitals');
  const [hotlines, setHotlines] = useState<any[]>(DEFAULT_HOTLINES);
  const [traumaCenters, setTraumaCenters] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiCall, setApiCall] = useState<ApiCallDetails | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const fetchEmergency = async () => {
      setLoading(true);
      const url = `${baseUrl}/v1/health/emergency`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success && json.data) {
          if (json.data.national_hotlines?.length > 0) {
            setHotlines(json.data.national_hotlines);
          }
          if (json.data.trauma_and_burn_centers?.length > 0) {
            setTraumaCenters(json.data.trauma_and_burn_centers);
          }
          if (json.data.ambulance_services?.length > 0) {
            setAmbulances(json.data.ambulance_services);
          }
          setApiCall({
            method: 'GET',
            url,
            path: '/v1/health/emergency',
            status: res.status,
            durationMs: duration,
            data: json,
            title: 'National Emergency Health & Hotlines Directory',
          });
        }
      } catch (err) {
        console.error('Failed to fetch emergency health data', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchEmergency();
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
            <h3 className="portal-card-title">National Emergency Hotlines & Healthcare</h3>
            <p className="portal-card-sub">জরুরি সেবা হটলাইন (৯৯৯/১৬২৬৩), বিশেষায়িত ট্রমা সেন্টার ও অ্যাম্বুলেন্স সেবা</p>
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
        {hotlines.map((h: any) => (
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

      {/* Sub Tabs: Trauma Centers vs Ambulance */}
      <div style={{ marginTop: 18 }}>
        <div className="portal-tabs-pills" style={{ marginBottom: 12 }}>
          <button
            className={`portal-tab-pill ${activeTab === 'hospitals' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospitals')}
          >
            <Building2 size={13} style={{ marginRight: 6, display: 'inline' }} />
            24/7 Trauma & Specialized Centers ({traumaCenters.length})
          </button>
          <button
            className={`portal-tab-pill ${activeTab === 'ambulance' ? 'active' : ''}`}
            onClick={() => setActiveTab('ambulance')}
          >
            <Truck size={13} style={{ marginRight: 6, display: 'inline' }} />
            Emergency Ambulance Fleet ({ambulances.length})
          </button>
        </div>

        {loading ? (
          <div className="portal-loading">Loading verified emergency registry…</div>
        ) : activeTab === 'hospitals' ? (
          <div className="hospitals-list-grid">
            {traumaCenters.map((h: any, i: number) => (
              <div key={i} className="hospital-card">
                <div>
                  <h4 className="hospital-name">{h.name_bn || h.name_en}</h4>
                  <p className="hospital-name-en">{h.name_en}</p>
                  <p className="hospital-meta">
                    বিভাগ: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{h.division}</span>
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
          <div className="hospitals-list-grid">
            {ambulances.map((amb: any, i: number) => (
              <div key={i} className="hospital-card">
                <div>
                  <h4 className="hospital-name">{amb.name_bn}</h4>
                  <p className="hospital-name-en">{amb.name_en}</p>
                  <p className="hospital-meta">{amb.notes}</p>
                </div>
                {amb.number && (
                  <a href={`tel:${amb.number}`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12, flexShrink: 0 }}>
                    <PhoneCall size={13} />
                    <span>{amb.number}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="portal-footer-note">
        <span>সূত্র: স্বাস্থ্য অধিদপ্তর (DGHS), স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয় · যেকোনো জরুরি বিপদে ৯৯৯ ডায়াল করুন</span>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Sparkles, Building, Vote, CheckCircle2 } from 'lucide-react';
import type { ApiCallDetails } from '../ApiInspectorModal';

interface GeoLookupWidgetProps {
  baseUrl: string;
  onInspectApi: (details: ApiCallDetails) => void;
}

export const GeoLookupWidget: React.FC<GeoLookupWidgetProps> = ({
  baseUrl,
  onInspectApi,
}) => {
  const [tab, setTab] = useState<'postcode' | 'routing' | 'constituency'>('postcode');

  // Postcode
  const [postcode, setPostcode] = useState<string>('1205');
  const [postcodeResult, setPostcodeResult] = useState<any>(null);

  // Routing
  const [routingNumber, setRoutingNumber] = useState<string>('010130065');
  const [routingResult, setRoutingResult] = useState<any>(null);

  // Constituency
  const [seatQuery, setSeatQuery] = useState<string>('174');
  const [constituencyResult, setConstituencyResult] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [apiCall, setApiCall] = useState<ApiCallDetails | null>(null);

  // Postcode fetch
  useEffect(() => {
    if (tab !== 'postcode') return;
    let isCurrent = true;
    if (postcode.length < 4) return;

    const fetchPostcode = async () => {
      setLoading(true);
      const url = `${baseUrl}/v1/postcodes/${postcode}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setPostcodeResult(json.data);
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/postcodes/${postcode}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: `Postcode Lookup: ${postcode}`,
          });
        } else {
          setPostcodeResult(null);
        }
      } catch (err) {
        setPostcodeResult(null);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    const timer = setTimeout(fetchPostcode, 250);
    return () => {
      clearTimeout(timer);
      isCurrent = false;
    };
  }, [baseUrl, postcode, tab]);

  // Routing fetch
  useEffect(() => {
    if (tab !== 'routing') return;
    let isCurrent = true;
    if (routingNumber.length < 9) return;

    const fetchRouting = async () => {
      setLoading(true);
      const url = `${baseUrl}/v1/routing/${routingNumber}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setRoutingResult(json.data);
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/routing/${routingNumber}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: `Bank BEFTN Routing Lookup: ${routingNumber}`,
          });
        } else {
          setRoutingResult(null);
        }
      } catch (err) {
        setRoutingResult(null);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    const timer = setTimeout(fetchRouting, 250);
    return () => {
      clearTimeout(timer);
      isCurrent = false;
    };
  }, [baseUrl, routingNumber, tab]);

  // Constituency fetch
  useEffect(() => {
    if (tab !== 'constituency') return;
    let isCurrent = true;
    if (!seatQuery.trim()) return;

    const fetchSeat = async () => {
      setLoading(true);
      const url = `${baseUrl}/v1/constituencies/${seatQuery}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setConstituencyResult(json.data);
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/constituencies/${seatQuery}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: `Parliamentary Constituency: ${seatQuery}`,
          });
        } else {
          setConstituencyResult(null);
        }
      } catch (err) {
        setConstituencyResult(null);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    const timer = setTimeout(fetchSeat, 250);
    return () => {
      clearTimeout(timer);
      isCurrent = false;
    };
  }, [baseUrl, seatQuery, tab]);

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="portal-icon-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
            <MapPin size={18} />
          </div>
          <div>
            <h3 className="portal-card-title">Geographic & Institutional Registry</h3>
            <p className="portal-card-sub">পোস্টকোড, ব্যাংক রাউটিং নম্বর ও ৩০০ সংসদীয় আসন অনুসন্ধান</p>
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

      <div className="portal-tabs-pills">
        <button
          className={`portal-tab-pill ${tab === 'postcode' ? 'active' : ''}`}
          onClick={() => setTab('postcode')}
        >
          Postcode Finder (পোস্টকোড)
        </button>
        <button
          className={`portal-tab-pill ${tab === 'routing' ? 'active' : ''}`}
          onClick={() => setTab('routing')}
        >
          Bank Routing No (রাউটিং নম্বর)
        </button>
        <button
          className={`portal-tab-pill ${tab === 'constituency' ? 'active' : ''}`}
          onClick={() => setTab('constituency')}
        >
          Constituencies (সংসদীয় আসন)
        </button>
      </div>

      {loading && <div className="portal-loading">Searching registry…</div>}

      {tab === 'postcode' && (
        <div className="lookup-content">
          <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
            Enter 4-Digit Postcode (ডাকঘর পোস্টকোড লিখুন):
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="portal-input"
              style={{ paddingLeft: 38 }}
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. 1205, 3500, 4000"
            />
          </div>

          {postcodeResult && (
            <div className="lookup-result-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--emerald)', marginBottom: 6 }}>
                <CheckCircle2 size={16} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>পোস্টকোড পাওয়া গেছে:</span>
              </div>
              <div className="lookup-title-row">
                <span className="lookup-title-bn">{postcodeResult.post_office_bn || postcodeResult.name_bn}</span>
                <span className="lookup-badge">{postcodeResult.postcode}</span>
              </div>
              <p className="lookup-meta">
                পোস্ট অফিস: {postcodeResult.post_office_en} · উপজেলা: {postcodeResult.upazila_en} · জেলা: {postcodeResult.district_en}
              </p>
            </div>
          )}
        </div>
      )}

      {tab === 'routing' && (
        <div className="lookup-content">
          <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
            Enter 9-Digit BEFTN Routing Number (৯ ডিজিটের রাউটিং নম্বর):
          </label>
          <div style={{ position: 'relative' }}>
            <Building size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="portal-input"
              style={{ paddingLeft: 38 }}
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              placeholder="e.g. 010130065"
            />
          </div>

          {routingResult && (
            <div className="lookup-result-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--emerald)', marginBottom: 6 }}>
                <CheckCircle2 size={16} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>বাংলাদেশ ব্যাংক শাখা যাচাইকৃত:</span>
              </div>
              <div className="lookup-title-row">
                <span className="lookup-title-bn">{routingResult.bank_name || routingResult.bank}</span>
                <span className="lookup-badge">{routingResult.routing_no || routingNumber}</span>
              </div>
              <p className="lookup-meta">
                শাখা (Branch): {routingResult.branch_name || routingResult.branch} · জেলা: {routingResult.district} · রাউটিং কোড: {routingResult.routing_no}
              </p>
            </div>
          )}
        </div>
      )}

      {tab === 'constituency' && (
        <div className="lookup-content">
          <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
            Enter Seat Number 1-300 or Slug (আসন নম্বর বা স্লাগ):
          </label>
          <div style={{ position: 'relative' }}>
            <Vote size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="portal-input"
              style={{ paddingLeft: 38 }}
              value={seatQuery}
              onChange={(e) => setSeatQuery(e.target.value)}
              placeholder="e.g. 174 or dhaka-1"
            />
          </div>

          {constituencyResult && (
            <div className="lookup-result-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--emerald)', marginBottom: 6 }}>
                <Vote size={16} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>জাতীয় সংসদীয় আসন:</span>
              </div>
              <div className="lookup-title-row">
                <span className="lookup-title-bn">{constituencyResult.name_bn || constituencyResult.name_en}</span>
                <span className="lookup-badge">আসন নং {constituencyResult.number}</span>
              </div>
              <p className="lookup-meta">
                আসন কোড: {constituencyResult.code} · নির্বাচনী সীমানা: {constituencyResult.area_description_bn || constituencyResult.area_description_en || 'উপজেলা/ওয়ার্ড অন্তর্ভুক্ত'}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="portal-footer-note">
        <span>সূত্র: বাংলাদেশ ডাক বিভাগ, বাংলাদেশ ব্যাংক (১১,৫৩৩ শাখা) ও বাংলাদেশ নির্বাচন কমিশন</span>
      </div>
    </div>
  );
};

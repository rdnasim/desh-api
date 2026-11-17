import React, { useState, useEffect } from 'react';
import { Plane, Landmark, Waves, Anchor, Sparkles } from 'lucide-react';
import type { ApiCallDetails } from '../ApiInspectorModal';

interface TravelGeographyWidgetProps {
  baseUrl: string;
  onInspectApi: (details: ApiCallDetails) => void;
}

export const TravelGeographyWidget: React.FC<TravelGeographyWidgetProps> = ({
  baseUrl,
  onInspectApi,
}) => {
  const [activeTab, setActiveTab] = useState<'airports' | 'heritage' | 'rivers' | 'ports'>('airports');

  // Airports State
  const [airportType, setAirportType] = useState<string>('international');
  const [airportsList, setAirportsList] = useState<any[]>([]);

  // Heritage State
  const [heritageType, setHeritageType] = useState<string>('unesco_world_heritage');
  const [heritageList, setHeritageList] = useState<any[]>([]);

  // Rivers State
  const [riverQuery, setRiverQuery] = useState<string>('padma');
  const [riverDetail, setRiverDetail] = useState<any>(null);

  // Land Ports State
  const [portStatus, setPortStatus] = useState<string>('operational');
  const [portsList, setPortsList] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [apiCall, setApiCall] = useState<ApiCallDetails | null>(null);

  // Fetch Airports
  useEffect(() => {
    if (activeTab !== 'airports') return;
    let isCurrent = true;

    const fetchAirports = async () => {
      setLoading(true);
      const url = `${baseUrl}/v1/airports${airportType ? `?type=${airportType}` : ''}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setAirportsList(json.data || []);
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/airports${airportType ? `?type=${airportType}` : ''}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: `CAAB Airports (${airportType || 'All'})`,
          });
        }
      } catch (err) {
        if (isCurrent) setAirportsList([]);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchAirports();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl, activeTab, airportType]);

  // Fetch Heritage
  useEffect(() => {
    if (activeTab !== 'heritage') return;
    let isCurrent = true;

    const fetchHeritage = async () => {
      setLoading(true);
      const url = `${baseUrl}/v1/heritage${heritageType ? `?type=${heritageType}` : ''}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setHeritageList(json.data || []);
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/heritage${heritageType ? `?type=${heritageType}` : ''}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: `Heritage Sites (${heritageType || 'All'})`,
          });
        }
      } catch (err) {
        if (isCurrent) setHeritageList([]);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchHeritage();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl, activeTab, heritageType]);

  // Fetch River
  useEffect(() => {
    if (activeTab !== 'rivers') return;
    let isCurrent = true;

    const fetchRiver = async () => {
      setLoading(true);
      const url = `${baseUrl}/v1/rivers/${riverQuery}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setRiverDetail(json.data);
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/rivers/${riverQuery}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: `River Details: ${riverQuery}`,
          });
        }
      } catch (err) {
        if (isCurrent) setRiverDetail(null);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchRiver();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl, activeTab, riverQuery]);

  // Fetch Land Ports
  useEffect(() => {
    if (activeTab !== 'ports') return;
    let isCurrent = true;

    const fetchPorts = async () => {
      setLoading(true);
      const url = `${baseUrl}/v1/ports/land${portStatus ? `?status=${portStatus}` : ''}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setPortsList(json.data || []);
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/ports/land${portStatus ? `?status=${portStatus}` : ''}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: `Statutory Land Ports (${portStatus})`,
          });
        }
      } catch (err) {
        if (isCurrent) setPortsList([]);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchPorts();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl, activeTab, portStatus]);

  return (
    <div className="card portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="portal-icon-box" style={{ background: 'var(--sky-subtle)', color: 'var(--sky)' }}>
            <Anchor size={20} />
          </div>
          <div>
            <h3 className="portal-card-title">Travel, Waterways & Ports</h3>
            <p className="portal-card-desc">বিমানবন্দর, হেরিটেজ, নদীমাতৃক বাংলাদেশ ও স্থলবন্দর</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Updating...</span>
          )}
          {apiCall && (
            <button
              onClick={() => onInspectApi(apiCall)}
              className="btn btn-outline btn-xs"
              title="Inspect Live API Request & Latency"
            >
              <Sparkles size={12} />
              <span>Inspect API</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="tab-pill-group" style={{ marginBottom: 14 }}>
        <button
          className={`tab-pill ${activeTab === 'airports' ? 'active' : ''}`}
          onClick={() => setActiveTab('airports')}
        >
          <Plane size={14} />
          <span>Airports</span>
        </button>
        <button
          className={`tab-pill ${activeTab === 'heritage' ? 'active' : ''}`}
          onClick={() => setActiveTab('heritage')}
        >
          <Landmark size={14} />
          <span>Heritage</span>
        </button>
        <button
          className={`tab-pill ${activeTab === 'rivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('rivers')}
        >
          <Waves size={14} />
          <span>Rivers</span>
        </button>
        <button
          className={`tab-pill ${activeTab === 'ports' ? 'active' : ''}`}
          onClick={() => setActiveTab('ports')}
        >
          <Anchor size={14} />
          <span>Land Ports</span>
        </button>
      </div>

      {/* Tab 1: Airports */}
      {activeTab === 'airports' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { id: 'international', label: 'International (৩টি)' },
              { id: 'domestic', label: 'Domestic (৫টি)' },
              { id: 'stolport', label: 'STOLport / Other' },
              { id: '', label: 'All 15 CAAB Facilities' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setAirportType(t.id)}
                className={`btn btn-xs ${airportType === t.id ? 'btn-primary' : 'btn-outline'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
            {airportsList.map((a: any) => (
              <div key={a.slug} style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{a.name_en}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.name_bn}</div>
                  </div>
                  <span className="badge badge-primary" style={{ fontWeight: 700, fontSize: 11 }}>
                    {a.iata_code || a.icao_code}
                  </span>
                </div>
                <div style={{ fontSize: 12, marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span className="badge badge-outline">{a.district}</span>
                  <span className="badge badge-outline">{a.type}</span>
                  {a.runway_length_meters && (
                    <span className="badge badge-outline">Runway: {a.runway_length_meters}m</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Heritage */}
      {activeTab === 'heritage' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { id: 'unesco_world_heritage', label: 'UNESCO World Heritage (৩টি)' },
              { id: 'archaeological_site', label: 'Archaeological Monuments' },
              { id: 'eco_tourism', label: 'Eco-Tourism' },
              { id: '', label: 'All 35 Sites' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setHeritageType(t.id)}
                className={`btn btn-xs ${heritageType === t.id ? 'btn-primary' : 'btn-outline'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
            {heritageList.map((h: any) => (
              <div key={h.slug} style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{h.name_en}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.name_bn}</div>
                  </div>
                  {h.unesco_id && (
                    <span className="badge badge-success" style={{ fontWeight: 700, fontSize: 10 }}>
                      UNESCO #{h.unesco_id}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-main)', marginTop: 4, lineHeight: 1.4 }}>
                  {h.description_en}
                </p>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, display: 'flex', gap: 8 }}>
                  <span>📍 {h.district}, {h.division}</span>
                  {h.historical_period && <span>🏛️ {h.historical_period}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Rivers */}
      {activeTab === 'rivers' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {[
              { slug: 'padma', name: 'পদ্মা (Padma)' },
              { slug: 'meghna', name: 'মেঘনা (Meghna)' },
              { slug: 'jamuna', name: 'যমুনা (Jamuna)' },
              { slug: 'karnaphuli', name: 'কর্ণফুলী (Karnaphuli)' },
              { slug: 'halda', name: 'হালদা (Halda)' },
              { slug: 'surma', name: 'সুরমা (Surma)' },
              { slug: 'teesta', name: 'তিস্তা (Teesta)' },
            ].map((r) => (
              <button
                key={r.slug}
                onClick={() => setRiverQuery(r.slug)}
                className={`btn btn-xs ${riverQuery === r.slug ? 'btn-primary' : 'btn-outline'}`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {riverDetail && (
            <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700 }}>{riverDetail.name_en} ({riverDetail.name_bn})</h4>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {riverDetail.is_transboundary ? '🌐 Transboundary River (আন্তঃসীমান্ত নদী)' : '🇧🇩 Internal Waterway'}
                  </div>
                </div>
                <span className="badge badge-info" style={{ fontWeight: 700 }}>
                  {riverDetail.length_km ? `${riverDetail.length_km} km` : 'Lifeline Waterway'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 12 }}>
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Origin: </span>
                  <strong>{riverDetail.origin}</strong>
                </div>
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Outflow: </span>
                  <strong>{riverDetail.outflow}</strong>
                </div>
                {riverDetail.average_width_meters && (
                  <div style={{ fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Avg Width: </span>
                    <strong>{riverDetail.average_width_meters} m</strong>
                  </div>
                )}
              </div>

              <p style={{ fontSize: 12, marginTop: 10, lineHeight: 1.4, color: 'var(--text-main)' }}>
                {riverDetail.description_en}
              </p>

              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                <strong>Traversed Districts: </strong>
                {riverDetail.districts?.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Land Ports */}
      {activeTab === 'ports' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { id: 'operational', label: 'Operational (১৮টি)' },
              { id: 'under_development', label: 'Under Development (৩টি)' },
              { id: '', label: 'All 24 Statutory Ports' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPortStatus(p.id)}
                className={`btn btn-xs ${portStatus === p.id ? 'btn-primary' : 'btn-outline'}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
            {portsList.map((p: any) => (
              <div key={p.slug} style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{p.name_en}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.name_bn}</div>
                  </div>
                  <span className="badge badge-warning" style={{ fontWeight: 700, fontSize: 11 }}>
                    {p.code}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-main)', marginTop: 4 }}>
                  <strong>Indian Counterpart LCS: </strong>
                  <span>{p.counterpart_indian_lcs}</span>
                </div>
                <div style={{ fontSize: 11, marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span className="badge badge-outline">📍 {p.district}</span>
                  {p.has_rail_link && <span className="badge badge-success">🚆 Rail Link</span>}
                  {p.has_passenger_immigration && <span className="badge badge-info">🛂 Immigration</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

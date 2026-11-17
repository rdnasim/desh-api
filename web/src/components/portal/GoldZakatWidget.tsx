import React, { useState, useEffect } from 'react';
import { Coins, Sparkles, Scale, Calendar } from 'lucide-react';
import type { ApiCallDetails } from '../ApiInspectorModal';

interface GoldZakatWidgetProps {
  baseUrl: string;
  onInspectApi: (details: ApiCallDetails) => void;
}

export const GoldZakatWidget: React.FC<GoldZakatWidgetProps> = ({
  baseUrl,
  onInspectApi,
}) => {
  const [goldPrices, setGoldPrices] = useState<any>(null);
  const [wealthInput, setWealthInput] = useState<string>('500000');
  const [zakatResult, setZakatResult] = useState<any>(null);
  const [apiCall, setApiCall] = useState<ApiCallDetails | null>(null);

  // Fetch BAJUS gold prices
  useEffect(() => {
    let isCurrent = true;
    const fetchGold = async () => {
      const url = `${baseUrl}/v1/gold/prices`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setGoldPrices(json.data);
          setApiCall({
            method: 'GET',
            url,
            path: '/v1/gold/prices',
            status: res.status,
            durationMs: duration,
            data: json,
            title: 'BAJUS Live Gold & Silver Prices',
          });
        }
      } catch (err) {
        console.error('Failed to fetch gold prices', err);
      }
    };
    fetchGold();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl]);

  // Calculate Zakat when wealth changes
  useEffect(() => {
    let isCurrent = true;
    const num = parseFloat(wealthInput);
    if (isNaN(num) || num < 0) return;

    const calcZakat = async () => {
      const url = `${baseUrl}/v1/zakat?wealth=${num}`;
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (isCurrent && json.success) {
          setZakatResult(json.data);
        }
      } catch (err) {
        console.error('Failed to calculate zakat', err);
      }
    };

    const timer = setTimeout(calcZakat, 250);
    return () => {
      clearTimeout(timer);
      isCurrent = false;
    };
  }, [baseUrl, wealthInput]);

  const gold = goldPrices?.gold;
  const silver = goldPrices?.silver;

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="portal-icon-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Coins size={20} />
          </div>
          <div>
            <h3 className="portal-card-title">Gold & Silver Rates · Zakat Calculator</h3>
            <p className="portal-card-sub">বাজুস নির্ধারিত সোনার দর ও ইসলামিক স্বর্ণ/রৌপ্য নিসাবভিত্তিক যাকাত</p>
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

      {/* Gold Rates Grid */}
      {gold ? (
        <div className="gold-grid">
          <div className="gold-card highlight-gold">
            <span className="gold-type">২২ ক্যারেট (22K Gold)</span>
            <span className="gold-price-big">৳{gold['22k']?.per_vori?.toLocaleString() || '2,17,592'}</span>
            <span className="gold-sub">প্রতি ভরি (৳{gold['22k']?.per_gram?.toLocaleString()}/গ্রাম)</span>
          </div>

          <div className="gold-card">
            <span className="gold-type">২১ ক্যারেট (21K Gold)</span>
            <span className="gold-price-big">৳{gold['21k']?.per_vori?.toLocaleString() || '2,07,794'}</span>
            <span className="gold-sub">প্রতি ভরি (৳{gold['21k']?.per_gram?.toLocaleString()}/গ্রাম)</span>
          </div>

          <div className="gold-card">
            <span className="gold-type">১৮ ক্যারেট (18K Gold)</span>
            <span className="gold-price-big">৳{gold['18k']?.per_vori?.toLocaleString() || '1,78,459'}</span>
            <span className="gold-sub">প্রতি ভরি (৳{gold['18k']?.per_gram?.toLocaleString()}/গ্রাম)</span>
          </div>

          <div className="gold-card">
            <span className="gold-type">২২K রুপা (22K Silver)</span>
            <span className="gold-price-big">৳{silver?.['22k']?.per_vori?.toLocaleString() || '3,499'}</span>
            <span className="gold-sub">প্রতি ভরি (৳{silver?.['22k']?.per_gram?.toLocaleString()}/গ্রাম)</span>
          </div>
        </div>
      ) : (
        <div className="portal-loading">Loading live BAJUS bullion rates…</div>
      )}

      {/* Interactive Zakat Calculator Section */}
      <div className="zakat-calculator-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Scale size={16} style={{ color: 'var(--crimson)' }} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>যাকাত ক্যালকুলেটর (Zakat Calculator):</span>
        </div>

        <div className="zakat-input-row">
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              মোট যাকাতযোগ্য সম্পদ ও নগদ অর্থ (Net Zakatable Wealth in BDT):
            </label>
            <input
              type="number"
              className="portal-input"
              value={wealthInput}
              onChange={(e) => setWealthInput(e.target.value)}
              placeholder="e.g. 500000"
            />
          </div>

          {zakatResult && (
            <div className="zakat-result-card" style={{ borderColor: zakatResult.due ? 'var(--emerald)' : 'var(--border-strong)' }}>
              <span className="zakat-result-label" style={{ color: zakatResult.due ? 'var(--emerald)' : 'var(--text-muted)' }}>
                {zakatResult.due ? '✓ যাকাত ফরজ হয়েছে (Zakat Due)' : 'নিসাব অতিক্রম করেনি'}
              </span>
              <span className="zakat-result-value">
                ৳{zakatResult.zakat?.toLocaleString() || '0'}
              </span>
              <span className="zakat-result-sub">
                রৌপ্য নিসাব: ৳{Math.round(zakatResult.nisab_value)?.toLocaleString()} ({zakatResult.basis})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="portal-footer-note">
        <span>
          <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          কার্যকর তারিখ: {goldPrices?.effective_date || 'সর্বশেষ আপডেট'} · সূত্র: বাংলাদেশ জুয়েলার্স অ্যাসোসিয়েশন (BAJUS)
        </span>
        <span>হিসাবের হার: ২.৫%</span>
      </div>
    </div>
  );
};

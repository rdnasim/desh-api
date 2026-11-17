import React, { useState, useEffect } from 'react';
import { Coins, Sparkles, Scale } from 'lucide-react';
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

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="portal-icon-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Coins size={18} />
          </div>
          <div>
            <h3 className="portal-card-title">Gold Prices & Zakat Calculator</h3>
            <p className="portal-card-sub">বাজুস নির্ধারিত আজকের সোনার দাম ও লাইভ নিসাবভিত্তিক যাকাত</p>
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
      {goldPrices ? (
        <div className="gold-grid">
          <div className="gold-card highlight-gold">
            <span className="gold-type">22 Karat (ক্যাডমিয়াম)</span>
            <span className="gold-price-big">৳{goldPrices.gold_22k?.per_vori?.toLocaleString() || '1,42,000'}</span>
            <span className="gold-sub">প্রতি ভরি (৳{goldPrices.gold_22k?.per_gram?.toLocaleString() || '12,174'}/গ্রাম)</span>
          </div>

          <div className="gold-card">
            <span className="gold-type">21 Karat</span>
            <span className="gold-price-big">৳{goldPrices.gold_21k?.per_vori?.toLocaleString() || '1,35,000'}</span>
            <span className="gold-sub">প্রতি ভরি (৳{goldPrices.gold_21k?.per_gram?.toLocaleString() || '11,575'}/গ্রাম)</span>
          </div>

          <div className="gold-card">
            <span className="gold-type">18 Karat</span>
            <span className="gold-price-big">৳{goldPrices.gold_18k?.per_vori?.toLocaleString() || '1,16,000'}</span>
            <span className="gold-sub">প্রতি ভরি (৳{goldPrices.gold_18k?.per_gram?.toLocaleString() || '9,945'}/গ্রাম)</span>
          </div>

          <div className="gold-card">
            <span className="gold-type">22K Silver (রুপা)</span>
            <span className="gold-price-big">৳{goldPrices.silver_22k?.per_vori?.toLocaleString() || '2,741'}</span>
            <span className="gold-sub">প্রতি ভরি (৳{goldPrices.silver_22k?.per_gram?.toLocaleString() || '235'}/গ্রাম)</span>
          </div>
        </div>
      ) : (
        <div className="portal-loading">Loading BAJUS rates…</div>
      )}

      {/* Interactive Zakat Calculator Section */}
      <div className="zakat-calculator-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Scale size={16} style={{ color: 'var(--crimson)' }} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>Live Zakat Calculator (যাকাত হিসাব):</span>
        </div>

        <div className="zakat-input-row">
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Net Zakatable Wealth / Cash (সঞ্চয় ও নগদ অর্থ BDT)
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
            <div className="zakat-result-card">
              <span className="zakat-result-label">
                {zakatResult.is_zakat_due ? 'যাকাত প্রযোজ্য (Zakat Due)' : 'নিসাব পূর্ণ হয়নি'}
              </span>
              <span className="zakat-result-value">
                ৳{zakatResult.zakat_payable_bdt?.toLocaleString() || '0'}
              </span>
              <span className="zakat-result-sub">
                নিসাব: ৳{zakatResult.silver_nisab_bdt?.toLocaleString()} (রৌপ্য নিসাব)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="portal-footer-note">
        <span>সূত্র: বাংলাদেশ জুয়েলার্স অ্যাসোসিয়েশন (BAJUS) · নিসাব: ৫২.৫ তোলা রুপা বা ৭.৫ তোলা সোনা</span>
      </div>
    </div>
  );
};

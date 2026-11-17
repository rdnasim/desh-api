import React, { useState, useEffect } from 'react';
import { ShoppingBag, Fuel, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import type { ApiCallDetails } from '../ApiInspectorModal';

interface MarketPricesWidgetProps {
  baseUrl: string;
  onInspectApi: (details: ApiCallDetails) => void;
}

const CATEGORIES = [
  { slug: 'edible-oil', name: 'Edible Oil (তেল)' },
  { slug: 'rice', name: 'Rice (চাল)' },
  { slug: 'pulses', name: 'Pulses (ডাল)' },
  { slug: 'spices', name: 'Spices (পেঁয়াজ/মশলা)' },
  { slug: 'meat-fish', name: 'Meat & Fish (মাংস/মাছ)' },
];

export const MarketPricesWidget: React.FC<MarketPricesWidgetProps> = ({
  baseUrl,
  onInspectApi,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('edible-oil');
  const [marketData, setMarketData] = useState<any>(null);
  const [fuelData, setFuelData] = useState<any>(null);
  const [loadingMarket, setLoadingMarket] = useState<boolean>(true);
  const [apiCall, setApiCall] = useState<ApiCallDetails | null>(null);

  // Fetch Market Prices
  useEffect(() => {
    let isCurrent = true;
    const fetchMarket = async () => {
      setLoadingMarket(true);
      const url = `${baseUrl}/v1/market/prices?category=${activeCategory}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);

        if (isCurrent && json.success) {
          setMarketData(json.data);
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/market/prices?category=${activeCategory}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: `TCB Daily Retail Prices (${activeCategory})`,
          });
        }
      } catch (err) {
        console.error('Failed to fetch market prices', err);
      } finally {
        if (isCurrent) setLoadingMarket(false);
      }
    };

    fetchMarket();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl, activeCategory]);

  // Fetch Fuel Prices
  useEffect(() => {
    let isCurrent = true;
    const fetchFuel = async () => {
      const url = `${baseUrl}/v1/fuel/prices`;
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (isCurrent && json.success) {
          setFuelData(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch fuel prices', err);
      }
    };
    fetchFuel();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl]);

  const fuelPrices = fuelData?.prices;
  const items = marketData?.items || [];

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="portal-icon-badge" style={{ background: 'var(--amber-subtle)', color: 'var(--amber)' }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="portal-card-title">Daily Market & Fuel Prices</h3>
            <p className="portal-card-sub">টিসিবি দৈনিক নিত্যপ্রয়োজনীয় বাজারদর ও সরকারি জ্বালানি তেলের মূল্য</p>
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

      {/* Fuel Quick Rates Strip */}
      {fuelPrices && (
        <div className="fuel-strip">
          <div className="fuel-label">
            <Fuel size={15} style={{ color: 'var(--crimson)' }} />
            <span>জ্বালানি তেলের দাম (কার্যকর {fuelData.effective_from || 'চলতি মাস'}):</span>
          </div>
          <div className="fuel-tags">
            <div className="fuel-tag">
              <span className="fuel-name">অকটেন (Octane)</span>
              <span className="fuel-price">৳{fuelPrices.octane}/L</span>
            </div>
            <div className="fuel-tag">
              <span className="fuel-name">পেট্রোল (Petrol)</span>
              <span className="fuel-price">৳{fuelPrices.petrol}/L</span>
            </div>
            <div className="fuel-tag">
              <span className="fuel-name">ডিজেল (Diesel)</span>
              <span className="fuel-price">৳{fuelPrices.diesel}/L</span>
            </div>
            <div className="fuel-tag">
              <span className="fuel-name">কেরোসিন (Kerosene)</span>
              <span className="fuel-price">৳{fuelPrices.kerosene}/L</span>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="portal-tabs-pills">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            className={`portal-tab-pill ${activeCategory === cat.slug ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Market Items Table */}
      {loadingMarket ? (
        <div className="portal-loading">Fetching today's commodity prices from TCB…</div>
      ) : items.length > 0 ? (
        <div className="commodity-grid">
          {items.slice(0, 6).map((item: any, idx: number) => (
            <div key={idx} className="commodity-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="commodity-name-bn">{item.item_bn || item.item_en}</div>
                  <div className="commodity-name-en">{item.item_en}</div>
                </div>
                <TrendingUp size={14} style={{ opacity: 0.4, color: 'var(--emerald)' }} />
              </div>
              <div className="commodity-price-row">
                <span className="commodity-price">
                  ৳{item.price_min}{item.price_max !== item.price_min ? ` – ৳${item.price_max}` : ''}
                </span>
                <span className="commodity-unit">/ {item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 12 }}>
          No market price data available for this category.
        </div>
      )}

      <div className="portal-footer-note">
        <span>
          <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          রিপোর্ট তারিখ: {marketData?.date || 'আজকের বাজার'} · উৎস: ট্রেডিং কর্পোরেশন অব বাংলাদেশ (TCB)
        </span>
        <span>বাংলাদেশ পেট্রোলিয়াম কর্পোরেশন (BPC)</span>
      </div>
    </div>
  );
};

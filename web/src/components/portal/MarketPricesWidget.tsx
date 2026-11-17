import React, { useState, useEffect } from 'react';
import { ShoppingBag, Fuel, Sparkles, TrendingUp } from 'lucide-react';
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
  const [marketItems, setMarketItems] = useState<any[]>([]);
  const [fuelItems, setFuelItems] = useState<any[]>([]);
  const [loadingMarket, setLoadingMarket] = useState<boolean>(true);
  const [marketApiCall, setMarketApiCall] = useState<ApiCallDetails | null>(null);

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
          setMarketItems(json.data?.items || []);
          setMarketApiCall({
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
          setFuelItems(json.data?.fuels || []);
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

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="portal-icon-badge" style={{ background: 'var(--amber-subtle)', color: 'var(--amber)' }}>
            <ShoppingBag size={18} />
          </div>
          <div>
            <h3 className="portal-card-title">Daily Market & Fuel Prices</h3>
            <p className="portal-card-sub">টিসিবি বাজারদর ও সরকারি জ্বালানি তেলের দাম</p>
          </div>
        </div>

        {marketApiCall && (
          <button
            onClick={() => onInspectApi(marketApiCall)}
            className="api-call-badge"
            title="Inspect underlying API call and response"
          >
            <Sparkles size={11} />
            <span>API ({marketApiCall.durationMs}ms)</span>
          </button>
        )}
      </div>

      {/* Fuel Quick Rates Strip */}
      {fuelItems.length > 0 && (
        <div className="fuel-strip">
          <div className="fuel-label">
            <Fuel size={14} style={{ color: 'var(--crimson)' }} />
            <span>Government Fuel Tariffs (BPC):</span>
          </div>
          <div className="fuel-tags">
            {fuelItems.map((f: any) => (
              <div key={f.code} className="fuel-tag">
                <span className="fuel-name">{f.name_en}</span>
                <span className="fuel-price">৳{f.price_bdt}/L</span>
              </div>
            ))}
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
        <div className="portal-loading">Fetching today's commodity prices…</div>
      ) : marketItems.length > 0 ? (
        <div className="commodity-grid">
          {marketItems.slice(0, 6).map((item: any, idx: number) => (
            <div key={idx} className="commodity-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="commodity-name-bn">{item.item_bn || item.item_en}</div>
                  <div className="commodity-name-en">{item.item_en} ({item.unit})</div>
                </div>
                <TrendingUp size={14} style={{ opacity: 0.5 }} />
              </div>
              <div className="commodity-price-row">
                <span className="commodity-price">
                  ৳{item.price_min}{item.price_max !== item.price_min ? ` - ৳${item.price_max}` : ''}
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
        <span>সূত্র: ট্রেডিং কর্পোরেশন অব বাংলাদেশ (TCB) ও বাংলাদেশ পেট্রোলিয়াম কর্পোরেশন (BPC)</span>
      </div>
    </div>
  );
};

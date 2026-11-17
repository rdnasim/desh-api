import React, { useState, useEffect } from 'react';
import { Calculator, Sparkles } from 'lucide-react';
import type { ApiCallDetails } from '../ApiInspectorModal';

interface FinanceCalculatorWidgetProps {
  baseUrl: string;
  onInspectApi: (details: ApiCallDetails) => void;
}

export const FinanceCalculatorWidget: React.FC<FinanceCalculatorWidgetProps> = ({
  baseUrl,
  onInspectApi,
}) => {
  const [calcType, setCalcType] = useState<'tax' | 'emi'>('tax');
  const [income, setIncome] = useState<string>('1200000');
  const [taxpayer, setTaxpayer] = useState<string>('general');
  const [taxResult, setTaxResult] = useState<any>(null);

  // EMI state
  const [principal, setPrincipal] = useState<string>('1000000');
  const [rate, setRate] = useState<string>('9');
  const [months, setMonths] = useState<string>('60');
  const [emiResult, setEmiResult] = useState<any>(null);

  const [apiCall, setApiCall] = useState<ApiCallDetails | null>(null);

  // Fetch Income Tax
  useEffect(() => {
    if (calcType !== 'tax') return;
    let isCurrent = true;
    const num = parseFloat(income);
    if (isNaN(num) || num < 0) return;

    const fetchTax = async () => {
      const url = `${baseUrl}/v1/finance/income-tax?income=${num}&employment_income=${num}&taxpayer=${taxpayer}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setTaxResult(json.data);
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/finance/income-tax?income=${num}&taxpayer=${taxpayer}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: `Income Tax (Finance Act 2026 - ${taxpayer})`,
          });
        }
      } catch (err) {
        console.error('Failed to calculate tax', err);
      }
    };

    const timer = setTimeout(fetchTax, 250);
    return () => {
      clearTimeout(timer);
      isCurrent = false;
    };
  }, [baseUrl, income, taxpayer, calcType]);

  // Fetch EMI
  useEffect(() => {
    if (calcType !== 'emi') return;
    let isCurrent = true;
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const m = parseInt(months, 10);
    if (isNaN(p) || isNaN(r) || isNaN(m)) return;

    const fetchEmi = async () => {
      const url = `${baseUrl}/v1/finance/emi?principal=${p}&rate=${r}&months=${m}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setEmiResult(json.data);
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/finance/emi?principal=${p}&rate=${r}&months=${m}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: 'Bank Loan EMI Calculator',
          });
        }
      } catch (err) {
        console.error('Failed to calculate EMI', err);
      }
    };

    const timer = setTimeout(fetchEmi, 250);
    return () => {
      clearTimeout(timer);
      isCurrent = false;
    };
  }, [baseUrl, principal, rate, months, calcType]);

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="portal-icon-badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            <Calculator size={18} />
          </div>
          <div>
            <h3 className="portal-card-title">Finance & Tax Calculator</h3>
            <p className="portal-card-sub">অর্থ আইন ২০২৬ অনুযায়ী ব্যক্তিশ্রেণীর আয়কর ও ব্যাংক লোন ইএমআই</p>
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
          className={`portal-tab-pill ${calcType === 'tax' ? 'active' : ''}`}
          onClick={() => setCalcType('tax')}
        >
          Income Tax (আয়কর ২০২৬)
        </button>
        <button
          className={`portal-tab-pill ${calcType === 'emi' ? 'active' : ''}`}
          onClick={() => setCalcType('emi')}
        >
          Bank Loan EMI (লোন কিস্তি)
        </button>
      </div>

      {calcType === 'tax' ? (
        <div className="finance-calc-body">
          <div className="finance-inputs-grid">
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Annual Gross Income (বার্ষিক মোট আয় BDT):
              </label>
              <input
                type="number"
                className="portal-input"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="e.g. 1200000"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Taxpayer Category (করদাতার শ্রেণী):
              </label>
              <select
                className="portal-select"
                value={taxpayer}
                onChange={(e) => setTaxpayer(e.target.value)}
              >
                <option value="general">সাধারণ করদাতা (পুরুষ / General - ৳3,50,000)</option>
                <option value="female">মহিলা ও ৬৫+ জ্যেষ্ঠ নাগরিক (৳4,00,000)</option>
                <option value="disabled">প্রতিবন্ধী ব্যক্তি (৳4,75,000)</option>
                <option value="gazetted_freedom_fighter">গেজেটভুক্ত মুক্তিযোদ্ধা (৳5,00,000)</option>
              </select>
            </div>
          </div>

          {taxResult && (
            <div className="finance-result-grid">
              <div className="stat-card" style={{ borderLeft: '4px solid var(--crimson)' }}>
                <div className="stat-label">বার্ষিক প্রদেয় কর (Net Tax Payable)</div>
                <div className="stat-value" style={{ color: 'var(--crimson)' }}>
                  ৳{taxResult.net_tax_payable?.toLocaleString() ?? 0}
                </div>
                <div className="stat-subtext">করবর্ষ: {taxResult.tax_year || '2026-2027'}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">মাসিক কর্তনযোগ্য কর (Monthly TDS)</div>
                <div className="stat-value">
                  ৳{Math.round((taxResult.net_tax_payable ?? 0) / 12).toLocaleString()}
                </div>
                <div className="stat-subtext">প্রতি মাসের বেতন থেকে কর্তন</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">করমুক্ত আয়ের সীমা (Exemption Ceiling)</div>
                <div className="stat-value" style={{ color: 'var(--emerald)' }}>
                  ৳{taxResult.tax_free_ceiling?.toLocaleString() ?? '3,50,000'}
                </div>
                <div className="stat-subtext">প্রযোজ্য সর্বনিম্ন কর: ৳৫,০০০ (ঢাকা/চট্টগ্রাম)</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="finance-calc-body">
          <div className="finance-inputs-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Loan Principal (মূল ঋণ BDT):
              </label>
              <input
                type="number"
                className="portal-input"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Interest Rate (বার্ষিক সুদ %):
              </label>
              <input
                type="number"
                className="portal-input"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Tenure (মেয়াদ মাস):
              </label>
              <input
                type="number"
                className="portal-input"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
              />
            </div>
          </div>

          {emiResult && (
            <div className="finance-result-grid">
              <div className="stat-card" style={{ borderLeft: '4px solid var(--emerald)' }}>
                <div className="stat-label">মাসিক কিস্তি (Monthly EMI)</div>
                <div className="stat-value" style={{ color: 'var(--emerald)' }}>
                  ৳{emiResult.emi?.toLocaleString() ?? 0}
                </div>
                <div className="stat-subtext">প্রতি মাসের প্রদেয় কিস্তি</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">মোট প্রদেয় সুদ (Total Interest)</div>
                <div className="stat-value">
                  ৳{emiResult.total_interest?.toLocaleString() ?? 0}
                </div>
                <div className="stat-subtext">সুদ হার: {rate}%</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">মোট প্রদেয় অর্থ (Total Payment)</div>
                <div className="stat-value">
                  ৳{emiResult.total_payable?.toLocaleString() ?? 0}
                </div>
                <div className="stat-subtext">আসল + সুদ সহ</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="portal-footer-note">
        <span>সূত্র: অর্থ আইন ২০২৬ (Finance Act 2026) ও আয়কর আইন ২০২৩ · বাংলাদেশ ব্যাংকের স্ট্যান্ডার্ড অ্যামোর্টাইজেশন</span>
      </div>
    </div>
  );
};

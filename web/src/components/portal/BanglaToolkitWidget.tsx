import React, { useState, useEffect } from 'react';
import { Languages, Copy, Check, Sparkles, Calendar } from 'lucide-react';
import type { ApiCallDetails } from '../ApiInspectorModal';

interface BanglaToolkitWidgetProps {
  baseUrl: string;
  onInspectApi: (details: ApiCallDetails) => void;
}

export const BanglaToolkitWidget: React.FC<BanglaToolkitWidgetProps> = ({
  baseUrl,
  onInspectApi,
}) => {
  const [activeTab, setActiveTab] = useState<'taka' | 'avro' | 'date'>('taka');
  const [amountInput, setAmountInput] = useState<string>('125450.50');
  const [takaWords, setTakaWords] = useState<string>('');
  const [phoneticInput, setPhoneticInput] = useState<string>('ami banglay gaan gai');
  const [avroOutput, setAvroOutput] = useState<string>('');
  const [banglaDate, setBanglaDate] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [apiCall, setApiCall] = useState<ApiCallDetails | null>(null);

  // Taka in words converter
  useEffect(() => {
    let isCurrent = true;
    const fetchTaka = async () => {
      if (!amountInput.trim()) return;
      const url = `${baseUrl}/v1/bangla/taka-in-words?amount=${encodeURIComponent(amountInput)}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setTakaWords(json.data?.words || '');
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/bangla/taka-in-words?amount=${amountInput}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: 'Bangla Taka in Words Converter',
          });
        }
      } catch (err) {
        console.error('Failed to convert taka in words', err);
      }
    };

    const timer = setTimeout(fetchTaka, 200);
    return () => {
      clearTimeout(timer);
      isCurrent = false;
    };
  }, [baseUrl, amountInput]);

  // Avro phonetic transliteration
  useEffect(() => {
    let isCurrent = true;
    const fetchAvro = async () => {
      if (!phoneticInput.trim()) return;
      const url = `${baseUrl}/v1/bangla/transliterate?text=${encodeURIComponent(phoneticInput)}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - t0);
        if (isCurrent && json.success) {
          setAvroOutput(json.data?.unicode || json.data?.converted || '');
          setApiCall({
            method: 'GET',
            url,
            path: `/v1/bangla/transliterate?text=${phoneticInput}`,
            status: res.status,
            durationMs: duration,
            data: json,
            title: 'Avro Phonetic Transliteration',
          });
        }
      } catch (err) {
        console.error('Failed to transliterate', err);
      }
    };

    const timer = setTimeout(fetchAvro, 200);
    return () => {
      clearTimeout(timer);
      isCurrent = false;
    };
  }, [baseUrl, phoneticInput]);

  // Bangla Date
  useEffect(() => {
    let isCurrent = true;
    const fetchDate = async () => {
      const url = `${baseUrl}/v1/bangla/date`;
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (isCurrent && json.success) {
          setBanglaDate(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch bangla date', err);
      }
    };
    fetchDate();
    return () => {
      isCurrent = false;
    };
  }, [baseUrl]);

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="portal-card">
      <div className="portal-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="portal-icon-badge" style={{ background: '#fce7f3', color: '#be185d' }}>
            <Languages size={18} />
          </div>
          <div>
            <h3 className="portal-card-title">Bangla Toolkit & Linguistic Utilities</h3>
            <p className="portal-card-sub">টাকা কথায় রূপান্তর, অভ্র ফোনেটিক টাইপিং ও বঙ্গাব্দ পঞ্জিকা</p>
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

      {/* Tabs */}
      <div className="portal-tabs-pills">
        <button
          className={`portal-tab-pill ${activeTab === 'taka' ? 'active' : ''}`}
          onClick={() => setActiveTab('taka')}
        >
          Taka in Words (টাকা কথায়)
        </button>
        <button
          className={`portal-tab-pill ${activeTab === 'avro' ? 'active' : ''}`}
          onClick={() => setActiveTab('avro')}
        >
          Avro Phonetic (অভ্র টাইপিং)
        </button>
        <button
          className={`portal-tab-pill ${activeTab === 'date' ? 'active' : ''}`}
          onClick={() => setActiveTab('date')}
        >
          Bangla Calendar (বঙ্গাব্দ)
        </button>
      </div>

      {activeTab === 'taka' && (
        <div className="toolkit-content">
          <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
            Enter Numeric Amount (সংখ্যা বা টাকা লিখুন):
          </label>
          <input
            type="text"
            className="portal-input"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="e.g. 125450.50 or ১২৫৪৫০.৫০"
          />

          {takaWords && (
            <div className="toolkit-result-box">
              <div>
                <span className="toolkit-result-label">টাকা কথায় (Formal Words):</span>
                <p className="toolkit-result-text">{takaWords}</p>
              </div>
              <button
                onClick={() => copyResult(takaWords)}
                className="btn"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                {copied ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'avro' && (
        <div className="toolkit-content">
          <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
            Type English Phonetic (ইংরেজি ফোনেটিক লিখুন):
          </label>
          <input
            type="text"
            className="portal-input"
            value={phoneticInput}
            onChange={(e) => setPhoneticInput(e.target.value)}
            placeholder="e.g. ami banglay gaan gai"
          />

          {avroOutput && (
            <div className="toolkit-result-box">
              <div>
                <span className="toolkit-result-label">ইউনিকোড বাংলা (Unicode Output):</span>
                <p className="toolkit-result-text" style={{ fontSize: 18 }}>{avroOutput}</p>
              </div>
              <button
                onClick={() => copyResult(avroOutput)}
                className="btn"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                {copied ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'date' && banglaDate && (
        <div className="toolkit-content">
          <div className="bangla-date-display">
            <Calendar size={28} style={{ color: 'var(--crimson)' }} />
            <div>
              <div className="date-bn-big">
                {banglaDate.day_bn} {banglaDate.month?.name_bn} {banglaDate.year_bn} বঙ্গাব্দ
              </div>
              <div className="date-bn-sub">
                ঋতু: {banglaDate.season?.name_bn} · গ্রেগরিয়ান: {banglaDate.gregorian_date}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="portal-footer-note">
        <span>বাংলা একাডেমি প্রমিত বানান ও সংশোধিত পঞ্জিকা নির্দেশিকা অনুযায়ী প্রস্তুত</span>
      </div>
    </div>
  );
};

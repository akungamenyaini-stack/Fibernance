import React, { useState, useEffect, useRef } from 'react';
import { useAccounts } from '../api/accounts';

// SKU options
const SKU_PRODUCTS = [
  { sku: 'WDP_BR', label: 'Weekly Diamond Pass - Brazil' },
  { sku: 'WDP_TR', label: 'Weekly Diamond Pass - Turkey' },
  { sku: 'ML_86', label: '86 Diamonds' },
];

// Type definitions
interface WDPPrices {
  brazil: number | null;
  turkey: number | null;
  min: number | null;
  cached: boolean;
  cache_age: number;
  error?: string;
}

interface BalanceData {
  saldo: string;
  saldo_formatted: string;
  timestamp: string;
  status: string;
}

// WDP Price Card Component
const WDPPriceCard: React.FC<{ 
  prices: WDPPrices | null; 
  isLoading: boolean;
  wdpBrCost: number | null;
  wdpTrCost: number | null;
  onCostChange?: (type: 'br' | 'tr', value: number) => void;
  onSaveCost?: (type: string, cost: number) => Promise<void>;
  onRefresh?: () => void;
  isSaving?: boolean;
}> = ({ prices, isLoading, wdpBrCost, wdpTrCost, onCostChange, onSaveCost, onRefresh, isSaving }) => {
  const [isEditingBr, setIsEditingBr] = useState(false);
  const [isEditingTr, setIsEditingTr] = useState(false);
  const [tempBrCost, setTempBrCost] = useState(String(wdpBrCost || ''));
  const [tempTrCost, setTempTrCost] = useState(String(wdpTrCost || ''));

  const formatRupiah = (value: number | null): string => {
    if (value === null || value === undefined) return 'N/A';
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const calculateMargin = (cost: number, market: number | null): string => {
    if (market === null || cost === 0) return '-';
    const margin = ((market - cost) / cost * 100).toFixed(1);
    return `${margin}%`;
  };

  const handleSaveBrCost = async () => {
    const newCost = parseInt(tempBrCost, 10);
    if (!isNaN(newCost) && newCost >= 0) {
      try {
        // Save to backend if function provided
        if (onSaveCost) {
          await onSaveCost('WDP_BR', newCost);
        }
        // Update state
        if (onCostChange) {
          onCostChange('br', newCost);
        }
        setIsEditingBr(false);
      } catch (error) {
        console.error('Error saving cost:', error);
      }
    } else {
      alert('Invalid cost value');
      setTempBrCost(String(wdpBrCost || ''));
    }
  };

  const handleSaveTrCost = async () => {
    const newCost = parseInt(tempTrCost, 10);
    if (!isNaN(newCost) && newCost >= 0) {
      try {
        // Save to backend if function provided
        if (onSaveCost) {
          await onSaveCost('WDP_TR', newCost);
        }
        // Update state
        if (onCostChange) {
          onCostChange('tr', newCost);
        }
        setIsEditingTr(false);
      } catch (error) {
        console.error('Error saving cost:', error);
      }
    } else {
      alert('Invalid cost value');
      setTempTrCost(String(wdpTrCost || ''));
    }
  };

  return (
    <div className="mt-8 pt-8 pb-8 border-t border-gray-200">
      {/* Title */}
      <p className="text-xs font-semibold text-gray-600 font-sans uppercase tracking-wide mb-4">
        📊 Info Harga WDP Termurah
      </p>

      {isLoading ? (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="animate-spin">⏳</div>
              <p className="text-sm text-gray-600 font-sans">Loading prices... (auto-refresh setiap 10 menit)</p>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 Refresh
              </button>
            )}
          </div>
        </div>
      ) : prices && prices.error ? (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-300 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red-800 font-sans">Gagal Mengambil Data Harga</p>
                <p className="text-xs text-red-600 font-sans mt-1">{prices.error}</p>
                <p className="text-xs text-red-500 font-sans mt-1 italic">Status: TIDAK TERSEDIA (grayed out)</p>
              </div>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-2"
              >
                🔄 Retry
              </button>
            )}
          </div>
        </div>
      ) : prices ? (
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200 shadow-sm">
          {/* Brazil WDP Row */}
          <div className="flex justify-between items-center py-3 border-b border-purple-200/50">
            <div>
              <p className="text-sm font-semibold text-gray-800 font-sans">Termurah Brazil (Pasaran)</p>
              <p className="text-xs text-gray-600 font-sans mt-1">Harga publik terendah</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-blue-700 font-serif">
                {prices.brazil ? `Rp ${prices.brazil.toLocaleString('id-ID')}` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Turkey WDP Row */}
          <div className="flex justify-between items-center py-3 border-b border-purple-200/50">
            <div>
              <p className="text-sm font-semibold text-gray-800 font-sans">Termurah Turkey (Pasaran)</p>
              <p className="text-xs text-gray-600 font-sans mt-1">Harga publik terendah</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-purple-700 font-serif">
                {prices.turkey ? `Rp ${prices.turkey.toLocaleString('id-ID')}` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Cost Brazil Row */}
          <div className="flex justify-between items-center py-3 border-b border-purple-200/50">
            <div>
              <p className="text-sm font-semibold text-gray-800 font-sans">Harga Modal WDP_BR</p>
              <p className="text-xs text-gray-600 font-sans mt-1">
                Margin: {prices.brazil && wdpBrCost ? `${(((prices.brazil - wdpBrCost) / wdpBrCost * 100).toFixed(1))}%` : (wdpBrCost ? '-' : '(belum diset)')}
              </p>
            </div>
            <div className="text-right">
              {isEditingBr ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={tempBrCost}
                    onChange={(e) => setTempBrCost(e.target.value)}
                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <button
                    onClick={handleSaveBrCost}
                    disabled={isSaving}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingBr(false);
                      setTempBrCost(String(wdpBrCost || ''));
                    }}
                    className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingBr(true)}
                  className="text-lg font-semibold text-indigo-700 font-serif hover:text-indigo-800 cursor-pointer"
                  title="Click to edit"
                >
                  {wdpBrCost ? `Rp ${wdpBrCost.toLocaleString('id-ID')}` : '⚠️ N/A'}
                </button>
              )}
            </div>
          </div>

          {/* Cost Turkey Row */}
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800 font-sans">Harga Modal WDP_TR</p>
              <p className="text-xs text-gray-600 font-sans mt-1">
                Margin: {prices.turkey && wdpTrCost ? `${(((prices.turkey - wdpTrCost) / wdpTrCost * 100).toFixed(1))}%` : (wdpTrCost ? '-' : '(belum diset)')}
              </p>
            </div>
            <div className="text-right">
              {isEditingTr ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={tempTrCost}
                    onChange={(e) => setTempTrCost(e.target.value)}
                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <button
                    onClick={handleSaveTrCost}
                    disabled={isSaving}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTr(false);
                      setTempTrCost(String(wdpTrCost || ''));
                    }}
                    className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingTr(true)}
                  className="text-lg font-semibold text-indigo-700 font-serif hover:text-indigo-800 cursor-pointer"
                  title="Click to edit"
                >
                  {wdpTrCost ? `Rp ${wdpTrCost.toLocaleString('id-ID')}` : '⚠️ N/A'}
                </button>
              )}
            </div>
          </div>

          {/* Cache Info & Refresh Button */}
          <div className="mt-3 pt-3 border-t border-purple-200/50 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-sans">
              {prices.cached ? `✓ Cached ${prices.cache_age}s ago (next: ~10min)` : '✓ Fresh data'}
            </p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 Refresh
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-300">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red-800 font-sans">Tidak Dapat Mengambil Data Harga</p>
                <p className="text-xs text-red-600 font-sans mt-1">Silakan coba refresh</p>
              </div>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-2"
              >
                🔄 Retry
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


const Digiflazz: React.FC = () => {
  const { data: accounts, isLoading } = useAccounts();
  const [activeTab, setActiveTab] = useState<'regular' | 'lunasi'>('regular');
  const [wdpPrices, setWdpPrices] = useState<WDPPrices | null>(null);
  const [wdpLoading, setWdpLoading] = useState(true);
  
  // Balance state
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  
  // Cost prices state (null means not loaded/not set)
  const [wdpBrCost, setWdpBrCost] = useState<number | null>(null);
  const [wdpTrCost, setWdpTrCost] = useState<number | null>(null);
  const [costPricesLoading, setCostPricesLoading] = useState(true);
  const [costPricesSaving, setCostPricesSaving] = useState(false);
  
  // Polling intervals (useRef to persist across re-renders)
  const wdpPriceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const balanceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ====== FETCH FUNCTIONS ======
  
  // Fetch WDP prices (Public API - every 10 minutes)
  const fetchWDPPrices = async () => {
    try {
      const response = await fetch('/api/digiflazz/wdp-cheapest');
      const data = await response.json();
      setWdpPrices(data);
      setWdpLoading(false);
    } catch (error) {
      console.error('❌ Failed to fetch WDP prices:', error);
      setWdpPrices({
        brazil: null,
        turkey: null,
        min: null,
        cached: false,
        cache_age: 0,
        error: 'Failed to fetch market prices',
      });
      setWdpLoading(false);
    }
  };

  // Fetch balance (Official API - every 5 minutes)
  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/digiflazz/balance');
      const data = await response.json();
      setBalance(data);
      setBalanceLoading(false);
    } catch (error) {
      console.error('❌ Failed to fetch balance:', error);
      setBalance(null);
      setBalanceLoading(false);
    }
  };

  // Fetch cost prices from Digiflazz API (modal prices from account)
  const fetchCostPrices = async () => {
    try {
      setCostPricesLoading(true);
      
      // Try to fetch from Digiflazz first (actual prices from account)
      const response = await fetch('/api/digiflazz/wdp-modal');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // data format: { wdp_br: 85000, wdp_tr: 90000, timestamp: "...", from_cache: true/false }
      setWdpBrCost(data.wdp_br || null);
      setWdpTrCost(data.wdp_tr || null);
      
      const cacheStatus = data.from_cache ? '(cached)' : '(fresh)';
      console.log(`✅ Modal prices loaded from Digiflazz ${cacheStatus}:`, { 
        WDP_BR: data.wdp_br, 
        WDP_TR: data.wdp_tr 
      });
      setCostPricesLoading(false);
      return;
    } catch (digiflazzError) {
      console.warn('⚠️  Digiflazz API error, trying database fallback:', digiflazzError);
      
      // Fallback: Try to fetch from database
      try {
        const response = await fetch('/api/digiflazz/cost-prices');
        const data = await response.json();
        
        // Map response to state variables
        // data is array: [{ type: "WDP_BR", cost_price: 85000 }, { type: "WDP_TR", cost_price: 90000 }]
        const brPrice = data.find((p: any) => p.type === 'WDP_BR');
        const trPrice = data.find((p: any) => p.type === 'WDP_TR');
        
        setWdpBrCost(brPrice?.cost_price || null);
        setWdpTrCost(trPrice?.cost_price || null);
        
        console.log('✅ Modal prices loaded from database (fallback):', { 
          WDP_BR: brPrice?.cost_price, 
          WDP_TR: trPrice?.cost_price 
        });
      } catch (dbError) {
        console.error('❌ Both Digiflazz API and database fetch failed:', dbError);
        setWdpBrCost(null);
        setWdpTrCost(null);
      }
      
      setCostPricesLoading(false);
    }
  };

  // Save cost price to database
  const saveCostPrice = async (type: string, costPrice: number) => {
    try {
      setCostPricesSaving(true);
      const response = await fetch(`/api/digiflazz/cost-prices/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cost_price: costPrice }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save ${type} cost price`);
      }
      
      const saved = await response.json();
      console.log(`✅ ${type} cost price saved: Rp ${saved.cost_price}`);
      setCostPricesSaving(false);
      return saved;
    } catch (error) {
      console.error(`❌ Failed to save ${type} cost price:`, error);
      setCostPricesSaving(false);
      alert(`Gagal menyimpan harga modal ${type}: ${error}`);
      throw error;
    }
  };

  // Setup polling intervals on component mount
  useEffect(() => {
    // Fetch immediately on mount
    fetchWDPPrices();
    fetchBalance();
    fetchCostPrices();  // Fetch modal prices from Digiflazz on mount

    // Setup WDP Prices polling (every 10 minutes = 600,000 ms)
    wdpPriceIntervalRef.current = setInterval(() => {
      console.log('🔄 WDP Prices polling... (10-min interval)');
      fetchWDPPrices();
    }, 600000);

    // Setup Balance polling (every 5 minutes = 300,000 ms)
    balanceIntervalRef.current = setInterval(() => {
      console.log('🔄 Balance polling... (5-min interval)');
      fetchBalance();
    }, 300000);

    // Setup Cost Prices polling (every 10 minutes = 600,000 ms, synced with Digiflazz 5-min cache)
    const costPriceIntervalRef = setInterval(() => {
      console.log('🔄 Modal prices polling... (10-min interval)');
      fetchCostPrices();
    }, 600000);

    // Cleanup intervals on component unmount
    return () => {
      if (wdpPriceIntervalRef.current) {
        clearInterval(wdpPriceIntervalRef.current);
        console.log('🛑 Cleared WDP prices interval');
      }
      if (balanceIntervalRef.current) {
        clearInterval(balanceIntervalRef.current);
        console.log('🛑 Cleared balance interval');
      }
      if (costPriceIntervalRef) {
        clearInterval(costPriceIntervalRef);
        console.log('🛑 Cleared modal prices interval');
      }
    };
  }, []);

  const handleCostChange = (type: 'br' | 'tr', value: number) => {
    if (type === 'br') {
      setWdpBrCost(value);
    } else {
      setWdpTrCost(value);
    }
  };

  // Manual refresh handlers
  const handleRefreshWDPPrices = async () => {
    setWdpLoading(true);
    await fetchWDPPrices();
  };

  const handleRefreshBalance = async () => {
    setBalanceLoading(true);
    await fetchBalance();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-12">
        <h1 className="text-4xl font-serif font-semibold text-black">
          Digiflazz
        </h1>
        <p className="mt-2 text-sm text-gray-600 font-sans">
          Restock management and Digiflazz transactions
        </p>

        {/* Balance Info */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-600 font-sans uppercase tracking-wide">
              💰 Available Balance
            </p>
            <button
              onClick={handleRefreshBalance}
              disabled={balanceLoading}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Manual refresh (auto-refresh setiap 5 menit)"
            >
              🔄
            </button>
          </div>
          {balanceLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          ) : balance ? (
            <>
              <p className="text-4xl font-serif font-semibold text-black">
                {balance.saldo_formatted || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 font-sans mt-2">
                Last updated: {new Date(balance.timestamp).toLocaleString('id-ID')} (auto-refresh ~5min)
              </p>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-300 rounded">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-red-800 font-sans">Saldo tidak tersedia</p>
                  <p className="text-xs text-red-600 font-sans mt-1">Gagal mengambil data saldo dari Digiflazz</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* WDP Price Info Card */}
        <WDPPriceCard 
          prices={wdpPrices} 
          isLoading={wdpLoading}
          wdpBrCost={wdpBrCost}
          wdpTrCost={wdpTrCost}
          onCostChange={handleCostChange}
          onSaveCost={saveCostPrice}
          onRefresh={handleRefreshWDPPrices}
          isSaving={costPricesSaving}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('regular')}
          className={`flex-1 px-8 py-4 text-sm font-sans font-semibold transition-all ${
            activeTab === 'regular'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Topup Regular
        </button>
        <button
          onClick={() => setActiveTab('lunasi')}
          className={`flex-1 px-8 py-4 text-sm font-sans font-semibold transition-all ${
            activeTab === 'lunasi'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Lunasi Hutang
        </button>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-300px)]">
        {/* Left Column - Topup Regular */}
        {activeTab === 'regular' && (
          <div className="flex-1 border-r border-gray-200 overflow-y-auto p-8">
            <TopupRegularForm accounts={accounts} isLoading={isLoading} />
          </div>
        )}

        {/* Right Column - Lunasi Hutang */}
        {activeTab === 'lunasi' && (
          <div className="flex-1 overflow-y-auto p-8">
            <LunasiHutangForm accounts={accounts} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
};

interface FormProps {
  accounts: any[] | undefined;
  isLoading: boolean;
}

const TopupRegularForm: React.FC<FormProps> = ({ accounts, isLoading }) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccountId || !selectedSku) {
      alert('Please select an account and an SKU product');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to submit topup
      // mutation payload should include: account_id, sku, type: 'REGULAR'
      alert('✅ Topup regular submitted! (Mock)');
      setSelectedAccountId('');
      setSelectedSku('');
    } catch (error) {
      alert('❌ Error submitting topup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif font-semibold text-black mb-8">
        Topup Regular
      </h2>

      {isLoading ? (
        <p className="text-sm text-gray-600 font-sans">Loading accounts...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Account Selection */}
          <div>
            <label className="text-xs font-semibold text-charcoal font-sans uppercase tracking-wide mb-2 block">
              Pilih Akun Gudang
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-transparent text-base text-black font-sans py-2 border-b border-gray-300 focus:border-black focus:outline-none transition-colors"
            >
              <option value="">Select an account</option>
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.game_id}) - Stock: {acc.real_diamond}
                </option>
              ))}
            </select>
          </div>

          {/* SKU Product Selection */}
          <div>
            <label className="text-xs font-semibold text-charcoal font-sans uppercase tracking-wide mb-2 block">
              Pilih SKU Produk
            </label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full bg-transparent text-base text-black font-sans py-2 border-b border-gray-300 focus:border-black focus:outline-none transition-colors"
            >
              <option value="">Select a product</option>
              {SKU_PRODUCTS.map((product) => (
                <option key={product.sku} value={product.sku}>
                  {product.sku} - {product.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 font-sans mt-2">
              Example: WDP_BR, WDP_TR, ML_86
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-8 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || !selectedAccountId || !selectedSku}
              className="w-full bg-black text-white font-sans font-semibold py-3 rounded-none transition-all duration-200 hover:bg-charcoal active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'PROCESSING...' : 'TOPUP REGULAR'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const LunasiHutangForm: React.FC<FormProps> = ({ accounts, isLoading }) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter only accounts with pending_wdp > 0
  const accountsWithDebt = accounts?.filter((acc) => acc.pending_wdp > 0) ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccountId || !selectedSku) {
      alert('Please select an account with debt and an SKU product');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to submit lunasi
      // mutation payload should include: account_id, sku, type: 'LUNASI'
      alert('✅ Lunasi hutang submitted! (Mock)');
      setSelectedAccountId('');
      setSelectedSku('');
    } catch (error) {
      alert('❌ Error submitting lunasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif font-semibold text-black mb-8">
        Lunasi Hutang
      </h2>

      {isLoading ? (
        <p className="text-sm text-gray-600 font-sans">Loading accounts...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Account Selection */}
          <div>
            <label className="text-xs font-semibold text-charcoal font-sans uppercase tracking-wide mb-2 block">
              Pilih Akun dengan Hutang
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-transparent text-base text-black font-sans py-2 border-b border-gray-300 focus:border-black focus:outline-none transition-colors"
            >
              <option value="">Select an account</option>
              {accountsWithDebt?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.game_id}) - Debt: {Math.ceil(acc.pending_wdp / 100)} days
                </option>
              ))}
            </select>
            {accountsWithDebt.length === 0 && (
              <p className="text-xs text-gray-500 font-sans mt-2">
                No accounts with debt available
              </p>
            )}
          </div>

          {/* SKU Product Selection */}
          <div>
            <label className="text-xs font-semibold text-charcoal font-sans uppercase tracking-wide mb-2 block">
              Pilih SKU Produk
            </label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full bg-transparent text-base text-black font-sans py-2 border-b border-gray-300 focus:border-black focus:outline-none transition-colors"
            >
              <option value="">Select a product</option>
              {SKU_PRODUCTS.map((product) => (
                <option key={product.sku} value={product.sku}>
                  {product.sku} - {product.label}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-none">
            <p className="text-xs text-gray-700 font-sans">
              <span className="font-semibold">Catatan:</span> Diamond akan dikurangi ke
              pending_wdp terlebih dahulu, sisanya masuk ke stock.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-8 border-t border-gray-200">
            <button
              type="submit"
              disabled={
                isSubmitting || !selectedAccountId || !selectedSku || accountsWithDebt.length === 0
              }
              className="w-full bg-black text-white font-sans font-semibold py-3 rounded-none transition-all duration-200 hover:bg-charcoal active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'PROCESSING...' : 'LUNASI HUTANG'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Digiflazz;

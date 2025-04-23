"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { createClient } from '@supabase/supabase-js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from "recharts";
import { useVolatility } from "@/hooks/useVolatility";

interface GroupedRVIData {
  timestamp: number;
  totalRVI?: number;
  categoryRVIs: Record<string, number>;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function MarketPage() {
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [leverage, setLeverage] = useState<number>(1);
  const [customLeverage, setCustomLeverage] = useState<string>("1.0");
  const [collateral, setCollateral] = useState<number | null>(null);
  const [takeProfit, setTakeProfit] = useState<number | null>(null);
  const [stopLoss, setStopLoss] = useState<number | null>(null);
  const [latestData, setLatestData] = useState<{ totalRVI: number; categoryRVIs: Record<string, number> } | null>(null);
  const [history, setHistory] = useState<GroupedRVIData[]>([]);
  const [timeRange, setTimeRange] = useState<number>(24);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxTimestamp, setMaxTimestamp] = useState<number | null>(null);

  // Memoize primary score calculation
  const primaryScore = useMemo(() => {
    if (!latestData) return null;
    return activeCategory 
      ? latestData.categoryRVIs[activeCategory] 
      : latestData.totalRVI;
  }, [latestData, activeCategory]);

  // Memoize the title based on activeCategory
  const primaryTitle = useMemo(() => {
    return activeCategory ?? "Reality Volatility Index";
  }, [activeCategory]);

  // Use the volatility hook for accurate volatility calculation
  const annualizedVolatility = useVolatility({
    history,
    activeCategory,
    primaryScore
  });
  
  // Memoize derived values based on inputs
  const contractAmount = useMemo(() => {
    if (!collateral || !primaryScore) return 0;
    return (collateral * leverage) / primaryScore;
  }, [collateral, leverage, primaryScore]);

  const estimatedPositionSize = useMemo(() => {
    return (contractAmount * (primaryScore || 0)).toFixed(2);
  }, [contractAmount, primaryScore]);

  const tpPrice = useMemo(() => {
    if (!takeProfit || !primaryScore) return null;
    return (primaryScore * (1 + takeProfit / 100)).toFixed(2);
  }, [takeProfit, primaryScore]);

  const slPrice = useMemo(() => {
    if (!stopLoss || !primaryScore) return null;
    return (primaryScore * (1 - stopLoss / 100)).toFixed(2);
  }, [stopLoss, primaryScore]);

  const calculatedLiquidationPrice = useMemo(() => {
    if (!primaryScore) return "0.00";
    return (primaryScore - (primaryScore * 0.8) / leverage).toFixed(2);
  }, [primaryScore, leverage]);

  const liquidationPrice = useMemo(() => {
    return !stopLoss ? calculatedLiquidationPrice : null;
  }, [stopLoss, calculatedLiquidationPrice]);

  const isStopLossTooLow = useMemo(() => {
    if (!stopLoss || !slPrice || !calculatedLiquidationPrice) return false;
    return parseFloat(slPrice) <= parseFloat(calculatedLiquidationPrice);
  }, [stopLoss, slPrice, calculatedLiquidationPrice]);

  // Memoize handler functions to prevent recreation on each render
  const handleLeverageChange = useMemo(() => {
    return (value: number) => {
      setLeverage(value);
      setCustomLeverage(value.toFixed(1));
    };
  }, []);
  
  // Memoize formatCurrency function
  const formatCurrency = useMemo(() => {
    return (value: any) => {
      return value ? parseFloat(String(value)).toFixed(2) : "0.00";
    };
  }, []);
  
  // Memoize the process RVI data function
  const processRVIData = useMemo(() => {
    return (data: any[]): GroupedRVIData[] | null => {
      if (!data || data.length === 0) return null;
      
      // Group by timestamp
      const groupedByTimestamp: Record<number, GroupedRVIData> = {};
      data.forEach(row => {
        if (!groupedByTimestamp[row.timestamp]) {
          groupedByTimestamp[row.timestamp] = {
            timestamp: row.timestamp,
            categoryRVIs: {}
          };
        }
        
        if (row.category === 'Total') {
          groupedByTimestamp[row.timestamp].totalRVI = row.rvi;
        } else {
          groupedByTimestamp[row.timestamp].categoryRVIs[row.category] = row.rvi;
        }
      });
      
      // Convert to array and sort by timestamp
      return Object.values(groupedByTimestamp).sort((a, b) => a.timestamp - b.timestamp);
    };
  }, []);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch latest data
        const { data: latestTimestamp, error: timestampError } = await supabase
          .from('rvi_aggregate')
          .select('timestamp')
          .order('timestamp', { ascending: false })
          .limit(1);
        
        if (timestampError) throw new Error(`Error fetching latest timestamp: ${timestampError.message}`);
        if (!latestTimestamp || latestTimestamp.length === 0) throw new Error("No RVI data found");
        
        const { data: latestRows, error: latestError } = await supabase
          .from('rvi_aggregate')
          .select('*')
          .eq('timestamp', latestTimestamp[0].timestamp);
        
        if (latestError) throw new Error(`Error fetching latest RVI data: ${latestError.message}`);
        
        // Process latest data
        const totalRVI = latestRows.find(row => row.category === 'Total')?.rvi || 0;
        const categoryRVIs = Object.fromEntries(
          latestRows
            .filter(row => row.category !== 'Total')
            .map(row => [row.category, row.rvi])
        );
        
        setLatestData({ totalRVI, categoryRVIs });
        setMaxTimestamp(latestTimestamp[0].timestamp);
        
        // Fetch historical data
        const now = Math.floor(Date.now() / 1000);
        const historyTimeLimit = now - (timeRange * 60 * 60); // Convert hours to seconds (not days)
        
        const { data: historyRows, error: historyError } = await supabase
          .from('rvi_aggregate')
          .select('*')
          .gt('timestamp', historyTimeLimit)
          .order('timestamp', { ascending: true });
        
        if (historyError) throw new Error(`Error fetching historical data: ${historyError.message}`);
        
        // Process historical data
        const processedHistory = processRVIData(historyRows);
        if (processedHistory) setHistory(processedHistory);
        
      } catch (err) {
        console.error("Failed to load RVI data", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [timeRange, processRVIData]);

  // Polling for new data
  useEffect(() => {
    if (!maxTimestamp) return;
  
    const interval = setInterval(async () => {
      try {
        const { data: newRows, error } = await supabase
          .from('rvi_aggregate')
          .select('*')
          .gt('timestamp', maxTimestamp)
          .order('timestamp', { ascending: true });
  
        if (error) {
          console.error("Polling error:", error.message);
          return;
        }
  
        if (newRows.length > 0) {
          const processed = processRVIData(newRows);
          if (processed) {
            setHistory(prev => [...prev, ...processed]);
          }
  
          const maxNewTimestamp = Math.max(...newRows.map(r => r.timestamp));
          setMaxTimestamp(maxNewTimestamp);
  
          // Also update latestData if the newest snapshot is newer
          const latestSnapshot = newRows.filter(row => row.timestamp === maxNewTimestamp);
          const totalRVI = latestSnapshot.find(row => row.category === 'Total')?.rvi || 0;
          const categoryRVIs = Object.fromEntries(
            latestSnapshot
              .filter(row => row.category !== 'Total')
              .map(row => [row.category, row.rvi])
          );
          setLatestData({ totalRVI, categoryRVIs });
        }
      } catch (err) {
        console.error("Polling exception:", err);
      }
    }, 60000); // Poll every 60 seconds
  
    return () => clearInterval(interval);
  }, [maxTimestamp, processRVIData]);

  // Memoize chart data
  const chartData = useMemo(() => {
    if (!history.length) return [];
    
    const now = Date.now() / 1000;
    const rangeSeconds = timeRange * 60 * 60; // Hours to seconds
    return history
      .filter((entry) => now - entry.timestamp <= rangeSeconds)
      .map((entry) => {
        const date = new Date(entry.timestamp * 1000);
        
        // Format timestamp based on timeRange
        let formattedTime;
        if (timeRange <= 24) {
          // For timeRange <= 24 hours, include time with date in smaller format
          formattedTime = date.toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } else {
          // For timeRange > 24 hours, show date more prominently
          formattedTime = date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
          });
        }
        
        return {
          timestamp: formattedTime,
          value: activeCategory ? entry.categoryRVIs[activeCategory] : entry.totalRVI,
          raw: entry.timestamp // Add raw timestamp for sorting
        };
      })
      // Sort by timestamp to ensure chronological order
      .sort((a, b) => a.raw - b.raw);
  }, [history, timeRange, activeCategory]);

  // Memoize category buttons rendering
  const renderCategoryButtons = useMemo(() => {
    if (!latestData) return null;
    
    const entries = Object.entries(latestData.categoryRVIs);
    const sorted = entries.sort(([a], [b]) => a.localeCompare(b));
    const final = activeCategory ? [...sorted, ["Total RVI", latestData.totalRVI]] : sorted;
    
    return (
      <>
        {final.map(([category, rawScore]) => {
          const score = typeof rawScore === "number" ? rawScore : parseFloat(String(rawScore));
          return (
            <button
              key={category}
              className={`flex justify-between items-center border border-highlight rounded-md px-4 py-2 text-sm font-bold w-full hover:bg-highlight/10 transition-colors mb-1 ${
                activeCategory === category ? "text-neon" : "text-white"
              }`}
              onClick={() =>
                setActiveCategory(category === "Total RVI" ? null : String(category))
              }
            >
              <span>{category}</span>
              <span>{score.toFixed(2)}</span>
            </button>
          );
        })}
      </>
    );
  }, [latestData, activeCategory]);

  // Memoize time range buttons rendering
  const renderTimeRangeButtons = useMemo(() => {
    const ranges = [1, 2, 4, 6, 12, 24];
    return (
      <div className="mb-4 flex gap-2 justify-center">
        {ranges.map((h) => (
          <button
            key={h}
            className={`text-xs px-2 py-1 border rounded ${
              timeRange === h ? "bg-highlight text-black" : "border-highlight text-white"
            }`}
            onClick={() => setTimeRange(h)}
          >
            {h}h
          </button>
        ))}
      </div>
    );
  }, [timeRange]);

  // Memoize delta display
  const deltaDisplay = useMemo(() => {
    if (!history.length || !primaryScore) return null;
    
    const previous = activeCategory
      ? history[history.length - 2]?.categoryRVIs[activeCategory]
      : history[history.length - 2]?.totalRVI;

    if (!previous) return null;

    const delta = primaryScore - previous;
    const deltaPercent = ((delta / previous) * 100).toFixed(2);
    const isPositive = delta >= 0;

    return (
      <p className={`text-sm mt-2 font-mono transition-all duration-300 ease-in-out ${isPositive ? "text-green-400" : "text-red-400"}`}>
        {isPositive ? "▲" : "▼"} {delta.toFixed(2)} ({isPositive ? "↑" : "↓"} {deltaPercent}%)
      </p>
    );
  }, [history, primaryScore, activeCategory]);

  // Loading and error states
  if (loading) {
    return (
      <main className="min-h-screen bg-bg text-white p-4">
        <Navbar />
        <p className="text-center mt-10">Loading RVI data...</p>
      </main>
    );
  }
  
  if (error) {
    return (
      <main className="min-h-screen bg-bg text-white p-4">
        <Navbar />
        <p className="text-center mt-10 text-red-500">Error: {error}</p>
      </main>
    );
  }

  if (!latestData || history.length === 0) {
    return (
      <main className="min-h-screen bg-bg text-white p-4">
        <Navbar />
        <p className="text-center mt-10">No RVI data available</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-white p-4">
      <Navbar />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-8">
        <div className="border border-highlight rounded-2xl p-6 col-span-12 xl:col-span-3">
          <h2 className="text-lg font-bold text-neon">{primaryTitle}</h2>
          <p className="text-5xl font-mono text-neon">{primaryScore?.toFixed(2)}</p>
          {deltaDisplay}
          <button
            className="mt-4 text-sm text-neon underline"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {showBreakdown ? "▾ Hide category breakdown" : "▸ Show category breakdown"}
          </button>

          {showBreakdown && <div className="mt-4 space-y-1">{renderCategoryButtons}</div>}
        </div>

        <div className="border border-highlight bg-gray-950 rounded-2xl p-6 col-span-12 xl:col-span-7">
          <h3 className="text-md text-neon font-bold mb-2 text-center">
            {primaryTitle} – Last {timeRange}h
          </h3>
          {renderTimeRangeButtons}
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 10, fill: "#fff" }}
                interval="preserveStartEnd"
                minTickGap={15}
                height={50} />
              <YAxis 
                tick={{ fontSize: 12, fill: "#fff" }}
                domain={[
                  dataMin => {
                    const min = Math.min(
                      dataMin, 
                      slPrice ? parseFloat(slPrice) : Infinity, 
                      liquidationPrice ? parseFloat(liquidationPrice) : Infinity
                    );
                    return min * 0.9; // Add 10% padding below
                  },
                  dataMax => {
                    const max = Math.max(
                      dataMax, 
                      tpPrice ? parseFloat(tpPrice) : 0
                    );
                    return max * 1.1; // Add 10% padding above
                  }
                ]}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#111", borderColor: "#00FF88", color: "#fff" }}
                labelStyle={{ color: "#ccc" }}
                itemStyle={{ color: "#00FF88" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00FF88"
                strokeWidth={2}
                dot={false}
              />
              
              {tpPrice && (
                <ReferenceLine 
                  y={parseFloat(tpPrice)} 
                  stroke="#4CAF50" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: `TP: $${formatCurrency(tpPrice)}`, 
                    position: 'right',
                    fill: '#4CAF50',
                    fontSize: 12
                  }} 
                />
              )}

              {slPrice && (
                <ReferenceLine 
                  y={parseFloat(slPrice)} 
                  stroke="#FF5252" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: `SL: $${formatCurrency(slPrice)}`, 
                    position: 'right',
                    fill: '#FF5252',
                    fontSize: 12
                  }} 
                />
              )}

              {liquidationPrice && (
                <ReferenceLine 
                  y={parseFloat(liquidationPrice)} 
                  stroke="#FF9800" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: `Liq: $${formatCurrency(liquidationPrice)}`, 
                    position: 'right',
                    fill: '#FF9800',
                    fontSize: 12
                  }} 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-highlight rounded-2xl p-6 col-span-12 xl:col-span-2">
          <h3 className="text-lg font-bold text-neon">Trade</h3>

          <label className="text-sm font-mono text-white">
            Collateral ($)
            <input
              type="number"
              value={collateral ?? ""}
              onChange={(e) => setCollateral(parseFloat(e.target.value) || null)}
              className="mt-1 w-full px-2 py-1 bg-gray-800 border border-highlight rounded-md"
            />
          </label>

          <label className="text-sm font-mono text-white">
            Leverage
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const input = e.currentTarget.textContent?.replace(/[^\d.]/g, "") || "1";
                const parsed = parseFloat(input);
                if (!isNaN(parsed)) {
                  setLeverage(parsed);
                  setCustomLeverage(parsed.toFixed(1));
                }
              }}
              className="ml-2 inline-block min-w-[60px] text-center px-2 py-1 bg-gray-800 border border-highlight rounded-md"
            >
              {customLeverage}x
            </span>
            <input
              type="range"
              min="1"
              max="200"
              step="0.1"
              value={leverage}
              onChange={(e) => handleLeverageChange(parseFloat(e.target.value))}
              className="w-full mt-2 appearance-none bg-gray-700 h-2 rounded-lg"
            />
          </label>

          <label className="text-sm font-mono text-white">
            Take Profit (%)
            <input
              type="number"
              value={takeProfit ?? ""}
              onChange={(e) => setTakeProfit(parseFloat(e.target.value) || null)}
              className="mt-1 w-full px-2 py-1 bg-gray-800 border border-highlight rounded-md"
              placeholder="e.g. 20"
            />
          </label>

          <label className="text-sm font-mono text-white">
            Stop Loss (%)
            <input
              type="number"
              value={stopLoss ?? ""}
              onChange={(e) => setStopLoss(parseFloat(e.target.value) || null)}
              className="mt-1 w-full px-2 py-1 bg-gray-800 border border-highlight rounded-md"
              placeholder="e.g. 10"
            />
          </label>

          {isStopLossTooLow && (
              <div className="mt-2 py-1 px-2 bg-red-900/50 border border-red-500 rounded-md">
                <p className="text-xs text-red-400 font-bold">
                  ⚠️ Stop Loss lower than Liquidation Price!
                </p>
              </div>
            )}

          <p className="text-xs font-mono mt-2">
            Notional: <span className="text-white">${formatCurrency(estimatedPositionSize)}</span>
          </p>
          {tpPrice && (
            <p className="text-xs font-mono">
              Take Profit: <span className="text-green-400">${formatCurrency(tpPrice)}</span>
            </p>
          )}
          {slPrice && (
            <p className="text-xs font-mono">
              Stop Loss: <span className="text-red-400">${formatCurrency(slPrice)}</span>
            </p>
          )}
          {liquidationPrice && (
            <p className="text-xs font-mono">
              Liquidation: <span className="text-orange-400">${formatCurrency(liquidationPrice)}</span>
            </p>
          )}

          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl mt-4 w-full">
            Buy {primaryTitle}
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl mt-2 w-full">
            Sell {primaryTitle}
          </button>
        </div>
      </div>
    </main>
  );
}
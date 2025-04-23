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
import { useAutoStrike } from "@/hooks/useAutoStrike"; 
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

export default function OptionsPage() {
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [latestData, setLatestData] = useState<any | null>(null);
  const [history, setHistory] = useState<GroupedRVIData[]>([]);
  const [timeRange, setTimeRange] = useState<number>(24);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Options state
  const [optionType, setOptionType] = useState<string>("call");
  const [optionExpiry, setOptionExpiry] = useState<string>("7d");
  const [optionStrike, setOptionStrike] = useState<string | number | null>(null);
  const [optionAmount, setOptionAmount] = useState<number | null>(null);
  const [maxTimestamp, setMaxTimestamp] = useState<number | null>(null);

  // Use the autoStrike hook to automatically set the strike price
  useAutoStrike({
    latestData,
    activeCategory,
    setOptionStrike
  });

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

  // Memoize volatility percentage
  const volatilityPercent = useMemo(() => {
    return (annualizedVolatility * 100).toFixed(2);
  }, [annualizedVolatility]);

  // Memoize the formatCurrency function to prevent recreation
  const formatCurrency = useMemo(() => {
    return (value: any) => {
      return value ? parseFloat(String(value)).toFixed(2) : "0.00";
    };
  }, []);
  
  // Memoize the RVI data processor
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
  
  // Load data effect
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
        setMaxTimestamp(latestTimestamp[0].timestamp); // Track latest snapshot

        // Fetch historical data
        const now = Math.floor(Date.now() / 1000);
        const historyTimeRangeInSeconds = timeRange === 24 ? 86400 : // 1 day
                                         timeRange === 7 * 24 ? 604800 : // 7 days
                                         timeRange === 30 * 24 ? 2592000 : // 30 days
                                         timeRange * 3600; // hours to seconds
        
        const historyTimeLimit = now - historyTimeRangeInSeconds;
        
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

  // Polling effect for new data
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
    }, 60000); // 60s poll
  
    return () => clearInterval(interval);
  }, [maxTimestamp, processRVIData]);

  // Memoize the premium calculation
  const calculatePremium = useMemo(() => {
    return () => {
      if (!optionStrike || !primaryScore) return 0;
      
      const S = primaryScore; // Current price
      const K = parseFloat(String(optionStrike)); // Strike price
      
      // Get time to expiry in years
      let daysToExpiry;
      if (String(optionExpiry).includes('h')) {
        // Handle hour-based expiry
        const hours = parseInt(String(optionExpiry).match(/(\d+)h/)?.[1] || "24");
        daysToExpiry = hours / 24; // Convert hours to days
      } else {
        // Handle day-based expiry
        const daysMatch = String(optionExpiry).match(/(\d+)d/);
        daysToExpiry = daysMatch ? parseInt(daysMatch[1]) : 1;
      }
      
      // Convert days to years for Black-Scholes
      const T = daysToExpiry / 365;
      
      // Use our proper volatility calculation
      const sigma = annualizedVolatility;
      
      // Calculate option price
      const timeValue = S * sigma * Math.sqrt(T);
      let intrinsicValue = 0;
      
      if (optionType === "call") {
        intrinsicValue = Math.max(0, S - K);
      } else { // put
        intrinsicValue = Math.max(0, K - S);
      }
      
      return intrinsicValue + timeValue * 0.4;
    };
  }, [optionStrike, primaryScore, optionExpiry, optionType, annualizedVolatility]);

  // Memoize premium values
  const premiumPerContract = useMemo(() => calculatePremium(), [calculatePremium]);
  
  const formattedPremiumPerContract = useMemo(() => {
    return premiumPerContract.toFixed(2);
  }, [premiumPerContract]);
  
  const totalPremium = useMemo(() => {
    return optionAmount ? premiumPerContract * optionAmount : premiumPerContract;
  }, [optionAmount, premiumPerContract]);
  
  const formattedTotalPremium = useMemo(() => {
    return totalPremium.toFixed(2);
  }, [totalPremium]);

  // Memoize break-even price
  const breakEvenPrice = useMemo(() => {
    if (!optionStrike || !primaryScore) return null;
    
    return optionType === "call"
      ? (parseFloat(String(optionStrike)) + premiumPerContract).toFixed(2)
      : (parseFloat(String(optionStrike)) - premiumPerContract).toFixed(2);
  }, [optionType, optionStrike, premiumPerContract, primaryScore]);

  // Memoize max risk and reward
  const maxRisk = formattedTotalPremium;
  
  const maxReward = useMemo(() => {
    return optionType === "call" 
      ? "Unlimited" 
      : optionStrike 
        ? (parseFloat(String(optionStrike)) * (optionAmount || 1)).toFixed(2)
        : "0.00";
  }, [optionType, optionStrike, optionAmount]);

  // Memoize chart data
  const chartData = useMemo(() => {
    if (!history.length) return [];
    
    const now = Date.now() / 1000;
    const rangeSeconds = timeRange * 60 * 60;
    return history
      .filter((entry) => now - entry.timestamp <= rangeSeconds)
      // Sort first to ensure chronological order
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((entry) => {
        const date = new Date(entry.timestamp * 1000);
        
        // Use simple format that works reliably
        let formattedTime;
        if (timeRange <= 24) {
          // For shorter time ranges, include hours and minutes
          formattedTime = date.toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true
          });
        } else {
          // For longer time ranges, just include month, day, hour
          formattedTime = date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            hour12: true
          });
        }
        
        return {
          timestamp: formattedTime,
          value: activeCategory 
            ? (entry.categoryRVIs[activeCategory] || null) 
            : (entry.totalRVI || null)
        };
      });
  }, [history, timeRange, activeCategory]);

  // Memoize Y-axis tick generation
  const generateYAxisTicks = useMemo(() => {
    return () => {
      if (!primaryScore) return [];
      
      // Important values to include
      const values = [primaryScore];
      if (optionStrike) values.push(parseFloat(String(optionStrike)));
      if (breakEvenPrice) values.push(parseFloat(String(breakEvenPrice)));
      
      // Calculate min and max
      const min = Math.min(...values) * 0.8;
      const max = Math.max(...values) * 1.2;
      
      // Generate whole-number ticks
      const floorMin = Math.floor(min);
      const ceilMax = Math.ceil(max);
      const ticks = [];
      
      // Add whole numbers
      for (let i = floorMin; i <= ceilMax; i++) {
        ticks.push(i);
      }
      
      // Add important values if not already included
      values.forEach(value => {
        if (!ticks.some(tick => Math.abs(tick - value) < 0.1)) {
          ticks.push(value);
        }
      });
      
      // Sort ticks
      return ticks.sort((a, b) => a - b);
    };
  }, [primaryScore, optionStrike, breakEvenPrice]);

  // Memoize category buttons
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

  // Memoize time range buttons
  const renderTimeRangeButtons = useMemo(() => {
    const hourRanges = [1, 2, 4, 6, 12, 24];
    const dayRanges = [7, 30];
    
    return (
      <div className="mb-4 flex gap-2 justify-center flex-wrap">
        {hourRanges.map((h) => (
          <button
            key={`${h}h`}
            className={`text-xs px-2 py-1 border rounded ${
              timeRange === h ? "bg-highlight text-black" : "border-highlight text-white"
            }`}
            onClick={() => setTimeRange(h)}
          >
            {h}h
          </button>
        ))}
        {dayRanges.map((d) => (
          <button
            key={`${d}d`}
            className={`text-xs px-2 py-1 border rounded ${
              timeRange === d * 24 ? "bg-highlight text-black" : "border-highlight text-white"
            }`}
            onClick={() => setTimeRange(d * 24)}
          >
            {d}d
          </button>
        ))}
      </div>
    );
  }, [timeRange]);

  // Memoize option expiry buttons
  const renderOptionsExpiryButtons = useMemo(() => {
    const expiryOptions = ["1h", "2h", "4h", "6h", "12h", "24h", "1d", "3d", "7d", "14d", "30d"];
    return (
      <div className="mt-2 mb-3">
        <select 
          className="w-full bg-gray-800 border border-highlight rounded-md px-3 py-2 text-sm text-white"
          onChange={(e) => setOptionExpiry(e.target.value)}
          value={optionExpiry}
        >
          {expiryOptions.map((exp) => (
            <option key={exp} value={exp}>
              {exp}
            </option>
          ))}
        </select>
      </div>
    );
  }, [optionExpiry]);

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
      <h1 className="text-2xl font-bold text-neon mt-6 mb-4">Options Trading</h1>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
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

        <div className="border border-highlight bg-gray-950 rounded-2xl p-6 col-span-12 xl:col-span-6">
          <h3 className="text-md text-neon font-bold mb-2 text-center">
            {primaryTitle} – {timeRange < 24 ? `Last ${timeRange}h` : `Last ${Math.round(timeRange/24)} ${timeRange/24 === 1 ? 'Day' : 'Days'}`}
          </h3>
          {renderTimeRangeButtons}
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 40, right: 80, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 10, fill: "#fff" }}
                interval="preserveStartEnd"
                minTickGap={15}
                height={50}
              />              
              <YAxis 
                tick={{ fontSize: 12, fill: "#fff" }}
                domain={[
                  dataMin => {
                    // Find minimum value between chart data minimum and strike price (if provided)
                    // For puts, include break-even price as it could be lower
                    const minValues = [dataMin];
                    if (optionStrike) {
                      const strikeValue = parseFloat(String(optionStrike));
                      minValues.push(strikeValue * 0.8); // Show at least 20% below strike
                    }
                    if (breakEvenPrice && optionType === "put") {
                      minValues.push(parseFloat(breakEvenPrice) * 0.9);
                    }
                    // Return the minimum of all potential values, with some rounding to get nice values
                    const min = Math.min(...minValues);
                    return Math.floor(min * 0.95);
                  },
                  dataMax => {
                    // Find maximum value between chart data maximum and strike price (if provided)
                    // For calls, include break-even price as it could be higher
                    const maxValues = [dataMax];
                    if (optionStrike) {
                      const strikeValue = parseFloat(String(optionStrike));
                      maxValues.push(strikeValue * 1.2); // Show at least 20% above strike
                    }
                    if (breakEvenPrice && optionType === "call") {
                      maxValues.push(parseFloat(breakEvenPrice) * 1.1);
                    }
                    // Return the maximum of all potential values, with some rounding to get nice values
                    const max = Math.max(...maxValues);
                    return Math.ceil(max * 1.05);
                  }
                ]}
                tickFormatter={(value) => value.toFixed(2)}
                allowDataOverflow={false}
                ticks={generateYAxisTicks()}
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
              
              {/* Current price line */}
              {primaryScore && (
                <ReferenceLine 
                  y={primaryScore} 
                  stroke="#55FF55" 
                  strokeWidth={1.5}
                  strokeDasharray="1 6" 
                  label={{ 
                    value: `Current: ${formatCurrency(primaryScore)}`, 
                    position: 'right',
                    fill: '#55FF55',
                    fontSize: 11
                  }} 
                />
              )}
              
              {optionStrike && (
                <ReferenceLine 
                  y={parseFloat(String(optionStrike))} 
                  stroke="#FFBF00" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: `Strike: ${formatCurrency(optionStrike)}`, 
                    position: 'right',
                    fill: '#FFBF00',
                    fontSize: 12
                  }} 
                />
              )}

              {breakEvenPrice && (
                <ReferenceLine 
                  y={parseFloat(breakEvenPrice)} 
                  stroke="#00BFFF" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: `Break-even: ${formatCurrency(breakEvenPrice)}`, 
                    position: 'right',
                    fill: '#00BFFF',
                    fontSize: 12
                  }} 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-highlight rounded-2xl p-6 col-span-12 xl:col-span-3">
          <h3 className="text-base font-bold text-neon mb-2">Single Options</h3>
          
          <div className="flex space-x-2 mb-3">
            <button
              className={`flex-1 py-2 px-2 rounded-md border font-medium text-base ${
                optionType === "call" ? "bg-green-600 border-green-500" : "border-gray-600"
              }`}
              onClick={() => setOptionType("call")}
            >
              CALL
            </button>
            <button
              className={`flex-1 py-2 px-2 rounded-md border font-medium text-base ${
                optionType === "put" ? "bg-red-600 border-red-500" : "border-gray-600"
              }`}
              onClick={() => setOptionType("put")}
            >
              PUT
            </button>
          </div>

          <div className="mb-3">
            <label className="text-xs font-mono text-white block mb-1">
              Expiry
            </label>
            {renderOptionsExpiryButtons}
          </div>

          <div className="mb-3">
            <label className="text-xs font-mono text-white block mb-1">
              Strike Price ($)
            </label>
            <input
              type="text"
              value={optionStrike ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || value === ".") {
                  setOptionStrike(null);
                } else {
                  const parsed = parseFloat(value);
                  if (!isNaN(parsed)) {
                    setOptionStrike(parsed);
                  } else {
                    setOptionStrike(null);
                  }
                }
              }}
              className="w-full px-2 py-1 bg-gray-800 border border-highlight rounded-md text-sm"
              placeholder="Auto-set based on current price"
            />
          </div>

          <div className="mb-3">
            <label className="text-xs font-mono text-white block mb-1">
              Number of Contracts
            </label>
            <input
              type="number"
              value={optionAmount ?? ""}
              onChange={(e) => setOptionAmount(parseFloat(e.target.value) || null)}
              className="w-full px-2 py-1 bg-gray-800 border border-highlight rounded-md text-sm"
              placeholder="e.g. 10"
            />
          </div>

          <div className="bg-gray-900 p-3 rounded-md border border-highlight/30 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs font-mono text-gray-400">Current Price</p>
                <p className="text-sm font-mono text-white">${formatCurrency(primaryScore)}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-gray-400">Implied Volatility</p>
                <p className="text-sm font-mono text-white">{volatilityPercent}%</p>
              </div>
              <div>
                <p className="text-xs font-mono text-gray-400">Premium Per Contract</p>
                <p className="text-sm font-mono text-white">${formattedPremiumPerContract}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-gray-400">Total Premium</p>
                <p className="text-sm font-mono text-white">${formattedTotalPremium}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-gray-400">Break-even Price</p>
                <p className="text-sm font-mono text-white">${formatCurrency(breakEvenPrice)}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-gray-400">Max Risk</p>
                <p className="text-sm font-mono text-red-400">${formattedTotalPremium}</p>
              </div>
            </div>
          </div>

          <button className={`${
            optionType === "call" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
          } text-white font-medium py-2 px-3 rounded-md w-full text-sm`}>
            Buy {optionType === "call" ? "Call" : "Put"} Option
          </button>
        </div>
      </div>
    </main>
  );
}
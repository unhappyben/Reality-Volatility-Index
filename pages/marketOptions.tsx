"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
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

export default function OptionsPage() {
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [latestData, setLatestData] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<number>(24);
  
  // Options state
  const [optionType, setOptionType] = useState<string>("call");
  const [optionExpiry, setOptionExpiry] = useState<string>("7d");
  const [optionStrike, setOptionStrike] = useState<string | number | null>(null);
  const [optionAmount, setOptionAmount] = useState<number | null>(null);
  
  const formatCurrency = (value: any) => {
    return value ? parseFloat(value).toFixed(2) : "0.00";
  };
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const latest = await fetch("/data/latest_aggregated.json").then((res) => res.json());
        setLatestData(latest);

        const historyRes = await fetch("/data/history/index.json");
        const historyFiles: string[] = await historyRes.json();

        const historyData = await Promise.all(
          historyFiles.map(async (filename) => {
            const match = filename.match(/(\d+)_aggregated\.json/);
            const timestamp = match ? parseInt(match[1]) : 0;
            const data = await fetch(`/data/history/${filename}`).then((res) => res.json());
            return { timestamp, ...data };
          })
        );

        const sortedHistory = historyData.sort((a, b) => a.timestamp - b.timestamp);
        setHistory(sortedHistory);
      } catch (err) {
        console.error("Failed to load RVI data", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Set default strike price based on current asset price
    if (latestData && !optionStrike) {
      const currentPrice = activeCategory 
        ? latestData.categoryRVIs[activeCategory] 
        : latestData.totalRVI;
      setOptionStrike(Math.round(currentPrice * 100) / 100);
    }
  }, [latestData, activeCategory, optionStrike]);

  if (!latestData || history.length === 0) {
    return (
      <main className="min-h-screen bg-bg text-white p-4">
        <Navbar />
        <p className="text-center mt-10">Loading RVI data...</p>
      </main>
    );
  }

  const primaryScore = activeCategory 
    ? latestData.categoryRVIs[activeCategory] 
    : latestData.totalRVI;
  const primaryTitle = activeCategory ?? "Reality Volatility Index";
  
  // Calculate historical volatility from the last 7 days
  const calculateStdDev = (array: number[]) => {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b, 0) / n;
    const variance = array.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    return Math.sqrt(variance);
  };
  
  const rawVolatility = history.length > 7 
    ? calculateStdDev(history.slice(-7).map(h => 
        activeCategory ? h.categoryRVIs[activeCategory] : h.totalRVI
      )) / primaryScore
    : 0.2; // Default 20% volatility if not enough history

  const annualizedVolatility = rawVolatility * Math.sqrt(365);
  const volatilityPercent = (annualizedVolatility * 100).toFixed(2);

  // Generate nice Y-axis ticks that include important values
  const generateYAxisTicks = () => {
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

  // Simplified option pricing calculation
  function calculateOptionPrice(type: string, S: number, K: number, timeToExpiry: number, volatility: number) {
    // S: spot price (current price)
    // K: strike price
    // timeToExpiry: time to expiry in days
    // volatility: annualized volatility as a decimal

    // Convert time to expiry to years
    const T = timeToExpiry / 365;
    
    // Time value component based on volatility and time to expiry
    const timeValue = S * volatility * Math.sqrt(T);
    
    // Intrinsic value component
    let intrinsicValue = 0;
    if (type === "call") {
      intrinsicValue = Math.max(0, S - K);
    } else { // put
      intrinsicValue = Math.max(0, K - S);
    }
    
    // Add time value and intrinsic value with a dampening factor
    return intrinsicValue + timeValue * 0.4;
  }

  // Calculate option premium using simplified pricing model
  const calculatePremium = () => {
    if (!optionStrike) return 0;
    
    const S = primaryScore; // Current price
    const K = parseFloat(String(optionStrike)); // Strike price
    
    // Get time to expiry from option expiry selection
    let days;
    if (String(optionExpiry).includes('h')) {
      // Handle hour-based expiry
      const hours = parseInt(String(optionExpiry).match(/(\d+)h/)?.[1] || "24");
      days = hours / 24; // Convert hours to days
    } else {
      // Handle day-based expiry
      const daysMatch = String(optionExpiry).match(/(\d+)d/);
      days = daysMatch ? parseInt(daysMatch[1]) : 1;
    }
    
    // Use the simplified calculation
    const premium = calculateOptionPrice(
      optionType,
      S,
      K,
      days,
      rawVolatility * 5 // Scale up the volatility a bit for better pricing
    );
    
    return premium;
  };

  const premiumPerContract = calculatePremium();
  const formattedPremiumPerContract = premiumPerContract.toFixed(2);
  
  const totalPremium = optionAmount ? premiumPerContract * optionAmount : premiumPerContract;
  const formattedTotalPremium = totalPremium.toFixed(2);
    
  const breakEvenPrice = optionType === "call"
    ? (optionStrike ? (parseFloat(String(optionStrike)) + premiumPerContract).toFixed(2) : null)
    : (optionStrike ? (parseFloat(String(optionStrike)) - premiumPerContract).toFixed(2) : null);

  // Maximum risk is the premium paid
  const maxRisk = formattedTotalPremium;
  
  // Maximum reward depends on option type
  const maxReward = optionType === "call" 
    ? "Unlimited" 
    : optionStrike 
      ? (parseFloat(String(optionStrike)) * (optionAmount || 1)).toFixed(2)
      : "0.00";

  const now = Date.now() / 1000;
  const rangeSeconds = timeRange * 60 * 60;
  const chartData = history
    .filter((entry) => now - entry.timestamp <= rangeSeconds)
    .map((entry) => {
      // Format timestamp based on timeRange
      let formattedTime;
      if (timeRange <= 24) {
        // For timeRange <= 24 hours, show time
        formattedTime = new Date(entry.timestamp * 1000).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        // For timeRange > 24 hours, show date
        formattedTime = new Date(entry.timestamp * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
      
      return {
        timestamp: formattedTime,
        value: activeCategory ? entry.categoryRVIs[activeCategory] : entry.totalRVI,
      };
    });

  const renderCategoryButtons = () => {
    const entries = Object.entries(latestData.categoryRVIs);
    const sorted = entries.sort(([a], [b]) => a.localeCompare(b));
    const final = activeCategory ? [...sorted, ["Total RVI", latestData.totalRVI]] : sorted;
    return final.map(([category, rawScore]) => {
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
    });
  };

  const renderTimeRangeButtons = () => {
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
  };

  const renderOptionsExpiryButtons = () => {
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
  };

  return (
    <main className="min-h-screen bg-bg text-white p-4">
      <Navbar />
      <h1 className="text-2xl font-bold text-neon mt-6 mb-4">Options Trading</h1>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="border border-highlight rounded-2xl p-6 col-span-12 xl:col-span-3">
          <h2 className="text-lg font-bold text-neon">{primaryTitle}</h2>
          <p className="text-5xl font-mono text-neon">{primaryScore.toFixed(2)}</p>
            {history.length > 1 && (() => {
            const previous = activeCategory
              ? history[history.length - 2].categoryRVIs[activeCategory]
              : history[history.length - 2].totalRVI;

            const delta = primaryScore - previous;
            const deltaPercent = ((delta / previous) * 100).toFixed(2);
            const isPositive = delta >= 0;

            return (
                <p className={`text-sm mt-2 font-mono transition-all duration-300 ease-in-out ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {isPositive ? "▲" : "▼"} {delta.toFixed(2)} ({isPositive ? "↑" : "↓"} {deltaPercent}%)
              </p>
            );
            })()}
          <button
            className="mt-4 text-sm text-neon underline"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {showBreakdown ? "▾ Hide category breakdown" : "▸ Show category breakdown"}
          </button>

          {showBreakdown && <div className="mt-4 space-y-1">{renderCategoryButtons()}</div>}
        </div>

        <div className="border border-highlight bg-gray-950 rounded-2xl p-6 col-span-12 xl:col-span-6">
          <h3 className="text-md text-neon font-bold mb-2 text-center">
            {primaryTitle} – {timeRange < 24 ? `Last ${timeRange}h` : `Last ${Math.round(timeRange/24)} ${timeRange/24 === 1 ? 'Day' : 'Days'}`}
          </h3>
          {renderTimeRangeButtons()}
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 40, right: 80, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 12, fill: "#fff" }} />
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
            {renderOptionsExpiryButtons()}
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
                  setOptionStrike(value);
                } else {
                  const parsed = parseFloat(value);
                  if (!isNaN(parsed)) {
                    setOptionStrike(parsed);
                  } else {
                    setOptionStrike("");
                  }
                }
              }}
              className="w-full px-2 py-1 bg-gray-800 border border-highlight rounded-md text-sm"
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
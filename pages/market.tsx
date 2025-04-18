"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

const dummyData = {
  total: 39.7,
  delta: 2.1,
  categories: {
    "Info/Culture Chaos": 2.99,
    "Governance Risk": 7.85,
    Other: 4.22,
    Geopolitics: 18.57,
    "Financial Instability": 12.61,
    "Tech Disruption": 34.21,
  },
};

export default function MarketPage() {
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [leverage, setLeverage] = useState<number>(1);
  const [customLeverage, setCustomLeverage] = useState<string>("1.0");
  const [collateral, setCollateral] = useState<number | null>(null);
  const [takeProfit, setTakeProfit] = useState<number | null>(null);
  const [stopLoss, setStopLoss] = useState<number | null>(null);

  const renderCategoryButtons = () => {
    const entries = Object.entries(dummyData.categories);
    const sortedEntries = entries.sort(([a], [b]) => a.localeCompare(b));
    const finalEntries = activeCategory
      ? [...sortedEntries, ["Total RVI", dummyData.total]]
      : sortedEntries;

    return finalEntries.map(([category, rawScore]) => {
      const score = typeof rawScore === "number" ? rawScore : parseFloat(rawScore);
      return (
        <button
          key={category}
          className={`flex justify-between items-center border border-highlight rounded-md px-4 py-2 text-sm font-bold w-full hover:bg-highlight/10 transition-colors mb-1 ${
            activeCategory === category ? "text-neon" : "text-white"
          }`}
          onClick={() =>
            category === "Total RVI"
              ? setActiveCategory(null)
              : setActiveCategory(category as string)
          }
        >
          <span>{category}</span>
          <span>{score.toFixed(2)}</span>
        </button>
      );
    });
  };

  const primaryScore: number = activeCategory
    ? dummyData.categories[activeCategory]
    : dummyData.total;

  const primaryDelta = activeCategory ? null : dummyData.delta;
  const primaryTitle = activeCategory ?? "Reality Volatility Index";
  const contractAmount = collateral ? (collateral * leverage) / primaryScore : 0;
  const estimatedPositionSize = (contractAmount * primaryScore).toFixed(2);
  const notionalValue = estimatedPositionSize;
  const tpPrice = takeProfit ? (primaryScore * (1 + takeProfit / 100)).toFixed(2) : null;
  const slPrice = stopLoss ? (primaryScore * (1 - stopLoss / 100)).toFixed(2) : null;
  const liquidationPrice = !stopLoss
    ? (primaryScore - (primaryScore * 0.8) / leverage).toFixed(2)
    : null;

  const handleLeverageChange = (value: number) => {
    setLeverage(value);
    setCustomLeverage(value.toFixed(1));
  };

  return (
    <main className="min-h-screen bg-bg text-faded p-4">
      <Navbar />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-8">
        <div className="border border-highlight rounded-2xl p-6 w-full col-span-12 xl:col-span-3 min-w-[280px]">
          <h2 className="text-lg font-bold text-neon">{primaryTitle}</h2>
          <p className="text-5xl font-mono text-neon">{primaryScore.toFixed(2)}</p>
          {primaryDelta !== null && (
            <p className="text-xs text-green-400 font-mono">
              ▲ {primaryDelta.toFixed(2)} in last 24h
            </p>
          )}

          <button
            className="mt-4 text-sm text-neon underline"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {showBreakdown
              ? "▾ Hide category breakdown"
              : "▸ Show category breakdown"}
          </button>

          {showBreakdown && (
            <div className="mt-4 space-y-1">{renderCategoryButtons()}</div>
          )}
        </div>

        <div className="border border-highlight bg-gray-950 rounded-2xl p-6 flex items-center justify-center min-h-[400px] col-span-12 xl:col-span-7">
          <div className="text-center">
            <p className="text-sm font-mono">
              [ {primaryTitle} RVI Chart Placeholder ]
            </p>
          </div>
        </div>

        <div className="border border-highlight rounded-2xl p-6 flex flex-col justify-start space-y-4 h-full col-span-12 xl:col-span-2 min-w-[260px]">
          <h3 className="text-lg font-bold text-neon">Trade</h3>

          <label className="text-sm font-mono text-white">
            Collateral ($)
            <input
              type="number"
              min="0"
              value={collateral ?? ""}
              onChange={(e) => setCollateral(parseFloat(e.target.value) || null)}
              className="mt-1 w-full px-2 py-1 bg-gray-800 border border-highlight rounded-md text-white font-mono"
            />
          </label>

          <label className="text-sm font-mono text-white">
            Leverage:
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const input = e.currentTarget.textContent?.replace(/[^\d.]/g, "") || "1";
                const parsed = parseFloat(input);
                if (!isNaN(parsed) && parsed >= 1 && parsed <= 200) {
                  setLeverage(parsed);
                  setCustomLeverage(parsed.toFixed(1));
                } else {
                  setLeverage(1);
                  setCustomLeverage("1.0");
                }
              }}
              className="ml-2 px-2 py-1 bg-gray-800 border border-highlight rounded-md text-white font-mono inline-block min-w-[60px] text-center"
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
              className="w-full mt-2 appearance-none bg-gray-700 h-2 rounded-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </label>

          <label className="text-sm font-mono text-white">
            Take Profit (%)
            <input
              type="number"
              value={takeProfit ?? ""}
              onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
              className="mt-1 w-full px-2 py-1 bg-gray-800 border border-highlight rounded-md text-white font-mono"
              placeholder="e.g. 20 for 20%"
            />
          </label>

          <label className="text-sm font-mono text-white">
            Stop Loss (%)
            <input
              type="number"
              value={stopLoss ?? ""}
              onChange={(e) => setStopLoss(parseFloat(e.target.value))}
              className="mt-1 w-full px-2 py-1 bg-gray-800 border border-highlight rounded-md text-white font-mono"
              placeholder="e.g. 10 for 10%"
            />
          </label>

          <p className="text-xs text-faded font-mono">
            Notional Value: <span className="text-white">${notionalValue}</span>
          </p>
          <p className="text-xs text-faded font-mono">
            Est. Position Size: <span className="text-white">${estimatedPositionSize}</span>
          </p>
          {liquidationPrice && (
            <p className="text-xs text-faded font-mono">
              Liquidation Price: <span className="text-white">${liquidationPrice}</span>
            </p>
          )}

          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl">
            Buy {activeCategory ?? "Total RVI"}
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl">
            Sell {activeCategory ?? "Total RVI"}
          </button>
        </div>
      </div>
    </main>
  );
}

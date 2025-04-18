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
} from "recharts";

export default function MarketPage() {
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [leverage, setLeverage] = useState<number>(1);
  const [customLeverage, setCustomLeverage] = useState<string>("1.0");
  const [collateral, setCollateral] = useState<number | null>(null);
  const [takeProfit, setTakeProfit] = useState<number | null>(null);
  const [stopLoss, setStopLoss] = useState<number | null>(null);
  const [latestData, setLatestData] = useState<{ totalRVI: number; categoryRVIs: Record<string, number> } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<number>(12);

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

  if (!latestData || history.length === 0) {
    return (
      <main className="min-h-screen bg-bg text-white p-4">
        <Navbar />
        <p className="text-center mt-10">Loading RVI data...</p>
      </main>
    );
  }

  const primaryScore = activeCategory ? latestData.categoryRVIs[activeCategory] : latestData.totalRVI;
  const primaryTitle = activeCategory ?? "Reality Volatility Index";
  const contractAmount = collateral ? (collateral * leverage) / primaryScore : 0;
  const estimatedPositionSize = (contractAmount * primaryScore).toFixed(2);
  const tpPrice = takeProfit ? (primaryScore * (1 + takeProfit / 100)).toFixed(2) : null;
  const slPrice = stopLoss ? (primaryScore * (1 - stopLoss / 100)).toFixed(2) : null;
  const liquidationPrice = !stopLoss
    ? (primaryScore - (primaryScore * 0.8) / leverage).toFixed(2)
    : null;

  const now = Date.now() / 1000;
  const rangeSeconds = timeRange * 60 * 60;
  const chartData = history
    .filter((entry) => now - entry.timestamp <= rangeSeconds)
    .map((entry) => ({
      timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: activeCategory ? entry.categoryRVIs[activeCategory] : entry.totalRVI,
    }));

  const renderCategoryButtons = () => {
    const entries = Object.entries(latestData.categoryRVIs);
    const sorted = entries.sort(([a], [b]) => a.localeCompare(b));
    const final = activeCategory ? [...sorted, ["Total RVI", latestData.totalRVI]] : sorted;
    return final.map(([category, rawScore]) => {
      const score = typeof rawScore === "number" ? rawScore : parseFloat(rawScore);
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
  };

  return (
    <main className="min-h-screen bg-bg text-white p-4">
      <Navbar />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-8">
        <div className="border border-highlight rounded-2xl p-6 col-span-12 xl:col-span-3">
          <h2 className="text-lg font-bold text-neon">{primaryTitle}</h2>
          <p className="text-5xl font-mono text-neon">{primaryScore.toFixed(2)}</p>

          <button
            className="mt-4 text-sm text-neon underline"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {showBreakdown ? "▾ Hide category breakdown" : "▸ Show category breakdown"}
          </button>

          {showBreakdown && <div className="mt-4 space-y-1">{renderCategoryButtons()}</div>}
        </div>

        <div className="border border-highlight bg-gray-950 rounded-2xl p-6 col-span-12 xl:col-span-7">
          <h3 className="text-md text-neon font-bold mb-2 text-center">
            {primaryTitle} – Last {timeRange}h
          </h3>
          {renderTimeRangeButtons()}
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 12, fill: "#fff" }} />
              <YAxis tick={{ fontSize: 12, fill: "#fff" }} />
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
              onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
              className="mt-1 w-full px-2 py-1 bg-gray-800 border border-highlight rounded-md"
              placeholder="e.g. 20"
            />
          </label>

          <label className="text-sm font-mono text-white">
            Stop Loss (%)
            <input
              type="number"
              value={stopLoss ?? ""}
              onChange={(e) => setStopLoss(parseFloat(e.target.value))}
              className="mt-1 w-full px-2 py-1 bg-gray-800 border border-highlight rounded-md"
              placeholder="e.g. 10"
            />
          </label>

          <p className="text-xs font-mono mt-2">Notional: <span className="text-white">${estimatedPositionSize}</span></p>
          {liquidationPrice && (
            <p className="text-xs font-mono">Liquidation: <span className="text-white">${liquidationPrice}</span></p>
          )}

          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl mt-4">
            Buy {primaryTitle}
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl mt-2">
            Sell {primaryTitle}
          </button>
        </div>
      </div>
    </main>
  );
}

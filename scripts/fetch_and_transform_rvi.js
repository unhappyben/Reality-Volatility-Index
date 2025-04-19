import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ✅ Derive __dirname manually for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Use root-relative path from inside /scripts
const ROOT_DIR = path.resolve(__dirname, "..");

dotenv.config();

const API_URL = "https://api.data.adj.news/api/markets";

const SNAPSHOT_DIR = path.join(ROOT_DIR, "snapshots");
const PUBLIC_DATA_DIR = path.join(ROOT_DIR, "public/data");
const HISTORY_DIR = path.join(PUBLIC_DATA_DIR, "history");


const getUnix5MinEpoch = () => {
  const now = Math.floor(Date.now() / 1000);
  return now - (now % 300);
};

const fetchMarkets = async () => {
  const params = new URLSearchParams({
    limit: "500",
    sort_by: "volume",
    sort_dir: "desc",
    status: "active",
    market_type: "binary",
    platform: "polymarket"
  });
  const res = await fetch(`${API_URL}?${params}`, {
    headers: {
      Authorization: `Bearer ${process.env.ADJACENT_API_KEY}`
    }
  });
  if (!res.ok) throw new Error(`Failed to fetch markets: ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
};

const saveSnapshot = (data, timestamp) => {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  const filename = path.join(SNAPSHOT_DIR, `${timestamp}_markets_polymarket.json`);
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`✅ Snapshot saved: ${filename}`);
};

const inferRviCategory = (question = "") => {
  const q = question.toLowerCase();
  if (/(ukraine|gaza|israel|russia|china|iran|north korea|invasion|nuclear|conflict|taliban|nato)/.test(q)) return "Geopolitics";
  if (/(election|vote|president|trump|biden|senate|congress|law|regulation|policy)/.test(q)) return "Governance Risk";
  if (/(ai\b|openai|chatgpt|machine learning|automation|privacy|data breach)/.test(q)) return "Tech Disruption";
  if (/(climate|carbon|emissions|environment|hurricane|wildfire|flood)/.test(q)) return "Climate Risk";
  if (/(pandemic|covid|virus|infection|health|cdc|fda|who)/.test(q)) return "Health/Bio Risk";
  if (/(recession|inflation|interest rate|fed|gdp|cpi|crypto|usdt|usdc|bitcoin|stock)/.test(q)) return "Financial Instability";
  if (/(misinformation|tiktok|twitter|instagram|celebrity|media|scandal|elon|kardashian|netflix)/.test(q)) return "Info/Culture Chaos";
  if (/(champions league|premier league|nba|fifa|ufc|super bowl|arsenal|madrid|wimbledon|formula 1)/.test(q)) return "Info/Culture Chaos";
  return "Other";
};

const applyImpactScore = (market) => {
  const title = market.question.toLowerCase();
  let base = 0.3;
  if (/nuclear|agi|pandemic|collapse/.test(title)) base = 1.0;
  else if (/war|recession|default|election/.test(title)) base = 0.8;
  else if (/fed|policy|crypto|breakup/.test(title)) base = 0.6;
  else if (/oscars|elon|tiktok|media/.test(title)) base = 0.4;

  if (/un|world|human/.test(title)) base += 0.15;
  else if (/usa|china|eu/.test(title)) base += 0.1;
  else if (/meta|google|amazon/.test(title)) base += 0.05;

  if (/collapse|invade|nuclear|shutdown|ban|default/.test(title)) base += 0.1;
  else if (/resign|investigate|fine|indict/.test(title)) base += 0.05;

  return Math.min(base, 1.0);
};

const applyTimeHorizonScore = (market) => {
  const end = new Date(market.end_date);
  const now = new Date();
  const diff = (end - now) / (1000 * 60 * 60 * 24); // days
  if (diff <= 30) return 1.0;
  if (diff <= 90) return 0.8;
  if (diff <= 180) return 0.6;
  if (diff <= 365) return 0.4;
  return 0.2;
};

const applyVolatilityScore = () => 0.7; // placeholder

const applyLiquidityScore = (market, volumes) => {
  const sorted = [...volumes].sort((a, b) => b - a);
  const rank = sorted.indexOf(market.volume);
  const pct = rank / sorted.length;
  if (pct <= 0.1) return 1.0;
  if (pct <= 0.25) return 0.8;
  if (pct <= 0.5) return 0.6;
  return 0.5;
};

const applyPlatformDiversityScore = () => 1.0; // placeholder

const transformMarkets = (markets) => {
  const volumes = markets.map((m) => m.volume);

  return markets.map((market) => {
    const impact_score = applyImpactScore(market);
    const time_horizon_score = applyTimeHorizonScore(market);
    const volatility_score = applyVolatilityScore(market);
    const liquidity_score = applyLiquidityScore(market, volumes);
    const platform_diversity_score = applyPlatformDiversityScore();
    const rvi_category = inferRviCategory(market.question);

    const scores = [
      impact_score,
      time_horizon_score,
      volatility_score,
      liquidity_score,
      platform_diversity_score
    ];

    const composite_weight = Math.pow(scores.reduce((a, b) => a * b, 1), 1 / scores.length);
    const rvi_contribution = composite_weight * market.probability;

    return {
      ...market,
      impact_score,
      time_horizon_score,
      volatility_score,
      liquidity_score,
      platform_diversity_score,
      composite_weight: Number(composite_weight.toFixed(3)),
      rvi_contribution: Number(rvi_contribution.toFixed(2)),
      rvi_category
    };
  });
};

const aggregateRVIs = (transformed) => {
  const grouped = {};

  for (const row of transformed) {
    const cat = row.rvi_category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(row);
  }

  const categoryRVIs = Object.fromEntries(
    Object.entries(grouped).map(([cat, rows]) => {
      const valid = rows.filter((r) => typeof r.rvi_contribution === "number");
      const sum = valid.reduce((acc, r) => acc + r.rvi_contribution, 0);
      const normalized = (sum / (valid.length * 100)) * 100;
      return [cat, Number(normalized.toFixed(2))];
    })
  );

  const totalMarkets = transformed.length;
  const totalRVI = Object.entries(categoryRVIs).reduce((sum, [cat, val]) => {
    const weight = (grouped[cat].length || 0) / totalMarkets;
    return sum + val * weight;
  }, 0);

  return { categoryRVIs, totalRVI: Number(totalRVI.toFixed(2)) };
};

const run = async () => {
  const timestamp = getUnix5MinEpoch();
  const data = await fetchMarkets();
  saveSnapshot(data, timestamp);

  const transformed = transformMarkets(data);
  const transformedPath = path.join(SNAPSHOT_DIR, `${timestamp}_transformed.json`);
  fs.writeFileSync(transformedPath, JSON.stringify(transformed, null, 2));
  console.log(`✅ Transformed data saved.`);

  const { categoryRVIs, totalRVI } = aggregateRVIs(transformed);
  const aggregatedOutput = { totalRVI, categoryRVIs };

  const aggregatedPath = path.join(SNAPSHOT_DIR, `${timestamp}_aggregated.json`);
  fs.writeFileSync(aggregatedPath, JSON.stringify(aggregatedOutput, null, 2));
  console.log(`✅ Aggregated RVI saved.`);

  // Save latest version to public/data
  fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  const publicLatestPath = path.join(PUBLIC_DATA_DIR, "latest_aggregated.json");
  fs.writeFileSync(publicLatestPath, JSON.stringify(aggregatedOutput, null, 2));
  console.log(`✅ Copied latest RVI to: ${publicLatestPath}`);

  // Save to public/data/history
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
  const historyFilePath = path.join(HISTORY_DIR, `${timestamp}_aggregated.json`);
  fs.writeFileSync(historyFilePath, JSON.stringify(aggregatedOutput, null, 2));
  console.log(`✅ Saved history file: ${historyFilePath}`);

  // Update history index.json
  const files = fs.readdirSync(HISTORY_DIR)
    .filter(name => name.endsWith("_aggregated.json"))
    .sort();

  const indexPath = path.join(HISTORY_DIR, "index.json");
  fs.writeFileSync(indexPath, JSON.stringify(files, null, 2));
  console.log(`✅ Updated history index.json`);
};

run().catch(console.error);

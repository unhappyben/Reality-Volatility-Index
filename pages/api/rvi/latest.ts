// pages/api/rvi/latest.ts
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const dir = path.resolve("./snapshots");
  const files = fs.readdirSync(dir).filter(f => f.endsWith("_aggregated.json"));
  if (files.length === 0) return res.status(404).json({ error: "No data" });

  const latest = files.sort().pop();
  const data = JSON.parse(fs.readFileSync(path.join(dir, latest), "utf-8"));
  return res.status(200).json({ timestamp: latest.split("_")[0], ...data });
}

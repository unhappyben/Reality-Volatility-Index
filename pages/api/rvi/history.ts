// pages/api/rvi/history.ts
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const dir = path.resolve("./snapshots");
  const files = fs.readdirSync(dir).filter(f => f.endsWith("_aggregated.json"));

  const history = files.map(file => {
    const content = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
    return {
      timestamp: Number(file.split("_")[0]),
      ...content
    };
  });

  history.sort((a, b) => a.timestamp - b.timestamp);
  return res.status(200).json(history);
}

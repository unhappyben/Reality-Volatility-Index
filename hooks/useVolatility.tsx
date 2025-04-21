import { useMemo } from "react";

export function useVolatility({ history, activeCategory, primaryScore }: {
  history: any[];
  activeCategory: string | null;
  primaryScore: number | null;
}): number {
  return useMemo(() => {
    if (!primaryScore || history.length < 2) return 0.2;

    const recent = history.slice(-20);
    const values = recent.map((h) =>
      activeCategory ? h.categoryRVIs[activeCategory] : h.totalRVI
    );

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const rawVol = stdDev / primaryScore;
    return rawVol * Math.sqrt(365);
  }, [history, activeCategory, primaryScore]);
}

import { useEffect } from "react";

export function useAutoStrike({
  latestData,
  activeCategory,
  setOptionStrike,
}: {
  latestData: any;
  activeCategory: string | null;
  setOptionStrike: (value: number) => void;
}) {
  useEffect(() => {
    if (!latestData) return;

    if (activeCategory !== null) {
      const newScore = latestData.categoryRVIs[activeCategory];
      if (typeof newScore === "number" && !isNaN(newScore)) {
        setOptionStrike(Math.round(newScore * 100) / 100);
      }
    } else {
      const totalScore = latestData.totalRVI;
      if (typeof totalScore === "number" && !isNaN(totalScore)) {
        setOptionStrike(Math.round(totalScore * 100) / 100);
      }
    }
  }, [activeCategory, latestData, setOptionStrike]);
}

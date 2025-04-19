function cumulativeNormal(x: number): number {
    return 0.5 * (1 + erf(x / Math.sqrt(2)));
  }
  
  function erf(x: number): number {
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const a1 = 0.254829592,
          a2 = -0.284496736,
          a3 = 1.421413741,
          a4 = -1.453152027,
          a5 = 1.061405429,
          p = 0.3275911;
  
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x));
    return sign * y;
  }
  
  export function blackScholesPrice(
    S: number,
    K: number,
    T: number,
    r: number,
    sigma: number,
    optionType: "CALL" | "PUT"
  ): number {
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
  
    if (optionType === "CALL") {
      return S * cumulativeNormal(d1) - K * Math.exp(-r * T) * cumulativeNormal(d2);
    } else {
      return K * Math.exp(-r * T) * cumulativeNormal(-d2) - S * cumulativeNormal(-d1);
    }
  }
  
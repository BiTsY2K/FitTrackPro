const round = (n: number, dp = 1) => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

export const lbToKg = (lb: number) => round(lb * 0.45359237, 2);
export const kgToLb = (kg: number) => round(kg / 0.45359237, 1);
export const inToCm = (inch: number) => round(inch * 2.54, 1);
export const cmToIn = (cm: number) => round(cm / 2.54, 1);
export const ftInToCm = (ft: number, inch: number) => round((ft * 12 + inch) * 2.54, 1);

export const getQuadrantColor = (futureScore: number, urgencyScore: number): string => {
  if (futureScore >= 0 && urgencyScore >= 0) return 'rgba(239, 68, 68, 0.1)'; // L1 - Red
  if (futureScore >= 0 && urgencyScore < 0) return 'rgba(34, 197, 94, 0.1)'; // L2 - Green
  if (futureScore < 0 && urgencyScore >= 0) return 'rgba(249, 115, 22, 0.1)'; // L3 - Orange
  return 'rgba(168, 85, 247, 0.1)'; // L4 - Purple
};

export const getPointColor = (futureScore: number, urgencyScore: number): string => {
  if (futureScore >= 0 && urgencyScore >= 0) return '#ef4444'; // Red
  if (futureScore >= 0 && urgencyScore < 0) return '#22c55e'; // Green
  if (futureScore < 0 && urgencyScore >= 0) return '#f97316'; // Orange
  return '#a855f7'; // Purple
};

export const getQuadrantBorderColor = (futureScore: number, urgencyScore: number): string => {
  if (futureScore >= 0 && urgencyScore >= 0) return '#ef4444';
  if (futureScore >= 0 && urgencyScore < 0) return '#22c55e';
  if (futureScore < 0 && urgencyScore >= 0) return '#f97316';
  return '#a855f7';
};

export const getQuadrantLabel = (futureScore: number, urgencyScore: number): string => {
  if (futureScore >= 0 && urgencyScore >= 0) return 'L1 - 重要且紧急';
  if (futureScore >= 0 && urgencyScore < 0) return 'L2 - 重要不紧急';
  if (futureScore < 0 && urgencyScore >= 0) return 'L3 - 不重要但紧急';
  return 'L4 - 不重要不紧急';
};

export const scoreToPosition = (score: number): number => {
  return ((score + 3) / 6) * 100;
};

export const positionToScore = (position: number): number => {
  return Math.round((position / 100) * 6 - 3);
};

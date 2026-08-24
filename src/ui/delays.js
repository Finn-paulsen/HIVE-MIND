function toSafeNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

export function simulatedDelay(min = 400, max = 1200) {
  const safeMin = Math.max(0, toSafeNumber(min, 400));
  const safeMax = Math.max(safeMin, toSafeNumber(max, 1200));
  const duration = Math.round(safeMin + Math.random() * (safeMax - safeMin));

  return new Promise(resolve => {
    window.setTimeout(resolve, duration);
  });
}

export function quickDelay() {
  return simulatedDelay(200, 400);
}

// Format large numbers with hash rates
export const formatHashRate = (hash: number | null | undefined): string => {
  if (!hash) return '0 H/s';
  if (hash >= 1e12) return (hash / 1e12).toFixed(2) + ' TH/s';
  if (hash >= 1e9) return (hash / 1e9).toFixed(2) + ' GH/s';
  if (hash >= 1e6) return (hash / 1e6).toFixed(2) + ' MH/s';
  if (hash >= 1e3) return (hash / 1e3).toFixed(2) + ' KH/s';
  return hash.toFixed(2) + ' H/s';
};

// Format large numbers with commas
export const formatNumber = (num: number | null | undefined): string => {
  if (!num) return '0';
  return num.toLocaleString();
};

// Convert atomic units to XMR (divide by 1e12)
export const formatXMR = (atomic: number | null | undefined): string => {
  if (!atomic) return '0';
  return (atomic / 1e12).toFixed(8);
};

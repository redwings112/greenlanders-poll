// utils/format.js
import { ethers } from "ethers";

export const formatEther = (value) => {
  try {
    return ethers.formatEther(value);
  } catch {
    return "0";
  }
};
export const formatNumber = (num, decimals = 2) => {
  if (!num && num !== 0) return "0.00";
  return parseFloat(num).toFixed(decimals);
};

export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTime = (seconds) => {
  if (seconds <= 0) return "Ended";
  const days = Math.floor(seconds / 86400);
  const hrs = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hrs}h ${mins}m`;
};


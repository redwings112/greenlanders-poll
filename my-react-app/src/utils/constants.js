// src/utils/constants.js

export const NETWORKS = {
  BSC: {
    name: "Binance Smart Chain",
    chainId: 56,
    rpcUrl: "https://bsc-dataseed.binance.org/",
    explorer: "https://bscscan.com",
  },
  ETH: {
    name: "Ethereum",
    chainId: 1,
    rpcUrl: "https://mainnet.infura.io/v3/",
    explorer: "https://etherscan.io",
  },
  SOL: {
    name: "Solana",
    chainId: 101, // placeholder (Solana uses a different model)
    rpcUrl: "https://api.mainnet-beta.solana.com",
    explorer: "https://solscan.io",
  },
  BTC: {
    name: "Bitcoin",
    chainId: 0, // placeholder for display only
    rpcUrl: "https://blockstream.info/api",
    explorer: "https://blockstream.info",
  },
  USDT: {
    name: "Tether (USDT)",
    chainId: 56, // assuming BSC
    rpcUrl: "https://bsc-dataseed.binance.org/",
    explorer: "https://bscscan.com",
  },
};

export const TOKENS = {
  ETH: { symbol: "ETH", decimals: 18 },
  BNB: { symbol: "BNB", decimals: 18 },
  SOL: { symbol: "SOL", decimals: 9 },
  USDT: { symbol: "USDT", decimals: 6 },
  BTC: { symbol: "BTC", decimals: 8 },
};

// ✅ Token Contract Addresses (examples — replace with your actual deployed contracts)
export const TOKEN_ADDRESSES = {
  ETH: "0x0000000000000000000000000000000000000000", // native ETH (placeholder)
  BNB: "0x0000000000000000000000000000000000000000", // native BNB (placeholder)
  SOL: "So11111111111111111111111111111111111111112", // Solana wrapped SOL address
  USDT: "0x55d398326f99059fF775485246999027B3197955", // USDT (BSC)
  BTC: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",  // BTCB (BSC)
};


// Default app configuration
export const APP_CONFIG = {
  appName: "Greenlanders Staking Pool",
  version: "1.0.0",
  defaultNetwork: NETWORKS.BSC,
};

export const POWER_REGISTRY_ADDRESS = {
  mainnet: "0xYourMainnetPowerRegistry",
  bsc: "0xYourBscBridgeContract",
  polygon: "0xYourPolygonBridgeContract",
};

export const HYPERLANE_CHAINS = {
  mainnet: 1,
  bsc: 56,
  polygon: 137,
};


// === Network Switch Utility ===
export async function switchNetwork(chainIdHex) {
  if (!window.ethereum) {
    alert("Please install MetaMask to switch networks.");
    return;
  }
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    console.log(`✅ Switched to network ${chainIdHex}`);
  } catch (switchError) {
    // If the chain is not added to MetaMask, add it
    if (switchError.code === 4902) {
      const chainData = Object.values(NETWORKS).find(
        (n) => `0x${n.chainId.toString(16)}` === chainIdHex
      );
      if (chainData) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: chainData.name,
              rpcUrls: [chainData.rpcUrl],
              nativeCurrency: {
                name: chainData.name,
                symbol: chainData.name.includes("Binance") ? "BNB" : "ETH",
                decimals: 18,
              },
              blockExplorerUrls: [chainData.explorer],
            },
          ],
        });
      }
    } else {
      console.error("Error switching network:", switchError);
    }
  }
}

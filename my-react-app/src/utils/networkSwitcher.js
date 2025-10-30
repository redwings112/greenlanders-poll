// src/utils/networkSwitcher.js
import { ethers } from "ethers";
import { NETWORKS } from "./constants";

/**
 * Switch between supported blockchain networks.
 * Works for EVM-compatible chains (Ethereum, BSC, USDT on Ethereum).
 * For Bitcoin and Solana, returns a public API endpoint instead.
 */
export const switchNetwork = async (networkKey) => {
  const selectedNetwork = NETWORKS[networkKey.toUpperCase()];

  if (!selectedNetwork) {
    console.error(`❌ Unknown network: ${networkKey}`);
    return null;
  }

  // 🧩 Handle non-EVM networks separately
  if (["BTC", "SOLANA"].includes(networkKey.toUpperCase())) {
    console.log(`Connected to ${selectedNetwork.name}`);
    return { rpcUrl: selectedNetwork.rpcUrl, symbol: selectedNetwork.symbol };
  }

  // 🦊 For EVM-based networks (Ethereum, BSC, USDT)
  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.toBeHex(selectedNetwork.chainId) }],
      });
      console.log(`✅ Switched to ${selectedNetwork.name}`);
      return selectedNetwork;
    } catch (switchError) {
      // If chain is not added to MetaMask, try adding it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: ethers.toBeHex(selectedNetwork.chainId),
                chainName: selectedNetwork.name,
                rpcUrls: [selectedNetwork.rpcUrl],
                nativeCurrency: {
                  name: selectedNetwork.symbol,
                  symbol: selectedNetwork.symbol,
                  decimals: 18,
                },
                blockExplorerUrls: [selectedNetwork.explorer],
              },
            ],
          });
          console.log(`✅ Added and switched to ${selectedNetwork.name}`);
        } catch (addError) {
          console.error("❌ Failed to add network:", addError);
        }
      } else {
        console.error("❌ Error switching network:", switchError);
      }
    }
  } else {
    alert("Please install MetaMask or a compatible Web3 wallet.");
  }

  return selectedNetwork;
};

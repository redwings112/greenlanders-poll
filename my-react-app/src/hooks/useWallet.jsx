import { useState } from "react";

export const useWallet = () => {
  const [connectedWallet, setConnectedWallet] = useState(null);

  const connectWallet = async (walletType) => {
    try {
      if (walletType === "MetaMask") {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setConnectedWallet(accounts[0]);
          console.log("Connected to MetaMask:", accounts[0]);
        } else {
          alert("MetaMask not detected. Please install it first.");
        }
      } else if (walletType === "WalletConnect") {
        // Placeholder for WalletConnect logic
        setConnectedWallet("WalletConnect User");
        console.log("WalletConnect connected.");
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet(null);
  };

  return { connectedWallet, connectWallet, disconnectWallet };
};

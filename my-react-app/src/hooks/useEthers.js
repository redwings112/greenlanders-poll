import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { NETWORKS, APP_CONFIG } from "../utils/constants";


// ===============================
// 🔌 useEthers Hook
// ===============================
export const useEthers = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // -------------------------------
  // 🧩 Connect Wallet
  // -------------------------------
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
      

    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const signer = await web3Provider.getSigner();
      const networkData = await web3Provider.getNetwork();

      const userAddress = await signer.getAddress();
      setProvider(web3Provider);
      setSigner(signer);
      const addr = await signer.getAddress();
      setAddress(addr);

      setProvider(web3Provider);
      setSigner(signer);
      setAddress(userAddress);
      setNetwork(networkData.name);
      setChainId(Number(networkData.chainId));
      setIsConnected(true);

      console.log("✅ Connected to:", networkData.name);
    } catch (error) {
      console.error("❌ Wallet connection error:", error);
    }
  };

  

  // -------------------------------
  // 🔁 Auto Reconnect on Network or Account Change
  // -------------------------------
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        console.log("🔄 Account changed");
        connectWallet();
      });

      window.ethereum.on("chainChanged", () => {
        console.log("🔄 Network changed");
        window.location.reload();
      });
    }
  }, []);

  // -------------------------------
  // 🌐 Get Supported Network Details
  // -------------------------------
  const getNetworkInfo = () => {
    const foundNetwork = Object.values(NETWORKS).find(
      (net) => net.chainId === chainId
    );
    return foundNetwork || APP_CONFIG.defaultNetwork;
  };

  // -------------------------------
  // 🧾 Get Wallet Info
  // -------------------------------
  const walletInfo = {
    provider,
    signer,
    address,
    network,
    chainId,
    isConnected,
    networkDetails: getNetworkInfo(),
    connectWallet,
  };

  return walletInfo;
};

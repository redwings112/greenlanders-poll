import React, { useState, useEffect } from "react";
import { useEthers } from "../hooks/useEthers";
import { usePool } from "../hooks/usePool";
import { useKeepers } from "../hooks/useKeepers";
import { NETWORKS } from "../utils/constants";
import "../styles/Pools.css";

const Pools = () => {
  const { provider, address, connectWallet, chainId, isConnected } = useEthers();
  const { getAllPools, stakeTokens } = usePool();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-refresh pools
  useKeepers(() => {
    fetchPools();
  }, 60000);

  const fetchPools = async () => {
    try {
      setLoading(true);
      const data = await getAllPools();
      setPools(data);
    } catch (err) {
      console.error("❌ Failed to fetch pools:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  // -------------------------------
  // 🧭 Switch Network Automatically
  // -------------------------------
  const switchNetwork = async (tokenSymbol) => {
    if (!window.ethereum) return alert("Please install MetaMask!");

    const targetNetwork = Object.values(NETWORKS).find(
      (n) => n.token === tokenSymbol
    );

    if (!targetNetwork) {
      alert(`⚠️ Network for ${tokenSymbol} not found.`);
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + targetNetwork.chainId.toString(16) }],
      });
      console.log(`🔁 Switched to ${targetNetwork.name}`);
    } catch (switchError) {
      // If chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x" + targetNetwork.chainId.toString(16),
                chainName: targetNetwork.name,
                rpcUrls: [targetNetwork.rpcUrl],
                nativeCurrency: {
                  name: targetNetwork.token,
                  symbol: targetNetwork.token,
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error("❌ Failed to add new network:", addError);
        }
      } else {
        console.error("❌ Network switch failed:", switchError);
      }
    }
  };

  // -------------------------------
  // 💰 Handle Stake Click
  // -------------------------------
  const handleStakeClick = async (pool) => {
    await switchNetwork(pool.tokenSymbol);
    await stakeTokens(pool.tokenSymbol, 1); // example stake 1 token
  };

  if (loading) return <div className="p-8 text-center">Loading Pools...</div>;

  return (
    <div className="pools-container">
      <h1 className="page-title">💠 Active & Upcoming Pools 💠</h1>

      {!isConnected ? (
        <div className="connect-section">
          <button className="connect-wallet-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <p className="connected-text">Connected: {address}</p>
      )}

      <section className="pool-section">
        <h2>🔥 Active Pools</h2>
        <div className="pool-grid">
          {pools.map((pool) => (
            <div key={pool.id} className="pool-card">
              <h3>{pool.name}</h3>
              <p>
                APY: <strong>{pool.apy}%</strong>
              </p>
              <p>
                Total Staked: {pool.totalStaked} {pool.tokenSymbol}
              </p>
              <p>Ends on: {pool.endDate}</p>
              <button
                className="stake-btn"
                onClick={() => handleStakeClick(pool)}
              >
                Stake Now
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Pools;

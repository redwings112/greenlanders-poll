import React, { useState, useEffect } from "react";
import DepositModal from "../components/DepositModal";
import WithdrawModal from "../components/WithdrawModal";
import { usePool } from "../hooks/usePool";
import { useEthers } from "../hooks/useEthers";
import { useKeepers } from "../hooks/useKeepers";
import { switchNetwork, NETWORKS, TOKENS } from "../utils/constants";
import { formatTime, formatNumber } from "../utils/formats";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState("");
  const [timeLeft, setTimeLeft] = useState({});
  const [activeNetwork, setActiveNetwork] = useState(NETWORKS.BSC);
  const [power, setPower] = useState({ pow: 0, pos: 0, referrals: 0 });
  const [newPool, setNewPool] = useState({
    name: "",
    apy: "",
    capacity: "",
    duration: "",
    network: "BSC",
  });

  // Hooks
  const { provider, account, connectWallet } = useEthers();
  const { pool, loading } = usePool("001");

  // Auto-refresh pools
  useKeepers(() => console.log("🔁 Refreshing pool data..."), 60000);

  // Default mock pools
  const [pools, setPools] = useState([
    { name: "Ethereum Pool", apy: 12, capacity: 100, filled: 75, duration: 7, token: TOKENS.ETH, network: NETWORKS.ETH },
    { name: "USDT Pool", apy: 9, capacity: 200, filled: 120, duration: 14, token: TOKENS.USDT, network: NETWORKS.BSC },
    { name: "BNB Pool", apy: 15, capacity: 150, filled: 130, duration: 30, token: TOKENS.BNB, network: NETWORKS.BSC },
    { name: "Solana Pool", apy: 10, capacity: 300, filled: 210, duration: 21, token: TOKENS.SOL, network: NETWORKS.SOL },
  ]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};
      pools.forEach((pool) => {
        updated[pool.name] = (timeLeft[pool.name] || pool.duration * 86400) - 1;
      });
      setTimeLeft(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [pools, timeLeft]);

  // Auto-switch network when wallet connects
  useEffect(() => {
    if (account && activeNetwork?.chainId) {
      switchNetwork(`0x${activeNetwork.chainId.toString(16)}`);

      // ✅ Send PoW message for wallet connection (Proof-of-Work)
      sendPowerMessage("bsc", "mainnet", account, "signup");
      console.log(`🔥 PoW (signup) message sent for ${account}`);
    }
  }, [account, activeNetwork]);

  // Create new pool
  const handleCreatePool = () => {
    if (!newPool.name || !newPool.apy || !newPool.capacity || !newPool.duration)
      return alert("⚠️ Please fill in all pool fields.");
    const selectedNetwork = NETWORKS[newPool.network] || NETWORKS.BSC;
    setPools([...pools, { ...newPool, filled: 0, network: selectedNetwork }]);
    setNewPool({ name: "", apy: "", capacity: "", duration: "", network: "BSC" });
  };

  // ✅ Referral System (Proof-of-Work for referral)
  const handleReferral = async () => {
    if (!account) return alert("Connect your wallet first!");
    const friendAddress = prompt("Enter your friend's wallet address to refer:");
    if (!friendAddress) return;

    await sendPowerMessage("bsc", "mainnet", account, `referral:${friendAddress}`);
    alert(`Referral sent to ${friendAddress}!`);
    setPower((prev) => ({ ...prev, referrals: prev.referrals + 1 }));
  };

  // ✅ Handle deposit and trigger PoS
  const handleDeposit = async (pool) => {
    if (!account) return alert("Connect wallet first!");
    setActiveNetwork(pool.network);
    await switchNetwork(`0x${pool.network.chainId.toString(16)}`);
    setSelectedPool(pool.name);
    setDepositOpen(true);

    // ✅ Send PoS (Proof-of-Stake) after deposit
    await sendPowerMessage("bsc", "mainnet", account, `stake:${pool.name}`);
    console.log(`🪙 PoS (stake) message sent for pool ${pool.name}`);
    setPower((prev) => ({ ...prev, pos: prev.pos + 1 }));
  };

  if (loading) return <div className="dashboard-wrapper">Loading pools...</div>;

  // Badge color per network
  const getBadgeColor = (network) => {
    switch (network.name) {
      case "Ethereum":
        return "badge-eth";
      case "Binance Smart Chain":
        return "badge-bsc";
      case "Solana":
        return "badge-sol";
      default:
        return "badge-default";
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1>💠 Active Staking Pools 💠</h1>
        <div className={`network-badge ${getBadgeColor(activeNetwork)}`}>
          🛰️ {activeNetwork.name}
        </div>
      </div>

      {/* Wallet connection */}
      {!account ? (
        <button className="wallet-btn" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <p className="wallet-connected">
          Connected: {account.slice(0, 6)}...{account.slice(-4)} <br />
          <small>Network: {activeNetwork.name}</small>
        </p>
      )}

      {/* Power Stats */}
      {account && (
        <div className="power-stats">
          <h3>⚡ Your Power Stats</h3>
          <p>Proof-of-Work: {power.pow}</p>
          <p>Proof-of-Stake: {power.pos}</p>
          <p>Referrals: {power.referrals}</p>
          <button className="referral-btn" onClick={handleReferral}>
            Refer a Friend (PoW)
          </button>
        </div>
      )}

      {/* Pool creation */}
      <div className="create-pool-section">
        <h2>Create New Pool</h2>
        <div className="create-pool-form">
          <input
            type="text"
            placeholder="Pool Name"
            value={newPool.name}
            onChange={(e) => setNewPool({ ...newPool, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="APY (%)"
            value={newPool.apy}
            onChange={(e) => setNewPool({ ...newPool, apy: e.target.value })}
          />
          <input
            type="number"
            placeholder="Capacity"
            value={newPool.capacity}
            onChange={(e) => setNewPool({ ...newPool, capacity: e.target.value })}
          />
          <input
            type="number"
            placeholder="Duration (days)"
            value={newPool.duration}
            onChange={(e) => setNewPool({ ...newPool, duration: e.target.value })}
          />
          <select
            value={newPool.network}
            onChange={(e) => setNewPool({ ...newPool, network: e.target.value })}
          >
            <option value="BSC">Binance Smart Chain</option>
            <option value="ETH">Ethereum</option>
            <option value="SOL">Solana</option>
          </select>
          <button onClick={handleCreatePool}>Create Pool</button>
        </div>
      </div>

      {/* Pools Display */}
      <div className="pool-grid">
        {pools.map((pool, index) => (
          <div key={index} className="pool-card">
            <h2>{pool.name}</h2>
            <div className="pool-stats">
              <p><strong>Token:</strong> {pool.token.symbol}</p>
              <p><strong>Network:</strong> {pool.network.name}</p>
              <p><strong>APY:</strong> {pool.apy}%</p>
              <p>
                <strong>Pool Filled:</strong> {formatNumber(pool.filled)}/{formatNumber(pool.capacity)}
              </p>
              <p className="timer">
                ⏳ {formatTime(timeLeft[pool.name] || pool.duration * 86400)}
              </p>
            </div>
            <div className="pool-actions">
              <button onClick={() => handleDeposit(pool)}>Deposit</button>
              <button
                onClick={async () => {
                  if (!account) return alert("Connect wallet first!");
                  setActiveNetwork(pool.network);
                  await switchNetwork(`0x${pool.network.chainId.toString(16)}`);
                  setSelectedPool(pool.name);
                  setWithdrawOpen(true);
                }}
              >
                Withdraw
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        poolName={selectedPool}
      />
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        poolName={selectedPool}
      />
    </div>
  );
};

export default Dashboard;

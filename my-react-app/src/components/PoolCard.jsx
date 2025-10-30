import React from "react";
import "../styles/Dashboard.css";
import { abiLoader } from "../utils/abiLoader";
import { NETWORK, TOKEN_ADDRESSES, POOL_ADDRESSES } from "../utils/constants";
import { formatNumber } from "../utils/format";
import { switchNetwork } from "../utils/switchNetwork";
import { ethers } from "ethers";

const PoolCard = ({ name, apy, capacity, filled, onDeposit, onWithdraw }) => {
  const progress = Math.min((filled / capacity) * 100, 100);

  // === Handle Deposit ===
  const handleDeposit = async () => {
    try {
      // Ensure user is connected to correct network
      await switchNetwork();

      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Get pool contract dynamically
      const poolAddress = POOL_ADDRESSES[name];
      const poolAbi = abiLoader("Pool");
      const poolContract = new ethers.Contract(poolAddress, poolAbi, signer);

      // Example deposit transaction (replace amount as needed)
      const amount = ethers.parseUnits("0.1", 18); // 0.1 token
      const tx = await poolContract.deposit(amount);
      await tx.wait();

      alert("Deposit successful!");
      if (onDeposit) onDeposit();
    } catch (err) {
      console.error("Deposit error:", err);
      alert("Deposit failed. Check console for details.");
    }
  };

  // === Handle Withdraw ===
  const handleWithdraw = async () => {
    try {
      await switchNetwork();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const poolAddress = POOL_ADDRESSES[name];
      const poolAbi = abiLoader("Pool");
      const poolContract = new ethers.Contract(poolAddress, poolAbi, signer);

      const amount = ethers.parseUnits("0.05", 18); // Example withdraw amount
      const tx = await poolContract.withdraw(amount);
      await tx.wait();

      alert("Withdraw successful!");
      if (onWithdraw) onWithdraw();
    } catch (err) {
      console.error("Withdraw error:", err);
      alert("Withdraw failed. Check console for details.");
    }
  };

  return (
    <div className="pool-card">
      <h2>{name}</h2>
      <p className="pool-stat">APY: {apy}%</p>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="pool-capacity">
        {formatNumber(filled)}/{formatNumber(capacity)} Filled
      </p>

      <div className="pool-actions">
        <button onClick={handleDeposit}>Stake Now</button>
        <button onClick={handleWithdraw}>Withdraw</button>
      </div>
    </div>
  );
};

export default PoolCard;



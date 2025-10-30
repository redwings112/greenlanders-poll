import React, { useState } from "react";
import "../../styles/PollDetails.css";

const DepositPanel = ({ poolName, onDeposit }) => {
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("7");

  const handleDeposit = () => {
    if (!amount) return alert("Enter amount to deposit");
    onDeposit({ poolName, amount, duration });
  };

  return (
    <div className="deposit-panel card">
      <h2>Deposit to {poolName}</h2>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <select value={duration} onChange={(e) => setDuration(e.target.value)}>
        <option value="2">2 hours</option>
        <option value="3">3 hours</option>
        <option value="6">6 hours</option>
        <option value="12">12 hours</option>
        <option value="24">24 hours</option>
        <option value="3">3 Days</option>
        <option value="5">5 Days</option>
        <option value="7">7 Days</option>
        <option value="14">14 Days</option>
        <option value="30">30 Days</option>
        <option value="90">90 Days</option>
      </select>
      <button onClick={handleDeposit}>Confirm Deposit</button>
    </div>
  );
};

export default DepositPanel;

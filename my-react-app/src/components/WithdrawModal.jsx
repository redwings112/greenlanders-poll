import React, { useState } from "react";
import "../styles/WithdrawModal.css";

const WithdrawModal = ({ open, onClose, poolName }) => {
  const [amount, setAmount] = useState("");

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Withdraw from {poolName}</h2>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={() => alert(`Withdrew ${amount} from ${poolName}`)}>
            Confirm Withdraw
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;


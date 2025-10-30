import React from "react";
import { motion } from "framer-motion";
import { X, Wallet } from "lucide-react";
import "../styles/WalletModal.css";
import { useWallet } from "../hooks/useWallet";

const WalletModal = ({ open, onClose }) => {
  const { connectWallet, connectedWallet } = useWallet();

  if (!open) return null;

  return (
    <div className="wallet-overlay" onClick={onClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="wallet-modal"
      >
        <div className="wallet-header">
          <h3>Connect Wallet</h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        {!connectedWallet ? (
          <>
            <p className="wallet-text">Choose your preferred wallet:</p>
            <div className="wallet-options">
              <button
                className="wallet-option"
                onClick={() => connectWallet("MetaMask")}
              >
                <Wallet size={18} />
                <span>MetaMask</span>
              </button>

              <button
                className="wallet-option"
                onClick={() => connectWallet("WalletConnect")}
              >
                <Wallet size={18} />
                <span>WalletConnect</span>
              </button>
            </div>
          </>
        ) : (
          <div className="wallet-connected">
            <p>Connected Wallet:</p>
            <h4>{connectedWallet}</h4>
            <button onClick={onClose} className="close-wallet-btn">
              Continue
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WalletModal;

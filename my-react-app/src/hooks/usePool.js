import { useState } from "react";
import { ethers } from "ethers";
import { useEthers } from "./useEthers";
import { loadABI } from "../utils/abiLoader";
import { NETWORKS } from "../utils/constants";


export const usePool = () => {
  const { provider, signer, chainId } = useEthers();
  const [contract, setContract] = useState(null);

  // -------------------------------
  // ⚙️ Load Pool Contract Dynamically
  // -------------------------------

  
  const initPoolContract = async (tokenSymbol) => {
    try {
      const network =
        Object.values(NETWORKS).find((n) => n.token === tokenSymbol) || NETWORKS.ETHEREUM;

      const abi = await loadABI("stakingPool");
      const contractInstance = new ethers.Contract(
        network.poolAddress,
        abi,
        signer || provider
      );
      setContract(contractInstance);
      return contractInstance;
    } catch (err) {
      console.error("❌ Failed to load pool contract:", err);
      return null;
    }
  };

  // -------------------------------
  // 📊 Get All Pools
  // -------------------------------
  const getAllPools = async () => {
    // Replace this mock data with on-chain fetching logic
    return [
      {
        id: 1,
        name: "Ethereum Staking Pool",
        apy: 12,
        tokenSymbol: "ETH",
        startDate: "2025-10-01",
        endDate: "2025-11-01",
        totalStaked: 320,
        status: "active",
      },
      {
        id: 2,
        name: "BNB Yield Pool",
        apy: 15,
        tokenSymbol: "BNB",
        startDate: "2025-10-10",
        endDate: "2025-10-25",
        totalStaked: 270,
        status: "ending_soon",
      },
      {
        id: 3,
        name: "USDT Stable Pool",
        apy: 6,
        tokenSymbol: "USDT",
        startDate: "2025-09-20",
        endDate: "2025-12-01",
        totalStaked: 540,
        status: "active",
      },
      {
        id: 4,
        name: "BTC Staking Pool",
        apy: 10,
        tokenSymbol: "BTC",
        startDate: "2025-09-10",
        endDate: "2025-11-10",
        totalStaked: 410,
        status: "active",
      },
      {
        id: 5,
        name: "Solana Staking Pool",
        apy: 9,
        tokenSymbol: "SOL",
        startDate: "2025-10-05",
        endDate: "2025-11-20",
        totalStaked: 280,
        status: "active",
      },
    ];
  };

  // -------------------------------
  // 💰 Stake Function
  // -------------------------------
   const stakeTokens = async (amount) => {
    try {
      const tx = await poolContract.stake(amount);
      await tx.wait();

      // ✅ Send PoS message when first stake happens
      await sendPowerMessage("bsc", "mainnet", await signer.getAddress(), "stake");

      console.log("✅ Stake successful and PoS message sent");
    } catch (err) {
      console.error("❌ Stake error:", err);
    }
  };


  return { getAllPools, stakeTokens };
};

// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useEthers } from "../../hooks/useEthers";
import { usePool } from "../../hooks/usePool";
import { useKeepers } from "../../hooks/useKeepers";
import "../../styles/Admin.css";

const Admin = () => {
  const { account, provider, connectWallet } = useEthers();
  const { pool, allPools } = usePool(); // allPools = simulated or fetched pools
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalStaked: 0,
    totalGains: 0,
    totalLosses: 0,
    activePools: [],
  });

  // 🧠 Auto-refresh admin data every 30 seconds
  useKeepers(() => {
    console.log("⏳ Admin data refreshed");
    fetchAdminData();
  }, 30000);

  useEffect(() => {
    fetchAdminData();
  }, [allPools, account]);

  // === Fetch data from pools (simulated for now) ===
  const fetchAdminData = () => {
    if (!allPools || allPools.length === 0) return;

    // Example transaction logs (could come from contract events)
    const sampleTx = [
      { id: 1, pool: "Ethereum Pool", type: "Deposit", amount: 1.2, profit: 0.15, date: "2025-10-15" },
      { id: 2, pool: "BNB Pool", type: "Withdraw", amount: 0.5, profit: -0.02, date: "2025-10-12" },
      { id: 3, pool: "USDT Pool", type: "Deposit", amount: 1000, profit: 0.10, date: "2025-10-10" },
    ];

    const totalStaked = sampleTx.reduce(
      (sum, tx) => (tx.type === "Deposit" ? sum + tx.amount : sum),
      0
    );
    const totalGains = sampleTx.reduce(
      (sum, tx) => (tx.profit > 0 ? sum + tx.profit : sum),
      0
    );
    const totalLosses = sampleTx.reduce(
      (sum, tx) => (tx.profit < 0 ? sum + Math.abs(tx.profit) : sum),
      0
    );

    const activePools = allPools.map((p) => p.name);

    setTransactions(sampleTx);
    setSummary({ totalStaked, totalGains, totalLosses, activePools });
  };

  return (
    <div className="admin-page min-h-screen bg-gradient-to-br from-teal-50 to-aquamarine-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* === Header Section === */}
        <div className="admin-header mb-8 flex flex-col md:flex-row md:justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              {account ? `Connected as ${account}` : "Not connected"}
            </p>
          </div>

          {!account && (
            <button
              onClick={connectWallet}
              className="mt-4 md:mt-0 bg-teal-600 text-white px-5 py-2 rounded-xl hover:bg-teal-700 transition"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* === Summary Cards === */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="stat-card bg-white shadow-lg rounded-2xl p-5 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Total Staked</h2>
            <p className="text-3xl font-bold text-teal-600 mt-2">{summary.totalStaked} ETH</p>
          </div>

          <div className="stat-card bg-white shadow-lg rounded-2xl p-5 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Total Gains</h2>
            <p className="text-3xl font-bold text-green-600 mt-2">+{summary.totalGains} ETH</p>
          </div>

          <div className="stat-card bg-white shadow-lg rounded-2xl p-5 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Total Losses</h2>
            <p className="text-3xl font-bold text-red-500 mt-2">-{summary.totalLosses} ETH</p>
          </div>
        </div>

        {/* === Active Pools === */}
        <div className="active-pools mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Active Staking Pools</h2>
          <div className="flex flex-wrap gap-3">
            {summary.activePools.length > 0 ? (
              summary.activePools.map((pool, idx) => (
                <div
                  key={idx}
                  className="bg-white shadow rounded-xl px-4 py-2 border border-gray-200 text-gray-700"
                >
                  {pool}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No active pools found</p>
            )}
          </div>
        </div>

        {/* === Transaction History === */}
        <div className="transaction-section bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-teal-100 text-gray-700 uppercase text-sm">
                  <th className="p-3">Date</th>
                  <th className="p-3">Pool</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Profit</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3">{tx.date}</td>
                      <td className="p-3">{tx.pool}</td>
                      <td
                        className={`p-3 font-semibold ${
                          tx.type === "Deposit"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {tx.type}
                      </td>
                      <td className="p-3">{tx.amount}</td>
                      <td
                        className={`p-3 ${
                          tx.profit >= 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {tx.profit >= 0 ? `+${tx.profit}` : tx.profit}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

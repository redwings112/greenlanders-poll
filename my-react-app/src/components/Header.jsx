import React, { useState } from "react";
import { Wallet, Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import Sidebar from "./Sidebar";
import WalletModal from "./WalletModal";
import "../styles/Header.css";

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="logo">
            GLNDRS
          </Link>

          {/* Navigation Links */}
          <nav className="nav-links">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/pools"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Pools
            </NavLink>

            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Admin
            </NavLink>
          </nav>

          {/* Wallet Button */}
          <button
            onClick={() => setWalletModalOpen(true)}
            className="wallet-btn"
          >
            <Wallet size={18} />
            <span>Connect Wallet</span>
          </button>

          {/* Mobile Menu Button */}
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={26} />
          </button>
        </div>
      </header>

      {/* Sidebar & Wallet Modal */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <WalletModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </>
  );
};

export default Header;

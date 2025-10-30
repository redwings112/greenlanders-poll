import React from "react";
import { motion } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-teal-500 to-emerald-500 text-white p-6 shadow-lg z-50"
        >
          <h2 className="text-2xl font-bold mb-8">GLNDRS</h2>
          <nav className="flex flex-col space-y-6 text-lg">
            <a href="#" className="hover:text-gray-200" onClick={onClose}>Dashboard</a>
            <a href="/Pools" className="hover:text-gray-200" onClick={onClose}>Pools</a>
            <a href="#" className="hover:text-gray-200" onClick={onClose}>Stake</a>
            <a href="#" className="hover:text-gray-200" onClick={onClose}>Withdraw</a>
          </nav>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white text-xl"
          >
            ✕
          </button>
        </motion.div>
      )}
    </>
  );
};

export default Sidebar;

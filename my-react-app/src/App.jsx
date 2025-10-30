import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GetStarted from "./pages/GetStarted";
import Dashboard from "./pages/Dashboard";
import Pools from "./pages/Pools";
import AdminPanel from "./components/PoolDetails/AdminPanel";
import Header from "./components/Header";

const App = () => {
  return (
    <Router>
      <div className="app-container min-h-screen flex flex-col bg-gray-50">
        <Routes>
          {/* === Default Landing Page === */}
          <Route path="/" element={<GetStarted />} />

          {/* === Dashboard === */}
          <Route
            path="/dashboard"
            element={
              <>
                <Header />
                <Dashboard />
              </>
            }
          />

          {/* === Pools Page === */}
          <Route
            path="/pools"
            element={
              <>
                <Header />
                <Pools />
              </>
            }
          />

          {/* === Admin Page === */}
          <Route
            path="/admin"
            element={
              <>
                <Header />
                <AdminPanel />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

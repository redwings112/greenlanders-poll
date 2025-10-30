// src/components/Auth.jsx
import React, { useState } from "react";
import "../styles/Auth.css";
import { ethers } from "ethers";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("wallet"); // wallet | login | register | social
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  // wallet flow: get nonce -> sign -> verify
  const walletSignIn = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    setStatus("Requesting access...");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // fetch nonce
      const r = await fetch(`${API_BASE}/auth/nonce?address=${address}`);
      const json = await r.json();
      const nonce = json.nonce;

      // sign
      const message = `Sign this nonce to authenticate: ${nonce}`;
      const sig = await signer.signMessage(message);

      // verify
      const verifyResp = await fetch(`${API_BASE}/auth/wallet-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature: sig }),
      });
      const verifyJson = await verifyResp.json();
      if (verifyJson.token) {
        setStatus("Logged in!");
        localStorage.setItem("token", verifyJson.token);
        onAuth && onAuth(verifyJson.user);
      } else {
        setStatus("Login failed");
      }
    } catch (err) {
      console.error(err);
      setStatus("Wallet sign-in failed");
    }
  };

  const register = async () => {
    setStatus("Registering...");
    const r = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const j = await r.json();
    if (j.token) {
      localStorage.setItem("token", j.token);
      onAuth && onAuth(j.user);
      setStatus("Registered and logged in");
    } else {
      setStatus(j.error || "register failed");
    }
  };

  const login = async () => {
    setStatus("Logging in...");
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const j = await r.json();
    if (j.token) {
      localStorage.setItem("token", j.token);
      onAuth && onAuth(j.user);
      setStatus("Logged in");
    } else {
      setStatus(j.error || "login failed");
    }
  };

  const socialLogin = async () => {
    setStatus("Mock social login...");
    // This is a stub—swap with real OAuth flow (Google/Facebook)
    const r = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "social_user_" + Date.now(), password: "social" }),
    });
    const j = await r.json();
    if (j.token) {
      localStorage.setItem("token", j.token);
      onAuth && onAuth(j.user);
      setStatus("Social login success");
    } else setStatus("Social login failed");
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <h2 className="auth-title">GLNDRS — Sign in to Staking</h2>
        <p className="auth-sub">Use wallet, social, or username/password</p>

        <div className="auth-buttons">
          <button className="btn-wallet" onClick={() => { setMode("wallet"); walletSignIn(); }}>
            Connect Wallet
          </button>
          <button className="btn-social" onClick={socialLogin}>
            Sign in with Social (mock)
          </button>
        </div>

        <hr />

        <div className="auth-forms">
          <div className="small-note">Or use username/password</div>

          <input placeholder="username" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <div className="form-actions">
            <button onClick={login} className="btn-primary">Login</button>
            <button onClick={register} className="btn-outline">Register</button>
          </div>
        </div>

        <div className="status">{status}</div>
      </div>
    </div>
  );
}

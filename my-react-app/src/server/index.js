// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyMessage, recoverAddress } from "ethers";
import { sendPowerMessage } from "./hyperlaneService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

await db.read();

// --- util: create JWT
function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ---------- Wallet Nonce Endpoint ----------
app.get("/auth/nonce", async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: "address param required" });

  const nonce = nanoid(16);
  db.data.nonces[address.toLowerCase()] = nonce;
  await db.write();

  return res.json({ address, nonce });
});

// ---------- Wallet Verify (signature) ----------
app.post("/auth/wallet-verify", async (req, res) => {
  const { address, signature } = req.body;
  if (!address || !signature) return res.status(400).json({ error: "address & signature required" });

  const stored = db.data.nonces[address.toLowerCase()];
  if (!stored) return res.status(400).json({ error: "No nonce for this address. Request nonce first." });

  const message = `Sign this nonce to authenticate: ${stored}`;
  try {
    // verify signature
    const recovered = verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: "Signature verification failed" });
    }

    // create or update user
    let user = db.data.users.find((u) => u.address?.toLowerCase() === address.toLowerCase());
    const now = new Date().toISOString();
    if (!user) {
      user = {
        id: nanoid(),
        address: address.toLowerCase(),
        createdAt: now,
        powSignup: true,
        referrals: [],
        posStaked: false,
        metadata: {},
      };
      db.data.users.push(user);
    } else {
      user.lastLogin = now;
    }

    // clear nonce
    delete db.data.nonces[address.toLowerCase()];
    await db.write();

    // issue JWT
    const token = createToken({ sub: user.id, address: user.address });

    // Send Hyperlane PoW signup message (only when newly created)
    if (user.powSignup) {
      try {
        await sendPowerMessage(process.env.HYPERLANE_FROM_CHAIN || "bsc", process.env.HYPERLANE_TO_CHAIN || "mainnet", address, "signup");
      } catch (err) {
        console.error("Failed to send signup power message:", err);
      }
      // flip flag so we don't double-send next login
      user.powSignup = false;
      await db.write();
    }

    return res.json({ token, user });
  } catch (err) {
    console.error("wallet verify error:", err);
    return res.status(500).json({ error: "verification failed" });
  }
});

// ---------- Username/password registration ----------
app.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username & password required" });

  const exists = db.data.users.find((u) => u.username === username);
  if (exists) return res.status(400).json({ error: "username taken" });

  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: nanoid(),
    username,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
    powSignup: true,
    referrals: [],
    posStaked: false,
    metadata: {},
  };
  db.data.users.push(user);
  await db.write();

  const token = createToken({ sub: user.id });

  // send pow signup (email/social) via hyperlane
  try {
    await sendPowerMessage(process.env.HYPERLANE_FROM_CHAIN || "bsc", process.env.HYPERLANE_TO_CHAIN || "mainnet", username, "signup");
  } catch (err) {
    console.error("Failed send Power signup:", err);
  }

  res.json({ token, user });
});

// ---------- Username/password login ----------
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username & password required" });

  const user = db.data.users.find((u) => u.username === username);
  if (!user) return res.status(400).json({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "invalid credentials" });

  const token = createToken({ sub: user.id });
  return res.json({ token, user });
});

// ---------- Record Reward Event ----------
/**
 * Body:
 * { type: "referral"|"stake"|"signup", user: addressOrId, data: { ... } }
 */
app.post("/rewards/record", authMiddleware, async (req, res) => {
  const { type, user, data } = req.body;
  if (!type || !user) return res.status(400).json({ error: "type & user required" });

  const event = {
    id: nanoid(),
    type,
    user,
    data: data || {},
    recordedAt: new Date().toISOString(),
  };
  db.data.rewards.push(event);
  await db.write();

  // send hyperlane message
  try {
    await sendPowerMessage(process.env.HYPERLANE_FROM_CHAIN || "bsc", process.env.HYPERLANE_TO_CHAIN || "mainnet", user, type, data);
  } catch (err) {
    console.error("Hyperlane send failed:", err);
  }

  res.json({ ok: true, event });
});

// ---------- Protected user info ----------
app.get("/me", authMiddleware, async (req, res) => {
  const user = db.data.users.find((u) => u.id === req.user.sub || u.address === req.user.address);
  if (!user) return res.status(404).json({ error: "user not found" });
  res.json({ user });
});

// ---------- Simple referral endpoint ----------
app.post("/referral", authMiddleware, async (req, res) => {
  const { friendAddress } = req.body;
  if (!friendAddress) return res.status(400).json({ error: "friendAddress required" });

  const inviter = db.data.users.find((u) => u.id === req.user.sub);
  if (!inviter) return res.status(404).json({ error: "inviter not found" });

  inviter.referrals ||= [];
  inviter.referrals.push({ id: nanoid(), friend: friendAddress, at: new Date().toISOString() });
  await db.write();

  // record reward and send hyperlane message
  await sendPowerMessage(process.env.HYPERLANE_FROM_CHAIN || "bsc", process.env.HYPERLANE_TO_CHAIN || "mainnet", inviter.address || inviter.username, "referral", { friend: friendAddress });

  return res.json({ ok: true, inviter });
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});

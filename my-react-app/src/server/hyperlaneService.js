// server/hyperlaneService.js
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const HYPERLANE_ENABLED = process.env.HYPERLANE_ENABLED === "true";

/**
 * Placeholder/mocked hyperlane function.
 * If you add Hyperlane SDK to dependencies and configure credentials,
 * replace the body with actual MultiProvider/sendMessage logic.
 */
export async function sendPowerMessage(fromChain, toChain, userAddress, eventType, metadata = {}) {
  const payload = {
    user: userAddress,
    event: eventType,
    timestamp: new Date().toISOString(),
    meta: metadata,
  };

  // If Hyperlane is enabled and SDK available, send real message here.
  if (!HYPERLANE_ENABLED) {
    console.log("[Hyperlane-MOCK] would send:", { fromChain, toChain, payload });
    // simulate async delay
    await new Promise((r) => setTimeout(r, 800));
    return { ok: true, mock: true };
  }

  try {
    // Example: actual Hyperlane code would go here.
    // import { MultiProvider } from "@hyperlane-xyz/sdk";
    // ... configure providers and call sendMessage ...
    console.log("[Hyperlane] Sending message:", { fromChain, toChain, payload });
    // simulate
    await new Promise((r) => setTimeout(r, 800));
    return { ok: true };
  } catch (err) {
    console.error("Hyperlane send failed:", err);
    throw err;
  }
}

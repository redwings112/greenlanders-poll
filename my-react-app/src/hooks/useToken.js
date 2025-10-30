// src/hooks/useToken.js
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { loadABI } from "../utils/abiLoader";
import { TOKEN_ADDRESSES, TOKENS } from "../utils/constants";

export const useToken = (tokenSymbol, provider) => {
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState("0");

  // ✅ Correctly use tokenSymbol instead of symbol
  const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];
  const token = TOKENS[tokenSymbol];

  const getTokenContract = (providerOrSigner, abi) => {
    if (!tokenAddress) return null;
    return new ethers.Contract(tokenAddress, abi, providerOrSigner);
  };

  useEffect(() => {
    const setupToken = async () => {
      try {
        if (!tokenSymbol || !provider) return;
        const tokenInfo = TOKEN_ADDRESSES[tokenSymbol];
        if (!tokenInfo) {
          console.error(`❌ Token not found: ${tokenSymbol}`);
          return;
        }

        const abi = await loadABI("ERC20");
        const contractInstance = new ethers.Contract(
          tokenInfo,
          abi,
          provider
        );
        setContract(contractInstance);

        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const rawBalance = await contractInstance.balanceOf(accounts[0]);
          setBalance(ethers.formatUnits(rawBalance, token.decimals || 18));
        }
      } catch (err) {
        console.error(`⚠️ Error loading token ${tokenSymbol}:`, err);
      }
    };

    setupToken();
  }, [tokenSymbol, provider]);

  return { contract, balance, tokenAddress, token, getTokenContract };
};

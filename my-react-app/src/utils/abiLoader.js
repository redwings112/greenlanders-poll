// utils/abiLoader.js
export const loadABI = async (contractName) => {
  switch (type) {
    case "staking":
      return [
        // simplified example ABI
        "function stake() payable",
        "function withdraw(uint256 amount)",
        "function getUserStake(address user) view returns (uint256)",
      ];
    default:
      throw new Error(`ABI type not found: ${type}`);
  } try {
    const module = await import(`../abis/${contractName}.json`);

    return module.default || module;
  } catch (err) {
    console.error(`❌ Failed to load ABI for ${contractName}:`, err);
    return null;
  }
};

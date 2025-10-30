// scripts/deploy-power-registry.js
const hre = require("hardhat");

async function main() {
  await hre.run("compile");

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const PowerRegistry = await hre.ethers.getContractFactory("PowerRegistry");
  const registry = await PowerRegistry.deploy();
  await registry.deployed();

  console.log("PowerRegistry deployed to:", registry.address);

  // optional: set messenger now (owner is deployer). You can change later via owner.
  // const messengerAddress = "0x..."; // set your mailbox/relayer here
  // await registry.setMessenger(messengerAddress);
  // console.log("Messenger set to:", messengerAddress);

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GLNDRS Vault", function () {
  let owner, user, token, vault, strategy, pool;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    token = await ERC20Mock.deploy("MockToken", "MTK", owner.address, ethers.parseEther("100000"));

    const PoolMock = await ethers.getContractFactory("AavePoolMock");
    pool = await PoolMock.deploy();

    const Vault = await ethers.getContractFactory("GLNDRSVault");
    vault = await Vault.deploy(token.target, "GLNDRS Vault", "GLV", pool.target);
  });

  it("should allow deposits", async () => {
    await token.transfer(user.address, ethers.parseEther("100"));
    await token.connect(user).approve(vault.target, ethers.parseEther("100"));
    await vault.connect(user).deposit(ethers.parseEther("50"), user.address);
    expect(await vault.totalAssets()).to.equal(ethers.parseEther("50"));
  });

  it("should simulate harvest", async () => {
    await vault.harvest();
  });
});

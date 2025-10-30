it("should simulate yield and allow vault harvest", async () => {
  const { vault, strategy, token, pool, owner, user } = await setup();
  
  await token.mint(user.address, ethers.parseEther("1000"));
  await token.connect(user).approve(vault.getAddress(), ethers.parseEther("500"));
  await vault.connect(user).deposit(ethers.parseEther("500"), user.address);

  // Inject yield
  await token.mint(owner.address, ethers.parseEther("50"));
  await token.connect(owner).approve(await pool.getAddress(), ethers.parseEther("50"));
  await pool.connect(owner).simulateYield(ethers.parseEther("50"));

  // Now harvest yield
  await vault.harvest();

  const yieldEvent = await strategy.queryFilter("Harvest");
  console.log("Yield ->", yieldEvent[0].args);
});

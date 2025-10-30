// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


interface IERC20Simple {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
}


/// @title AavePoolMock - Simulates Aave's pool with per-user aToken tracking
/// @notice Used for testing yield farming and vault compounding strategies
contract AavePoolMock is Ownable {
    IERC20 public immutable underlying;
    ERC20 public immutable aToken;

    uint256 public totalDeposits;
    uint256 public simulatedYieldRate; // e.g., 500 = 5% simulated yield

    mapping(address => uint256) public userDeposits;

    event Supplied(address indexed asset, address indexed user, uint256 amount);
    event Withdrawn(address indexed asset, address indexed user, uint256 amount);
    event YieldSimulated(uint256 totalAdded);
    event InterestRateUpdated(uint256 newRate);

    constructor(address _asset) Ownable(msg.sender) {
        underlying = IERC20(_asset);
        aToken = new MockAToken(_asset);
    }

    // === Supply ===
    function supply(address asset, uint256 amount, address onBehalfOf, uint16) external {
        require(asset == address(underlying), "Invalid asset");
        require(amount > 0, "Zero deposit");

        // transfer from depositor
        underlying.transferFrom(msg.sender, address(this), amount);
        MockAToken(address(aToken)).mint(onBehalfOf, amount);

        totalDeposits += amount;
        userDeposits[onBehalfOf] += amount;

        emit Supplied(asset, onBehalfOf, amount);
    }

    // === Withdraw ===
    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        require(asset == address(underlying), "Invalid asset");
        require(amount > 0, "Zero withdraw");
        require(MockAToken(address(aToken)).balanceOf(msg.sender) >= amount, "Not enough balance");

        MockAToken(address(aToken)).burn(msg.sender, amount);
        underlying.transfer(to, amount);

        totalDeposits -= amount;
        userDeposits[msg.sender] -= amount;

        emit Withdrawn(asset, to, amount);
        return amount;
    }

    // === Simulate Interest Growth ===
    /// @notice Adds simulated yield (like interest from Aave)
    function simulateYield(uint256 amount) external onlyOwner {
        require(amount > 0, "Zero yield");
        underlying.transferFrom(msg.sender, address(this), amount);
        emit YieldSimulated(amount);
    }

    // === Adjust Interest Rate (for visualization/testing) ===
    function setSimulatedYieldRate(uint256 _rate) external onlyOwner {
        simulatedYieldRate = _rate;
        emit InterestRateUpdated(_rate);
    }

    /// @notice Simulate auto-compounding yield
    function accrueInterest() external onlyOwner {
        uint256 yield = (totalDeposits * simulatedYieldRate) / 10000;
        if (yield > 0) {
            MockAToken(address(aToken)).mint(address(this), yield);
            totalDeposits += yield;
            emit YieldSimulated(yield);
        }
    }
}

/// @title MockAToken
/// @notice Simple ERC20 representing interest-bearing Aave aTokens
contract MockAToken is ERC20, Ownable {
    IERC20 public immutable underlying;

    constructor(address _underlying)
        ERC20("Mock Aave Token", "aTOKEN")
        Ownable(msg.sender)
    {
        underlying = IERC20(_underlying);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

/**
 * @title AavePoolMock
 * @notice Minimal Aave-like pool for local testing. Supports:
 *  - supply(asset, amount, onBehalfOf, referralCode)
 *  - withdraw(asset, amount, to) -> returns withdrawn amount
 *  - simulateYield(asset, amount) -> add "interest" to the pool's held tokens
 *
 * The pool simply holds the supplied asset and tracks supplied balances per address.
 * This is NOT production code — only a test helper.
 */
contract AavePoolMock {
    // asset => user => amount
    mapping(address => mapping(address => uint256)) public userSupply;
    // asset => total supplied
    mapping(address => uint256) public totalSupplyAsset;

    event Supplied(address indexed asset, address indexed from, address indexed to, uint256 amount);
    event Withdrawn(address indexed asset, address indexed to, uint256 amount);
    event YieldSimulated(address indexed asset, uint256 amount);

    /// @notice Supply asset into the pool. Transfers tokens from `msg.sender` into this contract.
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 /*referralCode*/) external {
        require(amount > 0, "supply: zero");
        // pull tokens from msg.sender
        bool ok = IERC20Simple(asset).transferFrom(msg.sender, address(this), amount);
        require(ok, "supply: transferFrom failed");

        userSupply[asset][onBehalfOf] += amount;
        totalSupplyAsset[asset] += amount;

        emit Supplied(asset, msg.sender, onBehalfOf, amount);
    }

    /// @notice Withdraw underlying asset. Attempts to transfer `amount` to `to`.
    /// Returns actual withdrawn amount (may be less if pool has less).
    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        uint256 bal = IERC20Simple(asset).balanceOf(address(this));
        uint256 toWithdraw = amount;
        if (amount == type(uint256).max) {
            toWithdraw = bal;
        } else {
            if (amount > bal) {
                toWithdraw = bal;
            }
        }
        require(toWithdraw > 0, "withdraw: nothing");
        // For simplicity, do not decrement per-user supply in this mock (strategy uses it).
        totalSupplyAsset[asset] -= toWithdraw;
        bool ok = IERC20Simple(asset).transfer(to, toWithdraw);
        require(ok, "withdraw: transfer failed");
        emit Withdrawn(asset, to, toWithdraw);
        return toWithdraw;
    }

    /// @notice Add some tokens to the pool to simulate accrued yield (transfer tokens to this contract before calling)
    function simulateYield(address asset, uint256 amount) external {
        // This function assumes the caller has already transferred tokens to this contract
        // Or in tests, you can call ERC20Mock.mint(poolAddress, amount) to increase balance.
        // For convenience, we will just increase the totalSupplyAsset, assuming tokens exist in the contract.
        totalSupplyAsset[asset] += amount;
        emit YieldSimulated(asset, amount);
    }

    /// helper: view pool balance for asset
    function assetBalance(address asset) external view returns (uint256) {
        return IERC20Simple(asset).balanceOf(address(this));
    }
}

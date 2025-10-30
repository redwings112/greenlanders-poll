// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IAavePool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AaveStrategy is Ownable {
    IERC20 public immutable asset;
    IAavePool public immutable pool;
    address public vault;

    uint256 public totalDeposited;
    uint256 public principalBalance;
    uint256 public performanceFee = 200; // 2%
    uint256 public constant FEE_DENOMINATOR = 10000;

    event Supplied(address indexed asset, uint256 amount);
    event Withdrawn(address indexed asset, uint256 amount);
    event Harvest(address indexed asset, uint256 yieldAmount, uint256 feeAmount);

    modifier onlyVault() {
        require(msg.sender == vault, "Not vault");
        _;
    }

    constructor(address _asset, address _pool) Ownable(msg.sender) {
        asset = IERC20(_asset);
        pool = IAavePool(_pool);
        vault = msg.sender;
    }

    /// @notice Supply tokens from vault into Aave pool
    function deposit(uint256 amount) external onlyVault {
        require(amount > 0, "zero deposit");
        asset.approve(address(pool), amount);
        pool.supply(address(asset), amount, address(this), 0);
        totalDeposited += amount;
        principalBalance += amount;
        emit Supplied(address(asset), amount);
    }

    /// @notice Withdraw underlying from pool back to vault
    function withdraw(uint256 amount) external onlyVault returns (uint256) {
        uint256 withdrawn = pool.withdraw(address(asset), amount, vault);
        totalDeposited -= withdrawn;
        principalBalance -= withdrawn;
        emit Withdrawn(address(asset), withdrawn);
        return withdrawn;
    }

    /// @notice Calculates yield and distributes performance fee
    function harvest() external onlyVault {
        uint256 currentBalance = IERC20(address(asset)).balanceOf(address(pool));
        require(currentBalance >= principalBalance, "Pool under water");

        uint256 yieldAmount = currentBalance - principalBalance;
        if (yieldAmount == 0) return;

        // withdraw yield portion from pool to strategy
        pool.withdraw(address(asset), yieldAmount, address(this));

        uint256 feeAmount = (yieldAmount * performanceFee) / FEE_DENOMINATOR;
        uint256 netYield = yieldAmount - feeAmount;

        // send fee to vault owner (as reward)
        if (feeAmount > 0) {
            asset.transfer(owner(), feeAmount);
        }

        // redeposit remaining yield back into the pool to compound
        if (netYield > 0) {
            asset.approve(address(pool), netYield);
            pool.supply(address(asset), netYield, address(this), 0);
            principalBalance += netYield;
        }

        emit Harvest(address(asset), yieldAmount, feeAmount);
    }

    function setPerformanceFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "fee too high");
        performanceFee = _fee;
    }
}

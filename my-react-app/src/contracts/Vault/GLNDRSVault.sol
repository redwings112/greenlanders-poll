// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AaveStrategy.sol";

contract GLNDRSVault is ERC4626, Ownable {
    AaveStrategy public strategy;

    event Harvest(uint256 yieldAmount, uint256 feeAmount);

    constructor(address _asset, string memory _name, string memory _symbol, address _pool)
        ERC4626(IERC20(_asset))
        ERC20(_name, _symbol)
        Ownable(msg.sender)
    {
        strategy = new AaveStrategy(_asset, _pool);
    }

    function deposit(uint256 assets, address receiver) public override returns (uint256) {
        uint256 shares = super.deposit(assets, receiver);
        IERC20(asset()).approve(address(strategy), assets);
        strategy.deposit(assets);
        return shares;
    }

    function withdraw(uint256 assets, address receiver, address owner)
        public
        override
        returns (uint256)
    {
        uint256 shares = super.withdraw(assets, receiver, owner);
        strategy.withdraw(assets);
        return shares;
    }

    function harvest() external {
        strategy.harvest();
        emit Harvest(0, 0); // placeholder for event structure
    }

    function setPerformanceFee(uint256 newFee) external onlyOwner {
        strategy.setPerformanceFee(newFee);
    }
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * PowerRegistry.sol
 *
 * A secure on-chain registry that tracks user "power" from multiple sources:
 *  - PoW (signup / tasks)
 *  - PoS (staking)
 *  - Referral rewards
 *
 * Designed to be updated by an authorized cross-chain messenger (e.g., Hyperlane relayer/mailbox).
 *
 * Admin (owner) can set the messenger address which is the only address allowed
 * to call relayUpdate(...) to update user power (prevents spoofing).
 */

import "@openzeppelin/contracts/access/Ownable.sol";

contract PowerRegistry is Ownable {
    struct Power {
        uint256 pow;
        uint256 pos;
        uint256 referral;
    }

    // user => power breakdown
    mapping(address => Power) private _powers;

    // messenger (Hyperlane mailbox / relayer) that is allowed to call relay functions
    address public messenger;

    // total counters (for quick metrics)
    uint256 public totalPow;
    uint256 public totalPos;
    uint256 public totalReferral;

    // events
    event MessengerUpdated(address indexed oldMessenger, address indexed newMessenger);
    event PowerUpdated(
        address indexed user,
        int256 powDelta,
        int256 posDelta,
        int256 referralDelta,
        uint256 newPow,
        uint256 newPos,
        uint256 newReferral,
        string reason,
        uint256 timestamp,
        address indexed updater // the messenger address
    );

    error NotMessenger();
    error ZeroAddress();

    modifier onlyMessenger() {
        if (msg.sender != messenger) revert NotMessenger();
        _;
    }

    /// @notice sets the messenger address that can call relayUpdate
    /// @param _messenger address of the messenger/relayer
    function setMessenger(address _messenger) external onlyOwner {
        if (_messenger == address(0)) revert ZeroAddress();
        address old = messenger;
        messenger = _messenger;
        emit MessengerUpdated(old, _messenger);
    }

    /// @notice Relay a power update for a user. Only callable by messenger.
    /// @dev Uses signed ints for deltas to allow negative adjustments if necessary.
    /// @param user user address whose power is being updated
    /// @param powDelta signed delta to pow component (can be negative)
    /// @param posDelta signed delta to pos component
    /// @param referralDelta signed delta to referral component
    /// @param reason optional short reason for audit (e.g., "signup","stake","referral")
    function relayUpdate(
        address user,
        int256 powDelta,
        int256 posDelta,
        int256 referralDelta,
        string calldata reason
    ) external onlyMessenger {
        if (user == address(0)) revert ZeroAddress();

        Power storage p = _powers[user];

        // apply powDelta
        if (powDelta != 0) {
            if (powDelta > 0) {
                uint256 inc = uint256(powDelta);
                p.pow += inc;
                totalPow += inc;
            } else {
                uint256 dec = uint256(-powDelta);
                if (dec > p.pow) p.pow = 0;
                else p.pow -= dec;
                // note: totalPow is an approximate global metric; if subtracting, clamp to 0
                if (dec > totalPow) totalPow = 0;
                else totalPow -= dec;
            }
        }

        // apply posDelta
        if (posDelta != 0) {
            if (posDelta > 0) {
                uint256 inc = uint256(posDelta);
                p.pos += inc;
                totalPos += inc;
            } else {
                uint256 dec = uint256(-posDelta);
                if (dec > p.pos) p.pos = 0;
                else p.pos -= dec;
                if (dec > totalPos) totalPos = 0;
                else totalPos -= dec;
            }
        }

        // apply referralDelta
        if (referralDelta != 0) {
            if (referralDelta > 0) {
                uint256 inc = uint256(referralDelta);
                p.referral += inc;
                totalReferral += inc;
            } else {
                uint256 dec = uint256(-referralDelta);
                if (dec > p.referral) p.referral = 0;
                else p.referral -= dec;
                if (dec > totalReferral) totalReferral = 0;
                else totalReferral -= dec;
            }
        }

        emit PowerUpdated(
            user,
            powDelta,
            posDelta,
            referralDelta,
            p.pow,
            p.pos,
            p.referral,
            reason,
            block.timestamp,
            msg.sender
        );
    }

    /// @notice Get power components for a user
    function getPower(address user) external view returns (uint256 pow, uint256 pos, uint256 referral, uint256 total) {
        Power memory p = _powers[user];
        pow = p.pow;
        pos = p.pos;
        referral = p.referral;
        unchecked {
            total = p.pow + p.pos + p.referral;
        }
    }

    /// @notice Get raw components (pow,pos,referral) for on-chain indexing
    function getComponents(address user) external view returns (Power memory) {
        return _powers[user];
    }

    /// @notice Admin can withdraw accidentally sent ETH
    function rescueETH(address to, uint256 amount) external onlyOwner {
        payable(to).transfer(amount);
    }

    /// @notice Admin can rescue ERC20 tokens accidentally sent
    function rescueERC20(address token, address to, uint256 amount) external onlyOwner {
        require(token != address(0), "zero token");
        (bool success, ) = token.call(abi.encodeWithSignature("transfer(address,uint256)", to, amount));
        require(success, "transfer failed");
    }

    receive() external payable {}
}

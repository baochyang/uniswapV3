// SPDX-License-Identifier: GPL-2.0-or-later

// pragma solidity 0.8.19;
pragma solidity 0.8.27;

import "./TickMath.sol";

// https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/Tick.sol

// https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/TickMath.sol

library Tick {

    // TickMath.sol

    // /// @dev The minimum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**-128
    // int24 internal constant MIN_TICK = -887272;
    // /// @dev The maximum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**128
    // int24 internal constant MAX_TICK = -MIN_TICK;

    // To get maximum liquidity between two ticks = maximum liquidity possible divided by number of ticks that are available

    function tickSpacingToMaxLiquidityPerTick(int24 tickSpacing) internal pure returns (uint128) {
        int24 minTick = (TickMath.MIN_TICK / tickSpacing) * tickSpacing;
        int24 maxTick = (TickMath.MAX_TICK / tickSpacing) * tickSpacing;
        uint24 numTicks = uint24((maxTick - minTick) / tickSpacing) + 1;
        return type(uint128).max / numTicks;

    }

}


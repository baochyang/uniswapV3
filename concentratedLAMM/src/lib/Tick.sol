// SPDX-License-Identifier: GPL-2.0-or-later

// pragma solidity 0.8.19;
pragma solidity 0.8.27;

import "./TickMath.sol";

// https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/Tick.sol

// https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/TickMath.sol

library Tick {

    // info stored for each initialized individual tick
    struct Info {
        // the total position liquidity that references this tick
        uint128 liquidityGross;
        // amount of net liquidity added (subtracted) when tick is crossed from left to right (right to left),
        int128 liquidityNet;
        // fee growth per unit of liquidity on the _other_ side of this tick (relative to the current tick)
        // only has relative meaning, not absolute — the value depends on when the tick is initialized
        uint256 feeGrowthOutside0X128;
        uint256 feeGrowthOutside1X128;


        //************************************ */


        // // the cumulative tick value on the other side of the tick
        // int56 tickCumulativeOutside;
        // // the seconds per unit of liquidity on the _other_ side of this tick (relative to the current tick)
        // // only has relative meaning, not absolute — the value depends on when the tick is initialized
        // uint160 secondsPerLiquidityOutsideX128;
        // // the seconds spent on the other side of the tick (relative to the current tick)
        // // only has relative meaning, not absolute — the value depends on when the tick is initialized
        // uint32 secondsOutside;


        //************************************ */


        // true iff the tick is initialized, i.e. the value is exactly equivalent to the expression liquidityGross != 0
        // these 8 bits are set to prevent fresh sstores when crossing newly initialized ticks
        bool initialized;
    }

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

    // /// @notice Updates a tick and returns true if the tick was flipped from initialized to uninitialized, or vice versa
    // /// @param self The mapping containing all tick information for initialized ticks
    // /// @param tick The tick that will be updated
    // /// @param tickCurrent The current tick
    // /// @param liquidityDelta A new amount of liquidity to be added (subtracted) when tick is crossed from left to right (right to left)
    // /// @param feeGrowthGlobal0X128 The all-time global fee growth, per unit of liquidity, in token0
    // /// @param feeGrowthGlobal1X128 The all-time global fee growth, per unit of liquidity, in token1
    // /// @param secondsPerLiquidityCumulativeX128 The all-time seconds per max(1, liquidity) of the pool
    // /// @param tickCumulative The tick * time elapsed since the pool was first initialized
    // /// @param time The current block timestamp cast to a uint32
    // /// @param upper true for updating a position's upper tick, or false for updating a position's lower tick
    // /// @param maxLiquidity The maximum liquidity allocation for a single tick
    // /// @return flipped Whether the tick was flipped from initialized to uninitialized, or vice versa
    
    // function update(
    //     mapping(int24 => Tick.Info) storage self,
    //     int24 tick,
    //     int24 tickCurrent,
    //     int128 liquidityDelta,
    //     uint256 feeGrowthGlobal0X128,
    //     uint256 feeGrowthGlobal1X128,

    //     uint160 secondsPerLiquidityCumulativeX128,
    //     int56 tickCumulative,
    //     uint32 time,

    //     bool upper,
    //     uint128 maxLiquidity
    // ) internal returns (bool flipped) {

    function update(
        mapping(int24 => Tick.Info) storage self,
        int24 tick,
        int24 tickCurrent,
        int128 liquidityDelta,
        uint256 feeGrowthGlobal0X128,
        uint256 feeGrowthGlobal1X128,

        bool upper,
        uint128 maxLiquidity
    ) internal returns (bool flipped) {

        Tick.Info storage info = self[tick];

        uint128 liquidityGrossBefore = info.liquidityGross;

        // uint128 liquidityGrossAfter = LiquidityMath.addDelta(liquidityGrossBefore, liquidityDelta);
        
        uint128 liquidityGrossAfter = liquidityDelta < 0 ? 
                        liquidityGrossBefore - uint128(-liquidityDelta) :
                        liquidityGrossBefore + uint128(liquidityDelta);

        // require(liquidityGrossAfter <= maxLiquidity, 'LO');
        require(liquidityGrossAfter <= maxLiquidity, 'liquidity > max');

        // flipped = (liquidityGrossBefore == 0 && liquidityGrossAfter > 0)
        //             || (liquidityGrossBefore > 0 && liquidityGrossAfter == 0);

        flipped = (liquidityGrossAfter == 0) != (liquidityGrossBefore == 0);

        // if (liquidityGrossBefore == 0) {
        //     // by convention, we assume that all growth before a tick was initialized happened _below_ the tick
        //     if (tick <= tickCurrent) {
        //         info.feeGrowthOutside0X128 = feeGrowthGlobal0X128;
        //         info.feeGrowthOutside1X128 = feeGrowthGlobal1X128;
        //         info.secondsPerLiquidityOutsideX128 = secondsPerLiquidityCumulativeX128;
        //         info.tickCumulativeOutside = tickCumulative;
        //         info.secondsOutside = time;
        //     }
        //     info.initialized = true;
        // }

        if (liquidityGrossBefore == 0) {
            info.initialized = true;
        }

        info.liquidityGross = liquidityGrossAfter;

        // lower    upper
        //   |       |
        //   +       -
        //       ->  one for zero +

        // when the lower (upper) tick is crossed left to right (right to left), liquidity must be added (removed)
        
        // info.liquidityNet = upper
        //     ? int256(info.liquidityNet).sub(liquidityDelta).toInt128()
        //     : int256(info.liquidityNet).add(liquidityDelta).toInt128();

        info.liquidityNet = upper
            ? info.liquidityNet - liquidityDelta
            : info.liquidityNet + liquidityDelta;
    }


    // /// @notice Clears tick data
    // /// @param self The mapping containing all initialized tick information for initialized ticks
    // /// @param tick The tick that will be cleared
    function clear(mapping(int24 => Tick.Info) storage self, int24 tick) internal {
        delete self[tick];
    }

}


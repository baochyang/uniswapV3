// SPDX-License-Identifier: GPL-2.0-or-later

// pragma solidity 0.8.19;
pragma solidity 0.8.27;

// contracts/UniswapV3Pool.sol

import "./lib/Tick.sol";
import "./lib/Position.sol";
import "./lib/SafeCast.sol";
import "./interfaces/IERC20.sol";

contract concentratedLAMM {

    using SafeCast for int256;

    // /// @inheritdoc IUniswapV3PoolImmutables
    // address public immutable override factory;

    // /// @inheritdoc IUniswapV3PoolImmutables
    // address public immutable override token0;

    address public immutable token0;

    // /// @inheritdoc IUniswapV3PoolImmutables
    // address public immutable override token1;

    address public immutable token1;

    // /// @inheritdoc IUniswapV3PoolImmutables
    // uint24 public immutable override fee;

    uint24 public immutable fee;

    // /// @inheritdoc IUniswapV3PoolImmutables
    // int24 public immutable override tickSpacing;

    int24 public immutable tickSpacing;

    uint128 public immutable maxLiquidityPerTick;

    // /// @inheritdoc IUniswapV3PoolState
    // uint128 public override liquidity;

    struct Slot0 {
        // the current price
        uint160 sqrtPriceX96;
        // the current tick
        int24 tick;
        // // the most-recently updated index of the observations array
        // uint16 observationIndex;
        // // the current maximum number of observations that are being stored
        // uint16 observationCardinality;
        // // the next maximum number of observations to store, triggered in observations.write
        // uint16 observationCardinalityNext;
        // the current protocol fee as a percentage of the swap fee taken on withdrawal
        // //  represented as an integer denominator (1/x)%
        // uint8 feeProtocol;
        // whether the pool is locked
        bool unlocked;
    }
    // /// @inheritdoc IUniswapV3PoolState
    // Slot0 public override slot0;
    Slot0 public slot0;

    // /// @inheritdoc IUniswapV3PoolState
    // mapping(bytes32 => Position.Info) public override positions;
    mapping(bytes32 => Position.Info) public positions;


    // Prevent Re-entrancy
    modifier lock() {
        // require(slot0.unlocked, 'LOK');
        require(slot0.unlocked, 'locked');
        slot0.unlocked = false;
        _;
        slot0.unlocked = true;
    }


    constructor(
        address _token0,
        address _token1,
        uint24 _fee,
        int24 _tickSpacing
    ) {
        token0 = _token0;
        token1 = _token1;
        fee = _fee;
        tickSpacing = _tickSpacing;

        // int24 _tickSpacing;

        // (factory, token0, token1, fee, _tickSpacing) = IUniswapV3PoolDeployer(msg.sender).parameters();

        maxLiquidityPerTick = Tick.tickSpacingToMaxLiquidityPerTick(_tickSpacing);
        
    }

    // /// @inheritdoc IUniswapV3PoolActions
    /// @dev not locked because it initializes unlocked
    // function initialize(uint160 sqrtPriceX96) external override {
    function initialize(uint160 sqrtPriceX96) external {
        // require(slot0.sqrtPriceX96 == 0, 'AI');
        require(slot0.sqrtPriceX96 == 0, 'already initialized');

        int24 tick = TickMath.getTickAtSqrtRatio(sqrtPriceX96);

        // (uint16 cardinality, uint16 cardinalityNext) = observations.initialize(_blockTimestamp());

        slot0 = Slot0({
            sqrtPriceX96: sqrtPriceX96,
            tick: tick,
            // observationIndex: 0,
            // observationCardinality: cardinality,
            // observationCardinalityNext: cardinalityNext,
            // feeProtocol: 0,
            unlocked: true
        });

        // emit Initialize(sqrtPriceX96, tick);

        // let sqrt_price_x_96 = 3443439269043970780644209
        // let q=2**96
        // let p=(sqrt_price_x_96/q)**2
        // p*1e18/1e6 = 1888.9727296834467
        
        // import math
        // sqrt_price_x_96 = 3436899527919986964832931
        // q=2**96
        // tick = -200921
        // tick = 2*math.log(sqrt_price_x_96/q)/math.log(1.0001)
        // tick = -200920.392088956
    }

    struct ModifyPositionParams {
        // the address that owns the position
        address owner;
        // the lower and upper tick of the position
        int24 tickLower;
        int24 tickUpper;
        // any change in liquidity
        int128 liquidityDelta;
    }

    // /// @dev Effect some changes to a position
    // /// @param params the position details and the change to the position's liquidity to effect
    // /// @return position a storage pointer referencing the position with the given owner and tick range
    // /// @return amount0 the amount of token0 owed to the pool, negative if the pool should pay the recipient
    // /// @return amount1 the amount of token1 owed to the pool, negative if the pool should pay the recipient
    
    // function _modifyPosition(ModifyPositionParams memory params) private noDelegateCall
    function _modifyPosition(ModifyPositionParams memory params) private 
        returns (
            Position.Info storage position,
            int256 amount0,
            int256 amount1
        )
    {
        return(positions[bytes32(0)], 0, 0);

        // checkTicks(params.tickLower, params.tickUpper);

        // Slot0 memory _slot0 = slot0; // SLOAD for gas optimization

        // position = _updatePosition(
        //     params.owner,
        //     params.tickLower,
        //     params.tickUpper,
        //     params.liquidityDelta,
        //     _slot0.tick
        // );

        // if (params.liquidityDelta != 0) {
        //     if (_slot0.tick < params.tickLower) {
        //         // current tick is below the passed range; liquidity can only become in range by crossing from left to
        //         // right, when we'll need _more_ token0 (it's becoming more valuable) so user must provide it
        //         amount0 = SqrtPriceMath.getAmount0Delta(
        //             TickMath.getSqrtRatioAtTick(params.tickLower),
        //             TickMath.getSqrtRatioAtTick(params.tickUpper),
        //             params.liquidityDelta
        //         );
        //     } else if (_slot0.tick < params.tickUpper) {
        //         // current tick is inside the passed range
        //         uint128 liquidityBefore = liquidity; // SLOAD for gas optimization

        //         // write an oracle entry
        //         (slot0.observationIndex, slot0.observationCardinality) = observations.write(
        //             _slot0.observationIndex,
        //             _blockTimestamp(),
        //             _slot0.tick,
        //             liquidityBefore,
        //             _slot0.observationCardinality,
        //             _slot0.observationCardinalityNext
        //         );

        //         amount0 = SqrtPriceMath.getAmount0Delta(
        //             _slot0.sqrtPriceX96,
        //             TickMath.getSqrtRatioAtTick(params.tickUpper),
        //             params.liquidityDelta
        //         );
        //         amount1 = SqrtPriceMath.getAmount1Delta(
        //             TickMath.getSqrtRatioAtTick(params.tickLower),
        //             _slot0.sqrtPriceX96,
        //             params.liquidityDelta
        //         );

        //         liquidity = LiquidityMath.addDelta(liquidityBefore, params.liquidityDelta);
        //     } else {
        //         // current tick is above the passed range; liquidity can only become in range by crossing from right to
        //         // left, when we'll need _more_ token1 (it's becoming more valuable) so user must provide it
        //         amount1 = SqrtPriceMath.getAmount1Delta(
        //             TickMath.getSqrtRatioAtTick(params.tickLower),
        //             TickMath.getSqrtRatioAtTick(params.tickUpper),
        //             params.liquidityDelta
        //         );
        //     }
        // }
    }


    // mint = add liquidity

    // /// @inheritdoc IUniswapV3PoolActions
    // /// @dev noDelegateCall is applied indirectly via _modifyPosition
    function mint(
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount
        // bytes calldata data
    // ) external override lock returns (uint256 amount0, uint256 amount1) {
    ) external lock returns (uint256 amount0, uint256 amount1) {
        require(amount > 0, "amount = 0");

        // When we remove liquidity, liquidityDelta will be negative
        (, int256 amount0Int, int256 amount1Int) =
            _modifyPosition(
                ModifyPositionParams({
                    owner: recipient,
                    tickLower: tickLower,
                    tickUpper: tickUpper,
                    // liquidityDelta: int256(amount).toInt128()
                    liquidityDelta: int256(uint256(amount)).toInt128()
                })
            );

        amount0 = uint256(amount0Int);
        amount1 = uint256(amount1Int);

        // uint256 balance0Before;
        // uint256 balance1Before;
        // if (amount0 > 0) balance0Before = balance0();
        // if (amount1 > 0) balance1Before = balance1();

        // callback does the ERC20 transfer

        // IUniswapV3MintCallback(msg.sender).uniswapV3MintCallback(amount0, amount1, data);
        // if (amount0 > 0) require(balance0Before.add(amount0) <= balance0(), 'M0');
        // if (amount1 > 0) require(balance1Before.add(amount1) <= balance1(), 'M1');


        if (amount0 > 0) {
            IERC20(token0).transferFrom(msg.sender, address(this), amount0);
        }
        
        if (amount1 > 0) {
            IERC20(token1).transferFrom(msg.sender, address(this), amount1);
        }

        // emit Mint(msg.sender, recipient, tickLower, tickUpper, amount, amount0, amount1);
    }



}
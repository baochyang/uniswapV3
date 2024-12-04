// SPDX-License-Identifier: GPL-2.0-or-later

// pragma solidity 0.8.19;
pragma solidity 0.8.27;

// contracts/UniswapV3Pool.sol

import "./lib/Tick.sol";
import "./lib/TickMath.sol";
import "./lib/Position.sol";
import "./lib/SafeCast.sol";
import "./interfaces/IERC20.sol";
import "./lib/SqrtPriceMath.sol";
import "./lib/SwapMath.sol";

//------------------------
// let tick = -200697;
// let p = 1.0001**tick;

// ## token0 = ETH;
// let decimals_0 = 1e18;
// ## token1 = USDC;
// let decimals_1 = 1e6;
// p*decimals_0/decimals_1
// p = 1.9243135e-9
// p*decimals_0/decimals_1 = 1924.3135
//------------------------

// slot 0 = 32 bytes
// 2**256 = 32 bytes

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

// /// @dev Common checks for valid tick inputs.
// function checkTicks(int24 tickLower, int24 tickUpper) private pure {
function checkTicks(int24 tickLower, int24 tickUpper) pure {
        require(tickLower < tickUpper, 'TLU');
        require(tickLower >= TickMath.MIN_TICK, 'TLM');
        require(tickUpper <= TickMath.MAX_TICK, 'TUM');
    }

    // Tick bitmap is used to get the next tick when we do a swap

contract concentratedLAMM {

    using SafeCast for int256;
    using Position for mapping(bytes32 => Position.Info);
    using Position for Position.Info;
    using Tick for mapping(int24 => Tick.Info);


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

    
    // /// @inheritdoc IUniswapV3PoolState
    // Slot0 public override slot0;
    Slot0 public slot0;

    uint128 public liquidity;

    mapping(int24 => Tick.Info) public ticks; // TODO

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
    // /// @dev not locked because it initializes unlocked
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

        // -------------------
        // let sqrt_price_x_96 = 3443439269043970780644209
        // let q=2**96
        // let p=(sqrt_price_x_96/q)**2
        // p*1e18/1e6 = 1888.9727296834467
        
        // -------------------
        // import math
        // sqrt_price_x_96 = 3436899527919986964832931
        // q=2**96
        // tick = -200921
        // tick = 2*math.log(sqrt_price_x_96/q)/math.log(1.0001)
        // tick = -200920.392088956
        // -------------------
    }

    // /// @dev Gets and updates a position with the given liquidity delta
    // /// @param owner the owner of the position
    // /// @param tickLower the lower tick of the position's tick range
    // /// @param tickUpper the upper tick of the position's tick range
    // /// @param tick the current tick, passed to avoid sloads
    function _updatePosition(
        address owner,
        int24 tickLower,
        int24 tickUpper,
        int128 liquidityDelta,
        int24 tick
    ) private returns (Position.Info storage position) {
        position = positions.get(owner, tickLower, tickUpper);

        // uint256 _feeGrowthGlobal0X128 = feeGrowthGlobal0X128; // SLOAD for gas optimization
        // uint256 _feeGrowthGlobal1X128 = feeGrowthGlobal1X128; // SLOAD for gas optimization
        uint256 _feeGrowthGlobal0X128 = 0;
        uint256 _feeGrowthGlobal1X128 = 0;

        // if we need to update the ticks, do it
        bool flippedLower;
        bool flippedUpper;
        if (liquidityDelta != 0) {
            // uint32 time = _blockTimestamp();
            // (int56 tickCumulative, uint160 secondsPerLiquidityCumulativeX128) =
            //     observations.observeSingle(
            //         time,
            //         0,
            //         slot0.tick,
            //         slot0.observationIndex,
            //         liquidity,
            //         slot0.observationCardinality
            //     );

            flippedLower = ticks.update(
                tickLower,
                tick,
                liquidityDelta,
                _feeGrowthGlobal0X128,
                _feeGrowthGlobal1X128,
                // secondsPerLiquidityCumulativeX128,
                // tickCumulative,
                // time,
                false,
                maxLiquidityPerTick
            );

            flippedUpper = ticks.update(
                tickUpper,
                tick,
                liquidityDelta,
                _feeGrowthGlobal0X128,
                _feeGrowthGlobal1X128,
                // secondsPerLiquidityCumulativeX128,
                // tickCumulative,
                // time,
                true,
                maxLiquidityPerTick
            );

            // tickBitmap is used to get the next tick when we do a swap

            // if (flippedLower) {
            //     tickBitmap.flipTick(tickLower, tickSpacing);
            // }
            // if (flippedUpper) {
            //     tickBitmap.flipTick(tickUpper, tickSpacing);
            // }
        }

        // (uint256 feeGrowthInside0X128, uint256 feeGrowthInside1X128) =
        //     ticks.getFeeGrowthInside(tickLower, tickUpper, tick, _feeGrowthGlobal0X128, _feeGrowthGlobal1X128);

        // position.update(liquidityDelta, feeGrowthInside0X128, feeGrowthInside1X128);
        position.update(liquidityDelta, 0, 0);

        // clear any tick data that is no longer needed
        if (liquidityDelta < 0) {
            if (flippedLower) {
                ticks.clear(tickLower);
            }
            if (flippedUpper) {
                ticks.clear(tickUpper);
            }
        }
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
    // takes in liquidity delta, params.liquidityDelta
    // https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/SqrtPriceMath.sol, getAmount0Delta, getAmount1Delta
    function _modifyPosition(ModifyPositionParams memory params) private 
        returns (
            Position.Info storage position,
            int256 amount0,
            int256 amount1
        )
    {

        // returns amount0 or amount1, either to be added or removed
        
        checkTicks(params.tickLower, params.tickUpper);

        Slot0 memory _slot0 = slot0; // SLOAD for gas optimization
        // Reading from Storage costs a lot of gas

        position = _updatePosition(
            params.owner,
            params.tickLower,
            params.tickUpper,
            params.liquidityDelta,
            _slot0.tick
        );

        // Get amount 0 and amount 1
        // token 1 | token 0
        // --------|---------
        //        tick

        if (params.liquidityDelta != 0) {
            if (_slot0.tick < params.tickLower) {

                // Calculate amount 0
                
                // current tick is below the passed range; liquidity can only become in range by crossing from left to
                // right, when we'll need _more_ token0 (it's becoming more valuable) so user must provide it
                
                amount0 = SqrtPriceMath.getAmount0Delta(
                    TickMath.getSqrtRatioAtTick(params.tickLower),
                    TickMath.getSqrtRatioAtTick(params.tickUpper),
                    params.liquidityDelta
                );
            } else if (_slot0.tick < params.tickUpper) {

                // Calculate amount 0 and amount 1
                
                // // current tick is inside the passed range
                // uint128 liquidityBefore = liquidity; // SLOAD for gas optimization

                // // write an oracle entry
                // (slot0.observationIndex, slot0.observationCardinality) = observations.write(
                //     _slot0.observationIndex,
                //     _blockTimestamp(),
                //     _slot0.tick,
                //     liquidityBefore,
                //     _slot0.observationCardinality,
                //     _slot0.observationCardinalityNext
                // );

                amount0 = SqrtPriceMath.getAmount0Delta(
                    _slot0.sqrtPriceX96,
                    TickMath.getSqrtRatioAtTick(params.tickUpper),
                    params.liquidityDelta
                );
                amount1 = SqrtPriceMath.getAmount1Delta(
                    TickMath.getSqrtRatioAtTick(params.tickLower),
                    _slot0.sqrtPriceX96,
                    params.liquidityDelta
                );

                // liquidity = LiquidityMath.addDelta(liquidityBefore, params.liquidityDelta);
                liquidity = params.liquidityDelta < 0
                            ? liquidity - uint128(-params.liquidityDelta)
                            : liquidity + uint128(params.liquidityDelta);

            } else {

                // Calculate amount 1

                // _slot0.tick >= params.tickUpper

                // current tick is above the passed range; liquidity can only become in range by crossing from right to
                // left, when we'll need _more_ token1 (it's becoming more valuable) so user must provide it
                amount1 = SqrtPriceMath.getAmount1Delta(
                    TickMath.getSqrtRatioAtTick(params.tickLower),
                    TickMath.getSqrtRatioAtTick(params.tickUpper),
                    params.liquidityDelta
                );
            }
        }

        // return(positions[bytes32(0)], 0, 0);
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

    // collect -------------------
    // 1. burn() to remove liquidity and then update the amount of tokensOwed to our position, however,
    // the tokens are not transferred. To transfer the token, we call collect()
    // 
    // collect(): actual transfer of token
    // /// @inherit IUniswapV3PoolActions
    function collect(
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount0Requested,
        uint128 amount1Requested
    ) external lock returns (uint128 amount0, uint128 amount1){
        // we don't need to checkTicks here, because invalid
        // positions will never have non-zero tokensOwed{0,1}

        Position.Info storage position = positions.get(msg.sender, tickLower, tickUpper);

        // min(amount owed, amount request)
        amount0 = amount0Requested > position.tokensOwed0 ? position.tokensOwed0 : amount0Requested;
        amount1 = amount1Requested > position.tokensOwed1 ? position.tokensOwed1 : amount1Requested;

        // console.log("Amount 0", amount0, IERC20(token0).balanceOf(address(this)));
        // console.log("Amount 1", amount1, IERC20(token1).balanceOf(address(this)));

        if(amount0 > 0){
            position.tokensOwed0 -= amount0; // update position
            // TransferHelper.safeTransfer(token0, recipient, amount0); 
            // TransferHelper is related to returning a boolean after token transfer
            IERC20(token0).transfer(recipient, amount0);
        }

        if(amount1 > 0){
            position.tokensOwed1 -= amount1; // update position
            // TransferHelper.safeTransfer(token1, recipient, amount1);
            IERC20(token1).transfer(recipient, amount1);
        }

        // emit Collect(msg.sender, recipient, tickLower, tickUpper, amount0, amount1);

    }

    // burn -----------------------

    // uint128 amount is the amount of liquidity to burn
    // uint256 amount0 and uint256 amount1 tokens to return

    // lock is the Re-entrancy prevention modifier

    // liquidity Delta is the amount of liquidity, we will be removing

    // notice that burn() does not transfer any tokens, only update positions

    function burn(int24 tickLower, int24 tickUpper, uint128 amount) 
        external 
        lock
        returns (uint256 amount0, uint256 amount1) 
    {

        // Because liquidityDelta is negative, hence, int256 amount0Int and
        // int256 amount1Int will be negative
        (Position.Info storage position, int256 amount0Int, int256 amount1Int)= 
        _modifyPosition(
            ModifyPositionParams({
                owner: msg.sender,
                tickLower: tickLower,
                tickUpper: tickUpper,
                liquidityDelta: -int256(uint256(amount)).toInt128()
        }));

        // Since, int256 amount0Int and int256 amount1Int are negative values, hence:
        amount0 = uint256(-amount0Int);
        amount1 = uint256(-amount1Int);

        if (amount0 > 0 || amount1 > 0) {
            (position.tokensOwed0, position.tokensOwed1) = (
                position.tokensOwed0 + uint128(amount0),
                position.tokensOwed1 + uint128(amount1)
            );
        }
    }

    // uniswapV3 Pool
    // swap()
    // SwapMath.computeSwapStep; compute 
    // state.sqrtPriceX96, step.amountIn, step.amountOut, step.feeAmount
    // compute the amount of tokens that need to go in, the
    // amount of tokens that need to go out and the swap fee





}
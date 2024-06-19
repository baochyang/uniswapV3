// SPDX-License-Identifier: MIT
// pragma solidity 0.8.20;
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

// Uniswap V3 Swap

// exactInputMultiHop sells all tokens for 
// another. 

// exactOutputMultiHop buys specific amount of tokens set 
// by the caller. 

interface IERC20 {
    function totalSupply() external view returns (uint);
    function balanceOf(address account) external view returns (uint);
    function transfer(address recipient, uint amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint);
    function approve(address spender, uint amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
}


interface IWETH is IERC20 {
    function deposit() external payable;
    function withdraw(uint amount) external;
}


interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint deadline;
        uint amountIn;
        uint amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external payable returns (uint amountOut);

    struct ExactInputParams {
        bytes path;
        address recipient;
        uint deadline;
        uint amountIn;
        uint amountOutMinimum;
    }

    function exactInput(
        ExactInputParams calldata params
    ) external payable returns (uint amountOut);

    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }

    function exactOutputSingle(ExactOutputSingleParams calldata params)
        external
        payable
        returns (uint256 amountIn);

    struct ExactOutputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
    }

    function exactOutput(ExactOutputParams calldata params)
        external
        payable
        returns (uint256 amountIn);

}


library TransferHelper {
    function safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) =
            token.call(abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'STF');
    }

    function safeTransfer(
        address token,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'ST');
    }

    function safeApprove(
        address token,
        address to,
        uint256 value
    ) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.approve.selector, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'SA');
    }

    
    function safeTransferETH(address to, uint256 value) internal {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, 'STE');
    }
}


address constant ISwapRouterAddress = 0xE592427A0AEce92De3Edee1F18E0157C05861564;

contract MultiHopSwapUniswapV3 {

ISwapRouter constant public router = ISwapRouter(ISwapRouterAddress);



function swapExactInputMultiHopV1(
    address tokenIn,
    uint24 poolFeeTokenIn,
    address tokenOut1,
    uint24 poolFeeTokenOut1,
    address tokenOut2,
    uint amountIn
) external returns (uint amountOut) {
    TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);
    TransferHelper.safeApprove(tokenIn, address(router), amountIn);

    // (tokenIn WETH, fee, tokenOut/tokenIn USDC, fee, tokenOut DAI) 
    bytes memory path =
        abi.encodePacked(tokenIn, poolFeeTokenIn, tokenOut1, poolFeeTokenOut1, tokenOut2);
    
    ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
        path: path,
        recipient: msg.sender,
        deadline: block.timestamp,
        amountIn: amountIn,
        amountOutMinimum: 0
    });
    amountOut = router.exactInput(params);
}


function swapExactInputMultiHopV2(
    bytes calldata path,
    address tokenIn,
    uint amountIn
) external returns (uint amountOut) {
    TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);
    TransferHelper.safeApprove(tokenIn, address(router), amountIn);
    
    ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
        path: path,
        recipient: msg.sender,
        deadline: block.timestamp,
        amountIn: amountIn,
        amountOutMinimum: 0
    });
    amountOut = router.exactInput(params);
}

function swapExactOutputMultiHopV1(
    address tokenIn,
    uint24 poolFeeTokenIn,
    address tokenOut1,
    uint24 poolFeeTokenOut1,
    address tokenOut2,
    uint256 amountOut, uint256 amountInMax)
    external
{
    TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), amountInMax);
    TransferHelper.safeApprove(tokenIn, address(router), amountInMax);
    
    // (tokenOut DAI, fee, tokenIn/tokenOut USDC, fee, tokenIn WETH)
    bytes memory path =
        abi.encodePacked(tokenOut2, poolFeeTokenOut1, tokenOut1, poolFeeTokenIn, tokenIn);

    ISwapRouter.ExactOutputParams memory params = ISwapRouter
        .ExactOutputParams({
        path: path,
        recipient: msg.sender,
        deadline: block.timestamp,
        amountOut: amountOut,
        amountInMaximum: amountInMax
    });

    uint256 amountIn = router.exactOutput(params);

    if (amountIn < amountInMax) {
        TransferHelper.safeApprove(tokenIn, address(router), 0);
        TransferHelper.safeTransfer(tokenIn, msg.sender, amountInMax - amountIn);
    }
}


function swapExactOutputMultiHopV2(
    bytes calldata path,
    address tokenIn,
    uint256 amountOut, uint256 amountInMax)
    external
{
    TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), amountInMax);
    TransferHelper.safeApprove(tokenIn, address(router), amountInMax);

    ISwapRouter.ExactOutputParams memory params = ISwapRouter
        .ExactOutputParams({
        path: path,
        recipient: msg.sender,
        deadline: block.timestamp,
        amountOut: amountOut,
        amountInMaximum: amountInMax
    });

    uint256 amountIn = router.exactOutput(params);

    if (amountIn < amountInMax) {
        TransferHelper.safeApprove(tokenIn, address(router), 0);
        TransferHelper.safeTransfer(tokenIn, msg.sender, amountInMax - amountIn);
    }
}


}
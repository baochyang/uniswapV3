

const { loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const { ethers } = require("hardhat");


const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";


const abiIERC20 = [
    "function totalSupply() external view returns (uint)",
    "function balanceOf(address account) external view returns (uint)",
    "function transfer(address recipient, uint amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint)",
    "function approve(address spender, uint amount) external returns (bool)",
    "function transferFrom(address sender, address recipient, uint amount) external returns (bool)",
    "function decimals() external view returns (uint8)",
    
    "event Transfer(address indexed from, address indexed to, uint value)",
    "event Approval(address indexed owner, address indexed spender, uint value)"
]

const abiIWETH = [
    "function totalSupply() external view returns (uint)",
    "function balanceOf(address account) external view returns (uint)",
    "function transfer(address recipient, uint amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint)",
    "function approve(address spender, uint amount) external returns (bool)",
    "function transferFrom(address sender, address recipient, uint amount) external returns (bool)",
    "function decimals() external view returns (uint8)",
    
    "event Transfer(address indexed from, address indexed to, uint value)",
    "event Approval(address indexed owner, address indexed spender, uint value)",

    "function deposit() external payable",
    "function withdraw(uint amount) external"
]



describe('UniSwapV3', async () =>  {

    async function deployedUniswapV3SwapFixture() { 

        let UniswapV3SwapContract;
        const UniswapV3Swap = await ethers.getContractFactory('SingleHopSwapUniswapV3');
        UniswapV3SwapContract = await UniswapV3Swap.deploy();

        let deployer, sender;  
        [deployer, sender] = await ethers.getSigners();

        const RPC_URL = "http://127.0.0.1:8545";
        provider = new ethers.JsonRpcProvider(RPC_URL)

        const wethContract = new ethers.Contract(WETH, abiIWETH, provider);
        const weth_decimals = await wethContract.decimals();

        const daiContract = new ethers.Contract(DAI, abiIERC20, provider);
        const dai_decimals = await daiContract.decimals();

        return { sender, provider, UniswapV3SwapContract, wethContract, daiContract, weth_decimals, dai_decimals}

    }


    describe("SingleHopSwap", function () {

        
        it("SwapExactInput, should get DAI from the exact WETH input", async function () {

            /////////////////////////////////////////////////
            ///  This swap provides an exact input of 1 ETH 
            //   in exchange for DAI.
            ///  It checks that the user balance of DAI has 
            ///  increased accordingly. 
            /////////////////////////////////////////////////

            const { sender, provider, UniswapV3SwapContract, wethContract, daiContract, weth_decimals, dai_decimals} = await loadFixture(deployedUniswapV3SwapFixture);

            const eth0_bn = await provider.getBalance(sender.address)
            const eth0 = Number(ethers.formatUnits(eth0_bn.toString(), 18))
            // console.log("eth0 = ", eth0)
            
            const weth0_bn =  await wethContract.balanceOf(sender.address)
            const weth0 = Number(ethers.formatUnits(weth0_bn.toString(), Number(weth_decimals)))
            // console.log("weth0 = ", weth0)

            const deposit_weth_response_tx = await wethContract.connect(sender).deposit(
                {   value: ethers.parseUnits("1", Number(weth_decimals)).toString(),
                    gasPrice: 5122761483,
                    gasLimit: 5000000
                })

            await deposit_weth_response_tx.wait()
            // console.log("deposit_weth_response_tx.hash = ", deposit_weth_response_tx.hash)

            const weth1_bn =  await wethContract.balanceOf(sender.address)
            const weth1 = Number(ethers.formatUnits(weth1_bn.toString(), Number(weth_decimals)))
            console.log("weth1 = ", weth1)


            const weth0_allow_bn =  await wethContract.allowance(sender.address, UniswapV3SwapContract.target)
            const weth0_allow = Number(ethers.formatUnits(weth0_allow_bn.toString(), Number(weth_decimals)))
            // console.log("weth0_allow = ", weth0_allow)


            const eth1_bn = await provider.getBalance(sender.address)
            const eth1 = Number(ethers.formatUnits(eth1_bn.toString(), 18))
            // console.log("eth1 =  ", eth1)

            const approve_weth_response_tx = await wethContract.connect(sender).approve(
                UniswapV3SwapContract.target, 
                ethers.parseUnits("1", Number(weth_decimals)).toString(),
                    {gasPrice: 5122761483,
                    gasLimit: 5000000})

            await approve_weth_response_tx.wait()
            // console.log("approve_weth_response_tx.hash = ", approve_weth_response_tx.hash)

            const weth1_allow_bn =  await wethContract.allowance(sender.address, UniswapV3SwapContract.target)
            const weth1_allow = Number(ethers.formatUnits(weth1_allow_bn.toString(), Number(weth_decimals)))
            // console.log("weth1_allow = ", weth1_allow)

            const eth0_bn_2 = await provider.getBalance(sender.address)
            const eth0_2 = Number(ethers.formatUnits(eth0_bn_2.toString(), 18))
            // console.log("eth0_2 = ", eth0_2)
        
            const dai0_bn = await daiContract.balanceOf(sender.address)
            const dai0 = Number(ethers.formatUnits(dai0_bn.toString(), Number(dai_decimals)))
            console.log("dai0 = ", dai0)

            const swapExactInputSingleHop_response_tx = await UniswapV3SwapContract.connect(sender).swapExactInputSingleHop(
                    WETH, 
                    DAI, 
                    "3000", 
                    ethers.parseUnits("1", Number(weth_decimals)).toString()
                );
            
            await swapExactInputSingleHop_response_tx.wait()
            // console.log("swapExactInputSingleHop_response_tx.hash = ", swapExactInputSingleHop_response_tx.hash)

            const dai1_bn = await daiContract.balanceOf(sender.address)
            const dai1 = Number(ethers.formatUnits(dai1_bn.toString(), Number(dai_decimals)))
            console.log("dai1 = ", dai1)

            const weth1_bn_2 =  await wethContract.balanceOf(sender.address)
            const weth1_2 = Number(ethers.formatUnits(weth1_bn_2.toString(), Number(weth_decimals)))
            console.log("weth1_2 = ", weth1_2)

            const eth1_bn_2 = await provider.getBalance(sender.address)
            const eth1_2 = Number(ethers.formatUnits(eth1_bn_2.toString(), 18))
            // console.log("eth1_2 =  ", eth1_2)
            
            expect(dai1).to.be.gt(dai0);
        });

        it("SwapExactOutput, should get the exact amount of DAI requested and get back excess WETH paid", async function () {

            /////////////////////////////////////////////////
            ///  This swap calls for an exact output of 
            ///  3800 DAI with an initial input of 2 ETH
            ///  It checks that the user balance of DAI is
            ///  exactly 3800 upon the swap. 
            /////////////////////////////////////////////////

            const { sender, provider, UniswapV3SwapContract, wethContract, daiContract, weth_decimals, dai_decimals} = await loadFixture(deployedUniswapV3SwapFixture);

            const eth0_bn = await provider.getBalance(sender.address)
            const eth0 = Number(ethers.formatUnits(eth0_bn.toString(), 18))
            // console.log("eth0 = ", eth0)
            
            const weth0_bn =  await wethContract.balanceOf(sender.address)
            const weth0 = Number(ethers.formatUnits(weth0_bn.toString(), Number(weth_decimals)))
            // console.log("weth0 = ", weth0)

            const deposit_weth_response_tx = await wethContract.connect(sender).deposit(
                {   value: ethers.parseUnits("2", Number(weth_decimals)).toString(), 
                    gasPrice: 5122761483,    
                    gasLimit: 5000000
                })

            await deposit_weth_response_tx.wait()
            // console.log("deposit_weth_response_tx.hash = ", deposit_weth_response_tx.hash)

            const weth1_bn =  await wethContract.balanceOf(sender.address)
            const weth1 = Number(ethers.formatUnits(weth1_bn.toString(), Number(weth_decimals)))
            console.log("weth1 = ", weth1)

            const weth0_allow_bn =  await wethContract.allowance(sender.address, UniswapV3SwapContract.target)
            const weth0_allow = Number(ethers.formatUnits(weth0_allow_bn.toString(), Number(weth_decimals)))
            // console.log("weth0_allow = ", weth0_allow)

            const eth1_bn = await provider.getBalance(sender.address)
            const eth1 = Number(ethers.formatUnits(eth1_bn.toString(), 18))
            // console.log("eth1 =  ", eth1)

            const approve_weth_response_tx = await wethContract.connect(sender).approve(
                UniswapV3SwapContract.target, 
                ethers.parseUnits("2", Number(weth_decimals)).toString(),
                {gasPrice: 5122761483,
                gasLimit: 5000000})

            await approve_weth_response_tx.wait()
            // console.log("approve_weth_response_tx.hash = ", approve_weth_response_tx.hash)

            const weth1_allow_bn =  await wethContract.allowance(sender.address, UniswapV3SwapContract.target)
            const weth1_allow = Number(ethers.formatUnits(weth1_allow_bn.toString(), Number(weth_decimals)))
            // console.log("weth1_allow = ", weth1_allow)

            const eth0_bn_2 = await provider.getBalance(sender.address)
            const eth0_2 = Number(ethers.formatUnits(eth0_bn_2.toString(), 18))
            // console.log("eth0_2 = ", eth0_2)
        
            const dai0_bn = await daiContract.balanceOf(sender.address)
            const dai0 = Number(ethers.formatUnits(dai0_bn.toString(), Number(dai_decimals)))
            console.log("dai0 = ", dai0)

            const swapExactOutputSingleHop_response_tx = await UniswapV3SwapContract.connect(sender).swapExactOutputSingleHop(
                    WETH, 
                    DAI, 
                    "3000", 
                    ethers.parseUnits("3800", Number(dai_decimals)).toString(),
                    ethers.parseUnits("2", Number(weth_decimals)).toString()
                );
            
            await swapExactOutputSingleHop_response_tx.wait()
            // console.log("swapExactOutputSingleHop_response_tx.hash = ", swapExactOutputSingleHop_response_tx.hash)


            const dai1_bn = await daiContract.balanceOf(sender.address)
            const dai1 = Number(ethers.formatUnits(dai1_bn.toString(), Number(dai_decimals)))
            console.log("dai1 = ", dai1)
            

            const eth1_bn_2 = await provider.getBalance(sender.address)
            const eth1_2 = Number(ethers.formatUnits(eth1_bn_2.toString(), 18))
            // console.log("eth1_2 =  ", eth1_2)


            const weth1_bn_2 =  await wethContract.balanceOf(sender.address)
            const weth1_2 = Number(ethers.formatUnits(weth1_bn_2.toString(), Number(weth_decimals)))
            console.log("weth1_2 = ", weth1_2)

            expect(dai1).to.be.eq(3800);
        });

    });


})


  
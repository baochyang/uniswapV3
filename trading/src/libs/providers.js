
import { ethers } from 'ethers'
import { CurrentConfig } from '../config'
import { Web3 } from 'web3';

// Single copies of provider and wallet
const mainnetProvider = new ethers.providers.JsonRpcProvider(
  CurrentConfig.rpc.mainnet
)

const browserExtensionProvider = createBrowserExtensionProvider()

let walletExtensionAddress = null

export const TransactionState = {
  Failed : 'Failed',
  New : 'New',
  Rejected : 'Rejected',
  Sending : 'Sending',
  Completed : 'Completed',
}

// Provider and Wallet Functions
export function getMainnetProvider() {
  return mainnetProvider
}

export function getProvider() {
  return browserExtensionProvider
}

export function getWalletAddress() {
  return walletExtensionAddress
}

export async function sendTransaction(
  transaction
) {
    return sendTransactionViaExtension(transaction)
}

export async function connectBrowserExtensionWallet() {
  
  if (!window.ethereum) {
    return null
  }

  const { ethereum } = window
  const provider = new ethers.providers.Web3Provider(ethereum)
  const accounts = await provider.send('eth_requestAccounts', [])

  walletExtensionAddress = accounts[0]

  getEthBalance()

  return walletExtensionAddress
}

let ethBalance = null

export async function getEthBalance(){

  if (walletExtensionAddress){
    ethBalance = await browserExtensionProvider?.getBalance(walletExtensionAddress)
    
    ethBalance = ethers.utils.formatEther(ethBalance)
  
  }

  return CurrentConfig.env === "WALLET_EXTENSION"
    ? ethBalance
    : null
  
}

export function ethBalanceAmount(){

  return CurrentConfig.env === "WALLET_EXTENSION"
    ? ethBalance
    : null
}

export function amountSlice(amount){

  const digitPlace = 16

  const amountSliceString = (amount.toString()).slice(0,digitPlace)
  

  return amountSliceString

}

// Internal Functionality

function createBrowserExtensionProvider() {
  try {
    return new ethers.providers.Web3Provider(window?.ethereum, 'any')
  } catch (e) {
    console.log('No Wallet Extension Found')
    return null
  }
}

// Transacting with a wallet extension via a Web3 Provider
  async function sendTransactionViaExtension(
    transaction
  ) {
  
  const web3 = new Web3(window.ethereum);
   
  try {

      const receipt = await web3?.eth.sendTransaction(
        transaction
      )
    if (receipt) {
      return TransactionState.Completed
    } else {
      return TransactionState.Failed
    }
  } catch (e) {
    console.log(e)
    return TransactionState.Rejected
  }
}

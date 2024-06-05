import { USDC_TOKEN, WETH_TOKEN, ETHER_NATIVE, DAI_TOKEN } from './libs/constants';

export const CurrentConfig = {
  tokens: {
    in: WETH_TOKEN,
    amountIn: 1,
    out: USDC_TOKEN,
    poolFee: 3000, // poolFee: FeeAmount.MEDIUM,
    etherNative: ETHER_NATIVE 
  },
}

let CurrentConfigTokensOut = null

export function getCurrentConfigTokensOut() {
  if(!CurrentConfigTokensOut){
    CurrentConfigTokensOut = USDC_TOKEN
  }
  return CurrentConfigTokensOut
}

export function setCurrentConfigTokensOut(tokenType) {
  
  const tokenTypeObject = {"ETH":ETHER_NATIVE, "USDC":USDC_TOKEN, "DAI":DAI_TOKEN}
  
  CurrentConfigTokensOut = tokenTypeObject[tokenType]
  
  return CurrentConfigTokensOut
}

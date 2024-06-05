import { ethers } from 'ethers'

const MAX_DECIMALS = 18

export function fromReadableAmount(
  amount,
  decimals
) {
  return ethers.utils.parseUnits(amount.toString(), decimals)
}

export function toReadableAmount(rawAmount, decimals) {
  return ethers.utils.formatUnits(rawAmount, decimals).slice(0, MAX_DECIMALS)
}

export function displayTrade(trade) {
  return `${trade.inputAmount.toExact()} ${
    trade.inputAmount.currency.symbol
  } for ${trade.outputAmount.toExact()} ${trade.outputAmount.currency.symbol}`
}

export const shortenAddress = (address) => 
  `${address?.slice(0,6)}....${address?.slice(address.length - 4)}`;

export function displayTradeInputOutputAmount(trade) {
  return `${trade.inputAmount.toExact()} : ${trade.outputAmount.toExact()}`
}

export function displayTradeOutputAmount(trade) {
  return `${trade.outputAmount.toExact()}`
}


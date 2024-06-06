

import '../assets/styles/style.css'
import triangle from '../assets/img/triangle.png'
import eth_logo from '../assets/img/eth_logo.png'
import usdc_logo from '../assets/img/usdc_logo.png'
import dai_logo from '../assets/img/dai_logo.png'
import { ethers } from 'ethers'

import { Dropdown } from "../components/Dropdown/Dropdown";
import { DropdownButton } from "../components/DropdownButton/DropdownButton";
import { DropdownContent } from "../components/DropdownContent/DropdownContent";
import { DropdownItem } from "../components/DropdownItem/DropdownItem";
import { DropdownList } from "../components/DropdownList/DropdownList";

import spinner from "../assets/img/spinner-svgrepo-com.svg"

import React, { useCallback, useEffect, useState } from 'react'

import { CurrentConfig, getCurrentConfigTokensOut, setCurrentConfigTokensOut } from '../config'

import {
  connectBrowserExtensionWallet,
  getProvider,
  getWalletAddress,
  TransactionState,
  amountSlice 
} from '../libs/providers'

import { createTrade, createAndExecuteTrade} from '../libs/trading'

import { shortenAddress, displayTradeOutputAmount} from '../libs/utils'
import { getCurrencyBalance, } from '../libs/wallet'
import { USDC_TOKEN, DAI_TOKEN} from '../libs/constants'

const useOnBlockUpdated = (callback) => {
  useEffect(() => {
    const subscription = getProvider()?.on('block', callback)
    return () => {
      subscription?.removeAllListeners()
    }
  })
}

Dropdown.Button = DropdownButton;
Dropdown.Content = DropdownContent;
Dropdown.List = DropdownList;
Dropdown.Item = DropdownItem;

const UniswapV3 = () => {
  
  const [trade, setTrade] = useState()
  const [txState, setTxState] = useState(TransactionState.New)
  const [tokenOutBalance, setTokenOutBalance] = useState()
  const [blockNumber, setBlockNumber] = useState(0)

  const [inputAmount, setInputAmount] = useState(0.0);
  const [ethBalance, setEthBalance] = useState(0.0)
  const [showImg, setShowImg] = useState(false)
  
  useOnBlockUpdated(async (blockNumber) => {
    refreshBalances()
    setBlockNumber(blockNumber)
  })

  // Update wallet state given a block number
  const refreshBalances = useCallback(async () => {
    const provider = getProvider()
    const address = getWalletAddress()

    if (!address || !provider) {
      return
    }

    setTokenOutBalance(
      await getCurrencyBalance(provider, address, getCurrentConfigTokensOut())
    )
    
    setEthBalance(
      await getCurrencyBalance(provider, address, CurrentConfig.tokens.etherNative)
    )
    
  }, [])

  // Event Handlers

  const onConnectWallet = useCallback(async () => {

    if (await connectBrowserExtensionWallet()) {
      refreshBalances()
    }

  }, [refreshBalances])

  const onCreateTrade = useCallback(async (keyInAmount) => {
    refreshBalances()
    
    setTrade(await createTrade(keyInAmount))
  
  }, [refreshBalances])

  const onSetTokensOut = useCallback((tokenType) => {
    setCurrentConfigTokensOut(tokenType)
    refreshBalances()
    onCreateTrade(inputAmount) 
    
  }, [inputAmount, onCreateTrade, refreshBalances])

  const onTrade = useCallback(async () => {
    setTxState(await createAndExecuteTrade(inputAmount))
    setShowImg(true)
  }, [inputAmount])
  
  const token_logo = {"ETH" : eth_logo,'USDC' : usdc_logo,'DAI' : dai_logo}

  const checksumAddress = (address) => {
    return ethers.utils.getAddress(address)
  }
  
  useEffect(()=>{
      setShowImg(false)   
    }, [tokenOutBalance])
  
  return (
    <div className="App">
      <header>
        <div className="div__header--left">
            <nav className="nav__header">
                <figure className="figure__nav">
                    <img src={triangle} alt={"triangle"} height="40px"/>
                    <figcaption className="figure__nav__caption">BCFong</figcaption>
                </figure>
            </nav>
        </div>

        <div className="div__header--middle">
        </div>

        <div className="div__header--right">

            <div className="svg_eth">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4817 4.29043L7.08715 11.516C6.91315 11.8019 7.00806 12.1725 7.29743 12.3421L11.692 14.9163C11.8818 15.0279 12.1182 15.0279 12.308 14.9163L16.7026 12.3421C16.9919 12.1725 17.0869 11.8019 16.9129 11.516L12.5192 4.29043C12.2838 3.90319 11.7171 3.90319 11.4817 4.29043Z" fill="#6B8AFF"></path><path d="M15.7897 15.0102C15.7897 14.999 15.7878 14.9888 15.7869 14.9786C15.785 14.9684 15.7831 14.9582 15.7813 14.948C15.7785 14.9359 15.7748 14.9248 15.7711 14.9127C15.7683 14.9035 15.7655 14.8951 15.7608 14.8868C15.7552 14.8738 15.7478 14.8608 15.7404 14.8487C15.7366 14.8422 15.7329 14.8348 15.7283 14.8283C15.7153 14.8098 15.7013 14.7912 15.6846 14.7754C15.6678 14.7597 15.6502 14.7448 15.6316 14.7318C15.625 14.7272 15.6185 14.7244 15.6111 14.7198C15.599 14.7123 15.586 14.7049 15.573 14.6993C15.5646 14.6956 15.5553 14.6928 15.546 14.6891C15.5348 14.6854 15.5228 14.6817 15.5107 14.6789C15.5004 14.6761 15.4902 14.6743 15.48 14.6734C15.4697 14.6715 15.4595 14.6706 15.4484 14.6706C15.4363 14.6706 15.4251 14.6697 15.413 14.6706C15.4046 14.6706 15.3963 14.6724 15.387 14.6734C15.374 14.6752 15.3609 14.6761 15.3479 14.6789C15.3442 14.6789 15.3405 14.6817 15.3368 14.6826C15.2968 14.6928 15.2586 14.7086 15.2233 14.7318L12.3311 16.4363C12.1265 16.5569 11.8735 16.5569 11.6689 16.4363L8.77673 14.7318C8.74139 14.7086 8.70326 14.6928 8.66327 14.6826C8.65955 14.6817 8.65583 14.6799 8.65211 14.6789C8.63909 14.6761 8.62607 14.6752 8.61305 14.6734C8.60468 14.6724 8.59631 14.6715 8.58701 14.6706C8.57492 14.6706 8.56376 14.6706 8.55167 14.6706C8.54144 14.6706 8.53029 14.6724 8.52006 14.6734C8.50983 14.6752 8.4996 14.6771 8.48937 14.6789C8.47728 14.6817 8.46612 14.6854 8.45403 14.6891C8.44473 14.6919 8.43636 14.6956 8.42706 14.6993C8.41404 14.7049 8.40102 14.7123 8.38893 14.7198C8.38242 14.7235 8.37498 14.7272 8.36847 14.7318C8.34987 14.7448 8.33127 14.7587 8.31546 14.7754C8.29965 14.7921 8.28477 14.8098 8.27175 14.8283C8.2671 14.8348 8.26431 14.8413 8.25966 14.8487C8.25222 14.8617 8.24478 14.8738 8.2392 14.8868C8.23548 14.8951 8.23269 14.9044 8.22897 14.9127C8.22525 14.9248 8.22153 14.9359 8.21874 14.948C8.21595 14.9582 8.21409 14.9684 8.21316 14.9786C8.2113 14.9888 8.21037 15 8.21037 15.0102C8.21037 15.0213 8.20944 15.0334 8.21037 15.0445C8.21037 15.0538 8.21223 15.0621 8.21316 15.0714C8.21502 15.0844 8.21595 15.0974 8.21874 15.1095C8.21967 15.115 8.22153 15.1197 8.22339 15.1243C8.23455 15.167 8.25315 15.2069 8.28012 15.244L11.4681 19.7265C11.7275 20.0911 12.2706 20.0911 12.5301 19.7265L15.718 15.244C15.745 15.2069 15.7636 15.167 15.7748 15.1243C15.7757 15.1197 15.7785 15.1141 15.7794 15.1095C15.7822 15.0965 15.7831 15.0844 15.785 15.0714C15.7859 15.0621 15.7869 15.0538 15.7878 15.0445C15.7878 15.0334 15.7878 15.0213 15.7878 15.0102H15.7897Z" fill="#6B8AFF"></path></svg>
            </div>

            {!getWalletAddress() && (
                <button className="button_connect" type="button" id="button_connect" onClick={onConnectWallet}>Connect</button>
              )}

            {getWalletAddress() && (
                <button className="button_connect" type="button" id="button_connect">{shortenAddress(checksumAddress(getWalletAddress()))}</button>
              )}

        </div>
      </header>
    

      <main>
        <div className="div__whatsapp">
            <a rel="noopener" data-mobile-target="" data-desktop-target="" target="" href="https://web.whatsapp.com/send?phone=6594359608">
                <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: "rotate(0deg)"}}>
                    <circle className="color-element" cx="19.4395" cy="19.4395" r="19.4395" fill="#49E670"></circle>
                    <path d="M12.9821 10.1115C12.7029 10.7767 11.5862 11.442 10.7486 11.575C10.1902 11.7081 9.35269 11.8411 6.84003 10.7767C3.48981 9.44628 1.39593 6.25317 1.25634 6.12012C1.11674 5.85403 2.13001e-06 4.39053 2.13001e-06 2.92702C2.13001e-06 1.46351 0.83755 0.665231 1.11673 0.399139C1.39592 0.133046 1.8147 1.01506e-06 2.23348 1.01506e-06C2.37307 1.01506e-06 2.51267 1.01506e-06 2.65226 1.01506e-06C2.93144 1.01506e-06 3.21063 -2.02219e-06 3.35022 0.532183C3.62941 1.19741 4.32736 2.66092 4.32736 2.79397C4.46696 2.92702 4.46696 3.19311 4.32736 3.32616C4.18777 3.59225 4.18777 3.59224 3.90858 3.85834C3.76899 3.99138 3.6294 4.12443 3.48981 4.39052C3.35022 4.52357 3.21063 4.78966 3.35022 5.05576C3.48981 5.32185 4.18777 6.38622 5.16491 7.18449C6.42125 8.24886 7.39839 8.51496 7.81717 8.78105C8.09636 8.91409 8.37554 8.9141 8.65472 8.648C8.93391 8.38191 9.21309 7.98277 9.49228 7.58363C9.77146 7.31754 10.0507 7.1845 10.3298 7.31754C10.609 7.45059 12.2841 8.11582 12.5633 8.38191C12.8425 8.51496 13.1217 8.648 13.1217 8.78105C13.1217 8.78105 13.1217 9.44628 12.9821 10.1115Z" transform="translate(12.9597 12.9597)" fill="#FAFAFA"></path><path d="M0.196998 23.295L0.131434 23.4862L0.323216 23.4223L5.52771 21.6875C7.4273 22.8471 9.47325 23.4274 11.6637 23.4274C18.134 23.4274 23.4274 18.134 23.4274 11.6637C23.4274 5.19344 18.134 -0.1 11.6637 -0.1C5.19344 -0.1 -0.1 5.19344 -0.1 11.6637C-0.1 13.9996 0.624492 16.3352 1.93021 18.2398L0.196998 23.295ZM5.87658 19.8847L5.84025 19.8665L5.80154 19.8788L2.78138 20.8398L3.73978 17.9646L3.75932 17.906L3.71562 17.8623L3.43104 17.5777C2.27704 15.8437 1.55796 13.8245 1.55796 11.6637C1.55796 6.03288 6.03288 1.55796 11.6637 1.55796C17.2945 1.55796 21.7695 6.03288 21.7695 11.6637C21.7695 17.2945 17.2945 21.7695 11.6637 21.7695C9.64222 21.7695 7.76778 21.1921 6.18227 20.039L6.17557 20.0342L6.16817 20.0305L5.87658 19.8847Z" transform="translate(7.7758 7.77582)" fill="white" stroke="white" strokeWidth="0.2">
                    </path>
                </svg>
            </a> 
        </div>

        <section className="section__main_input">

        <article className="article__main">
    
        <div className="div__container">
          <div className="div__deposit">
            <span className="span--sm">Sell : </span>

              <div className="div__input">

              {!getProvider() && (<input className="input" type="number" placeholder="0.00" 
                      inputMode="decimal" 
                      id="input_amount" onChange={e => {console.log(e.target.value);}}/>)}

              {getProvider() && (<input className="input" type="number" placeholder="0.00" 
                      inputMode="decimal" 
                      id="input_amount" onChange={e => {setInputAmount(e.target.value); onCreateTrade(e.target.value);}}/>)}
                      
                <button className="button__input" type="button">
                  <div className="div__input__button__img__span"> 
                    <div className="div__input__img__span">
                      <img src={eth_logo} alt={"eth"} width="24px" height="24px" />
                      <span className="span__input__button__text">{CurrentConfig.tokens.etherNative.symbol}</span>
                    </div>
                  </div> 
                </button>
                
              </div>

              <div className="user_balance">
                <span className="span--sm">Balance: </span>
                  
                {!getWalletAddress() && (
                    <span className="span--sm" id="user_balance">0</span>
                  )}

                {getWalletAddress() && (
                    <span className="span--sm" id="user_balance">{ethBalance}</span>
                  )}
              </div> 
            </div>
        </div>

        <div className="div__transfer">
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.97168 1L6.20532 6L11.439 1" stroke="#AEAEAE"></path>
            </svg>
        </div>


        <div className="spinner_relative">
            {showImg?(<img src={spinner} alt = "spinner" height="80px" className="spinner_absolute"/>):(<></>)}
        </div>
    

        <div className="div__container">
          <div className="div__deposit">

              <span className="span--sm">Buy : </span>

              <div className="div__output">

              {!trade && (<input className="input" type="number" placeholder="0.00" 
                      inputMode="decimal" 
                      id="input_amount" onChange={e => {console.log(e.target.value)}}/>)}

                {trade &&<input className="input" type="number" placeholder={trade && amountSlice(displayTradeOutputAmount(trade))}
                      inputMode="decimal" 
                      id="input_amount" value={trade && amountSlice(displayTradeOutputAmount(trade))} 
                      onChange={e => {console.log(e.target.value);}} />}

                  <Dropdown>
                    <Dropdown.Button>
                      <div className="div__input__button__img__span"> 
                          <div className="div__input__img__span">
                              <img src={token_logo[getCurrentConfigTokensOut().symbol]} alt={getCurrentConfigTokensOut().symbol} width="24px" height="24px" />
                              <span className="span__input__button__text">{getCurrentConfigTokensOut().symbol}</span>
                          </div>
                      </div> 
                    </Dropdown.Button>
                    <Dropdown.Content>
                      <Dropdown.List>
                        <Dropdown.Item>
                          <div className="div__input__img__span">
                              <img src={token_logo[USDC_TOKEN.symbol]} alt={USDC_TOKEN.symbol} width="24px" height="24px" />
                              <span className="span__input__button__text" onClick={()=>{onSetTokensOut(USDC_TOKEN.symbol)}} >{USDC_TOKEN.symbol}</span>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <div className="div__input__img__span">
                            <img src={token_logo[DAI_TOKEN.symbol]} alt={DAI_TOKEN.symbol} width="24px" height="24px" />
                            <span className="span__input__button__text" onClick={()=>{onSetTokensOut(DAI_TOKEN.symbol)}} >{DAI_TOKEN.symbol}</span>
                          </div>
                        </Dropdown.Item>
                      </Dropdown.List>
                    </Dropdown.Content>
                  </Dropdown>
              </div>

              <div className="user_balance">
                <span className="span--sm">Balance: </span>
                
                {!getWalletAddress() && (
                    <span className="span--sm" id="user_balance">0</span>
                  )}

                {getWalletAddress() && (
                    <span className="span--sm" id="user_balance">{tokenOutBalance}</span>
                  )}
              </div>
          </div>
        </div>

    {getWalletAddress() && (<button className="button__deposit" id="button_deposit" type="submit" 
      onClick={() => onTrade()}
      disabled={
        txState === TransactionState.Sending ||
        getProvider() === null 
      }>
        Swap
    </button>)}

    {!getWalletAddress() && getProvider() && (
        
        <button className="button__deposit" id="button_deposit" 
        type="submit" 
        onClick={onConnectWallet}
        >
          Connect to wallet
      </button>)}

    {getProvider() === null && (<button className="button__deposit" id="button_deposit" type="submit" 
      >
        Please install a wallet
    </button>)}

  </article>

  </section>
  </main>

  <footer>

    <div className="block_number">
      {getWalletAddress() && (
          <span className="span--sm" id="user_balance">{`Block number : ${blockNumber + 1}`}</span>
        )}
    </div>

    <div className="div__footer">
      <span>&copy; 2024</span>| 
      <span><a href="mailto:contact.baochyang@gmail.com">contact.baochyang@gmail.com</a></span>|
      <span>
        <div className="div__footer--ai-center ">
            <span className="span--margin-horizontal-5px">+ 65 94359608</span>

            <span className="span--margin-horizontal-5px">
              <a rel="noopener" data-mobile-target="" data-desktop-target="" target="" href="https://web.whatsapp.com/send?phone=6594359608">
                  <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: "rotate(0deg)"}}>
                      <circle className="color-element" cx="19.4395" cy="19.4395" r="19.4395" fill="#49E670"></circle>
                      <path d="M12.9821 10.1115C12.7029 10.7767 11.5862 11.442 10.7486 11.575C10.1902 11.7081 9.35269 11.8411 6.84003 10.7767C3.48981 9.44628 1.39593 6.25317 1.25634 6.12012C1.11674 5.85403 2.13001e-06 4.39053 2.13001e-06 2.92702C2.13001e-06 1.46351 0.83755 0.665231 1.11673 0.399139C1.39592 0.133046 1.8147 1.01506e-06 2.23348 1.01506e-06C2.37307 1.01506e-06 2.51267 1.01506e-06 2.65226 1.01506e-06C2.93144 1.01506e-06 3.21063 -2.02219e-06 3.35022 0.532183C3.62941 1.19741 4.32736 2.66092 4.32736 2.79397C4.46696 2.92702 4.46696 3.19311 4.32736 3.32616C4.18777 3.59225 4.18777 3.59224 3.90858 3.85834C3.76899 3.99138 3.6294 4.12443 3.48981 4.39052C3.35022 4.52357 3.21063 4.78966 3.35022 5.05576C3.48981 5.32185 4.18777 6.38622 5.16491 7.18449C6.42125 8.24886 7.39839 8.51496 7.81717 8.78105C8.09636 8.91409 8.37554 8.9141 8.65472 8.648C8.93391 8.38191 9.21309 7.98277 9.49228 7.58363C9.77146 7.31754 10.0507 7.1845 10.3298 7.31754C10.609 7.45059 12.2841 8.11582 12.5633 8.38191C12.8425 8.51496 13.1217 8.648 13.1217 8.78105C13.1217 8.78105 13.1217 9.44628 12.9821 10.1115Z" transform="translate(12.9597 12.9597)" fill="#FAFAFA"></path><path d="M0.196998 23.295L0.131434 23.4862L0.323216 23.4223L5.52771 21.6875C7.4273 22.8471 9.47325 23.4274 11.6637 23.4274C18.134 23.4274 23.4274 18.134 23.4274 11.6637C23.4274 5.19344 18.134 -0.1 11.6637 -0.1C5.19344 -0.1 -0.1 5.19344 -0.1 11.6637C-0.1 13.9996 0.624492 16.3352 1.93021 18.2398L0.196998 23.295ZM5.87658 19.8847L5.84025 19.8665L5.80154 19.8788L2.78138 20.8398L3.73978 17.9646L3.75932 17.906L3.71562 17.8623L3.43104 17.5777C2.27704 15.8437 1.55796 13.8245 1.55796 11.6637C1.55796 6.03288 6.03288 1.55796 11.6637 1.55796C17.2945 1.55796 21.7695 6.03288 21.7695 11.6637C21.7695 17.2945 17.2945 21.7695 11.6637 21.7695C9.64222 21.7695 7.76778 21.1921 6.18227 20.039L6.17557 20.0342L6.16817 20.0305L5.87658 19.8847Z" transform="translate(7.7758 7.77582)" fill="white" stroke="white" strokeWidth="0.2">
                      </path>
                  </svg>
              </a> 
            </span>
            
        </div>
          
      </span>
    </div>

  </footer>

</div>
  )
}

export default UniswapV3

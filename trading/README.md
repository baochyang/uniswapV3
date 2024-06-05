### Trading
### Overview
This decentralised application (dApp) executes a Uniswap V3 single hop exact-input quoted swap trade (i.e. for ETH to USDC and ETH to DAI) via a wallet connection.


### Configuration
Using an in-browser wallet, this application can interact with:
1. A locally deployed mainnet fork
2. The mainnet


### Setup
### Install dependencies
1. Run npm install to install the project dependencies
2. Run npm install:chain to download and install Foundry


### Run your local chain
1. Create an API key using any of the Ethereum API providers and grab the respective RPC URL, eg https://mainnet.infura.io/v3/0ac57a06f2994538829c14745750d721
2. Run npm start:chain <api_provider_RPC_URL> in a separate terminal session to start up a copy of the mainnet blockchain locally


### Select your wallet
For testing on a locally deployed mainnet fork, you can use the first sample wallet offered by Foundry (listed in the terminal output upon starting your local chain). If you'd like to use a different wallet, modify the config's wallet address and privateKey. Note these are not used when configured to use a wallet extension.


### Setup a wallet browser extension
1. Install a wallet browser extension
2. Add a new manual/local network to your wallet local chain using http://localhost:8545 for your RPC URL and 1337 for your chain ID, and ETH for your currency.
3. Import your selected wallet using your private key (e.g. 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 from Foundry's example wallets)
4. Refer the guidelines to adding a network manually in MetaMask in the following link: https://support.metamask.io/networks-and-sidechains/managing-networks/how-to-add-a-custom-network-rpc/


### Start the web interface
Run npm start and navigate to http://localhost:3000/


### Long Pending Transaction in MetaMask
In case, a long pending transaction happens, you may clear activity tab data in MetaMask by following the guidelines in the following link: https://support.metamask.io/managing-my-wallet/resetting-deleting-and-restoring/how-to-clear-your-account-activity-reset-account/


### dApp URL
The URL of this dApp is: https://uniswap-v3-trading.vercel.app/

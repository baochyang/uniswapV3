require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");
dotenv.config()


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {

  solidity: {
    compilers: [
      {
        version: "0.7.6",

        settings: {
          optimizer: {
            enabled: false, // for testing use false
            runs: 200,
            
          },
        },
        
      },
      {
        version: "0.8.24",

        settings: {
          optimizer: {
            enabled: false, // for testing use false
            runs: 200,
            
          },
        },
        
      },
    ],
  },

  networks: {
    hardhat: {
        forking: {
            // url: 'https://eth-mainnet.alchemyapi.io/v2/XXXXXXXXXX', // or any other public RPC endpoint
             url: process.env.RPC_URL
            // url: 'https://1rpc.io/eth'
        }
      }
  },




};

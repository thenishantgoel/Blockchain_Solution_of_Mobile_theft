require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, process.env.ALCHEMY_API_URL),
      network_id: 11155111, // Sepolia's network ID
      gas: 5500000,
      gasPrice: 50000000000, // 50 Gwei
    },
  },
  compilers: {
    solc: {
      version: "0.8.0", // specify your Solidity version
    },
  },
};

require('dotenv').config();
console.log(`Private Key: ${process.env.PRIVATE_KEY}`);
console.log(`Alchemy API URL: ${process.env.ALCHEMY_API_URL}`);
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, process.env.ALCHEMY_API_URL),
      network_id: 11155111, // Sepolia's network ID
      gas: 5500000,
      gasPrice: 20000000000, // 20 Gwei
    },
  },
  compilers: {
    solc: {
      version: "0.8.0", // specify your Solidity version
    },
  },
};

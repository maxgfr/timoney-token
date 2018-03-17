var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "12 words mnemonic";

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/0nkNLrwmSkw0BbbjtHEP", 1)
      },
      gas: 2712388,
      network_id: 3
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://mainnet.infura.io/0nkNLrwmSkw0BbbjtHEP", 0)
      },
      gas: 2712388,
      network_id: 1
    },
    quiknode: {
      host: "https://repeatedly-infinite-catfish.quiknode.io/5554806b-8d03-4a10-95df-6e5181dd6079/8eqjl6_rNGhOJQKycM_g4w\=\=/",
      port: 443,
      network_id: "*" // Match any network id
    }
  }
};

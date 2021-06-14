const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: "7545",
      network_id: "*" // match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider(`[your phrases]`, `https://rinkeby.infura.io/v3/4e39e2f271624a6ab52cfd035f0db773`),
       network_id: 4,
       gas: 5500000,
       confirmations: 2,
       timeoutBlocks: 200,
       skipDryRun: true
    }
  }
};

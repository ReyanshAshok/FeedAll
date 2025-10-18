require("@nomicfoundation/hardhat-toolbox");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  network :{
      hardhat: {
      accounts: {
        mnemonic: "test test test test test test test test test test test junk"
      }
    },
    localhost: {
      url: "http://127.0.01:8545/",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk"
      }
    },
    polygon_amoy:{
      url: "https://rpc-amoy.polygon.technology",
      accounts:["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
      chain:80002
    }
  },
  etherscan: {
    apikey:""
  }
};

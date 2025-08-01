require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const { task } = require("hardhat/config");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
      sepolia:{
      url:process.env.NEXT_PUBLIC_RPC_URL,
      accounts:[process.env.NEXT_PUBLIC_PRIVATE_KEY]
    }
  }
};

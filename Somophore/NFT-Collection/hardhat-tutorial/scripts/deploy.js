const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  const metadataURL = METADATA_URL;

  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");

  const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
    metadataURL,
    whitelistContract
  );

  await deployedCryptoDevsContract.deployed();

  console.log(
    "CryptoDevs Contract deployed to: ", deployedCryptoDevsContract.address
  );
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});


// 0xe7BAd80AE9F6d5d7ede6dEd3e73dB4f29B95ef8a
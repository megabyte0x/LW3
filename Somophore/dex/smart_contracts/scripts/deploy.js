const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { TOKEN_CONTRACT_ADDRESS } = require("../constants");

async function main() {

  const crpytoDevTokenAddress = TOKEN_CONTRACT_ADDRESS;

  const exchangeContract = await ethers.getContractFactory("Exchange");

  const exchangeContractDeploy = await exchangeContract.deploy(crpytoDevTokenAddress);

  await exchangeContractDeploy.deployed();

  console.log("Exchange Contract deployed to:", exchangeContractDeploy.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// 0xEd1190B1a6CE0CE6ea4C8EBD8c5B9C4a040daC76
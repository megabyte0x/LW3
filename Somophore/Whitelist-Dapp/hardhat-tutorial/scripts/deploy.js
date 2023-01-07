const { ethers } = require("hardhat");

async function main() {

  const whitelistContract = await ethers.getContractFactory("Whitelist");

  const deployWhitelist = await whitelistContract.deploy(10);

  await deployWhitelist.deployed();

  console.log("Whitelist deployed to:", deployWhitelist.address);

}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});


// 0xedDfBA627f92F32EE2Fe2a8035C2a7152DE83244
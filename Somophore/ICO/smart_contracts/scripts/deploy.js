const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { NFT_COLLECTION_ADDRESS } = require("../constants")


async function main() {

  const cryptoDevsNFTCollectionAddress = NFT_COLLECTION_ADDRESS;

  const cryptoDevTokenContract = await ethers.getContractFactory("CryptoDevToken");

  const deployCryptoDevTokenContract = await cryptoDevTokenContract.deploy(cryptoDevsNFTCollectionAddress);

  await deployCryptoDevTokenContract.deployed();

  console.log(
    "Crypto Dev Token Contract Address:",
    deployCryptoDevTokenContract.address
  );
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
})

//0xAD58458d90694c0FC8cE462945bF09960426A7F5
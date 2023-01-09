const { ethers } = require("hardhat");
const { NFT_CONTRACT_ADDRESS } = require("../constants");

async function main() {

  const FakeNFTMarketplace = await ethers.getContractFactory("FakeNFTMarketplace");
  const fakeNFTMarketplace = await FakeNFTMarketplace.deploy();
  await fakeNFTMarketplace.deployed();
  console.log("FakeNFTMarketplace deployed to:", fakeNFTMarketplace.address);

  const CryptoDevDAO = await ethers.getContractFactory("CryptoDevDAO");
  const cryptoDevDAO = await CryptoDevDAO.deploy(fakeNFTMarketplace.address, NFT_CONTRACT_ADDRESS, {
    value: ethers.utils.parseEther("1")
  });
  await cryptoDevDAO.deployed();
  console.log("CryptoDevDAO deployed to:", cryptoDevDAO.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// FakeNFTMarketplace deployed to: 0xF20DED5Cac2E1c0661E2F81D22F4059BB9761D40
// CryptoDevDAO deployed to: 0xE2C984a4faD8E9232D1bb0c2b9978E854cafcf21

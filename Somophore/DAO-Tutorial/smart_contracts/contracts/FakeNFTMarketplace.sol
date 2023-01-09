// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract FakeNFTMarketplace {
    mapping(uint256 => address) public tokens;

    uint256 public nftPrice = 0.01 ether;

    function purchase(uint256 _tokenId) external payable {
        require(msg.value == nftPrice, "Price doesn't match");
        tokens[_tokenId] = msg.sender;
    }

    function getPrice() public view returns (uint256) {
        return nftPrice;
    }

    function available(uint256 _tokenId) external view returns (bool) {
        if (tokens[_tokenId] == address(0)) {
            return true;
        }
        return false;
    }
}

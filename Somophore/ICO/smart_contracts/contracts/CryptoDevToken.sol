// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./ICryptoDevs.sol";

contract CryptoDevToken is ERC20, Ownable {
    uint256 public constant tokenPrice = 0.001 ether;

    uint256 public constant tokensPerNFT = 10 * 10 ** 18;

    uint256 public constant maxTokenSupply = 10000 * 10 ** 18;

    ICryptoDevs CryptoDevsNFT;

    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address devsNFTAddress) ERC20("Megabyte", "MB") {
        CryptoDevsNFT = ICryptoDevs(devsNFTAddress);
    }

    function mint(uint256 amount) public payable {
        uint256 _requiredAmount = tokenPrice * amount;
        require(msg.value >= _requiredAmount, "Insufficient Funds");

        uint256 amountWithDecimals = amount * 10 ** 18;
        require(
            (totalSupply() + amountWithDecimals) <= maxTokenSupply,
            "Max Tokens Distributed"
        );

        _mint(msg.sender, amountWithDecimals);
    }

    function claim() public {
        address sender = msg.sender;

        uint256 balance = CryptoDevsNFT.balanceOf(sender);

        require(balance > 0, "You don't own any Crypto Dev NFTs");

        uint256 amount = 0;

        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = CryptoDevsNFT.tokenOfOwnerByIndex(sender, i);

            if (!tokenIdsClaimed[tokenId]) {
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }

        require(amount > 0, "You have already claimed the tokens");

        _mint(sender, amount * tokensPerNFT);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "Contract have 0 balance.");

        address _owner = owner();
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Withdraw Failed");
    }

    receive() external payable {}

    fallback() external payable {}
}

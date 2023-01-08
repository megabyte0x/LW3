// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    string _baseTokenURI;

    uint256 public _price = 0.01 ether;

    bool public _paused;

    uint256 public maxTokenIds = 20;

    uint256 public tokenIds;

    IWhitelist whitelist;

    bool public preSaleStarted;

    uint256 public preSaleEnded;

    modifier onlyWhenNotPaused() {
        require(!_paused, "Contract is Paused");
        _;
    }

    constructor(
        string memory baseURI,
        address whitelistContract
    ) ERC721("Megabyte", "MB") {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    function startPreSale() public onlyOwner {
        preSaleStarted = true;

        preSaleEnded = block.timestamp + 5 minutes;
    }

    function preSaleMint() public payable onlyWhenNotPaused {
        require(
            preSaleStarted && block.timestamp <= preSaleEnded,
            "Presale is ended"
        );
        require(
            whitelist.whitelistedAddresses(msg.sender),
            "You are not whitelisted"
        );
        require(tokenIds < maxTokenIds, "Maximum NFTs minted");
        require(msg.value >= _price, "Price not matched");

        tokenIds += 1;

        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable onlyWhenNotPaused {
        require(
            preSaleStarted && block.timestamp >= preSaleEnded,
            "Presale has not ended yet"
        );
        require(tokenIds < maxTokenIds, "Maximum NFTs minted");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setPause(bool val) public onlyOwner {
        _paused = val;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Error in transaction");
    }

    receive() external payable {}

    fallback() external payable {}
}

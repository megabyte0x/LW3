//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Whitelist {
    uint256 public maxWhitelistedAddresses;

    mapping(address => bool) public whitelistedAddresses;

    uint256 public numAddressesWhitelisted;

    constructor(uint256 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    function addAddressToWhitelist() public {
        require(!whitelistedAddresses[msg.sender], "Already Whitelisted");
        require(
            numAddressesWhitelisted <= maxWhitelistedAddresses,
            "Max Whitelisted"
        );

        whitelistedAddresses[msg.sender] = true;

        numAddressesWhitelisted += 1;
    }
}

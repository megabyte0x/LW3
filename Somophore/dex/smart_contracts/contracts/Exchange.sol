// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public cryptoDevTokenAddress;

    constructor(
        address _cryptoDevTokenAddress
    ) ERC20("Megabyte LP Token", "MBLP") {
        require(_cryptoDevTokenAddress != address(0), "Zero Address");
        cryptoDevTokenAddress = _cryptoDevTokenAddress;
    }

    function getReserve() public view returns (uint) {
        return ERC20(cryptoDevTokenAddress).balanceOf(address(this));
    }

    function addLiquidity(uint _amount) public payable returns (uint) {
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint cryptoDevTokenReserve = getReserve();
        ERC20 cryptoDevToken = ERC20(cryptoDevTokenAddress);

        if (cryptoDevTokenReserve == 0) {
            cryptoDevToken.transferFrom(msg.sender, address(this), _amount);

            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        } else {
            uint ethReserve = ethBalance - msg.value;

            uint cryptoDevTokenAmount = (msg.value * cryptoDevTokenReserve) /
                (ethReserve);
            require(
                _amount >= cryptoDevTokenAmount,
                "Amount of tokens sent is less than the amount required"
            );

            cryptoDevToken.transferFrom(
                msg.sender,
                address(this),
                cryptoDevTokenAmount
            );

            liquidity = (totalSupply() * msg.value) / (ethReserve);
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    function removeLiquidity(uint _amount) public payable returns (uint, uint) {
        require(_amount > 0, "Amount cannot be zero");
        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply();

        uint ethAmount = (ethReserve * _amount) / (_totalSupply);

        uint cryptoDevTokenAmount = (getReserve() * _amount) / (_totalSupply);

        _burn(msg.sender, _amount);

        payable(msg.sender).transfer(ethAmount);

        ERC20(cryptoDevTokenAddress).transfer(msg.sender, cryptoDevTokenAmount);

        return (ethAmount, cryptoDevTokenAmount);
    }

    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "Invalid Reserves");

        uint256 inputAmountWithFee = inputAmount * 99;

        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;

        return numerator / denominator;
    }

    function ethToCryptoDevToken(uint _mintTokens) public payable {
        uint256 tokenReserve = getReserve();

        uint256 tokensBought = getAmountOfTokens(
            msg.value,
            address(this).balance - msg.value,
            tokenReserve
        );

        require(tokensBought > _mintTokens, "insufficient output amount");

        ERC20(cryptoDevTokenAddress).transfer(msg.sender, tokensBought);
    }

    function cryptoDevTokenToETH(uint _tokenSold, uint _mintETH) public {
        uint256 tokenReserve = getReserve();

        uint256 ethBought = getAmountOfTokens(
            _tokenSold,
            tokenReserve,
            address(this).balance
        );

        require(ethBought >= _mintETH, "insufficient output amount");

        ERC20(cryptoDevTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokenSold
        );

        payable(msg.sender).transfer(ethBought);
    }
}

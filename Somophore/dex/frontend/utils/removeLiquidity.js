import { Contract } from "ethers";
import {
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS
} from "../constants";

export const removeLiquidity = async (
    signer,
    removeLPTokenAmount
) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            signer
        );

        tx = await exchangeContract.removeLiquidity(removeLPTokenAmount);
        await tx.wait();
    } catch (err) {
        console.error(err);
    }
};

export const getTokenAfterRemove = async (
    provider,
    removeLPTokenAmount,
    _ethBalance,
    cryptoDevtTokenReserve
) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            signer
        );

        const _totalSupply = await exchangeContract.totalSupply();

        const _removeETH = _ethBalance.mul(removeLPTokenAmount).div(_totalSupply);
        const _removeCryptoDevToken = cryptoDevtTokenReserve.mul(removeLPTokenAmount).div(_totalSupply);

        return {
            _removeETH,
            _removeCryptoDevToken
        };
    } catch (err) {
        console.error(err);
    }
};
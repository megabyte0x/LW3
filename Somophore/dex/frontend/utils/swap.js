import { Contract } from "ethers";
import {
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS
} from "../constants";

export const getAmountOfTokenReceivedFromSwap = async (
    provider,
    _swapAmountInWEI,
    ethSelected,
    ethBalance,
    reserveCrpytoDevToken
) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );

        let amountOfTokens;

        if (ethSelected) {
            amountOfTokens = await exchangeContract.getAmountOfTokens(
                _swapAmountInWEI,
                ethBalance,
                reserveCrpytoDevToken
            );
        } else {
            amountOfTokens = await exchangeContract.getAmountOfTokens(
                _swapAmountInWEI,
                reserveCrpytoDevToken,
                ethBalance
            );
        }
        return amountOfTokens;
    } catch (err) {
        console.error(err);
    }
};

export const swaps = async (
    signer,
    _swapAmountInWEI,
    tokenToBeReceivedAfterSwap,
    ethSelected
) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            signer
        );
        const tokenContract = new Contract(
            TOKEN_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            signer
        );

        let tx;

        if (ethSelected) {
            tx = await exchangeContract.ethToCryptoDevToken(
                tokenToBeReceivedAfterSwap,
                {
                    value: _swapAmountInWEI
                }
            )
        } else {
            tx = await tokenContract.approve(
                EXCHANGE_CONTRACT_ADDRESS,
                _swapAmountInWEI
            );

            await tx.wait();

            tx = await exchangeContract.cryptoDevTokenToETH(
                _swapAmountInWEI,
                tokenToBeReceivedAfterSwap
            );
        }
        await tx.wait();
    } catch (err) {
        console.error(err);
    }
};
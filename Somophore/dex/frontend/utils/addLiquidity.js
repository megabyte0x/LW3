import { Contract, utils } from "ethers";
import {
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS
} from "../constants";

export const addLiquidity = async (
    signer,
    addETHAmountInWEI,
    addCryptoDevTokenAmountInWEI
) => {
    try {
        const tokenContract = new Contract(
            TOKEN_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            signer
        );

        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            signer
        );

        let tx = await tokenContract.approve(
            EXCHANGE_CONTRACT_ADDRESS,
            addCryptoDevTokenAmountInWEI.toString());

        await tx.wait();

        tx = await exchangeContract.addLiquidity(
            addCryptoDevTokenAmountInWEI, {
            value: addETHAmountInWEI
        });
        await tx.wait();
    } catch (err) {
        console.error(err);
    }
};

export const calculateCrpytoDevTokenAmount = async (
    _addEther = "0",
    etherBalanceContract,
    cryptoDevTokenReserve
) => {
    const _addETHAmountInWEI = utils.parseEther(_addEther);

    const cryptoDevTokenAmount =
        _addETHAmountInWEI
            .mul(cryptoDevTokenReserve)
            .div(etherBalanceContract);

    return cryptoDevTokenAmount;
}
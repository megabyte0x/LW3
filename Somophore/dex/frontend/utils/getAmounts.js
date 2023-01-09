import { Contract } from 'ethers';
import {
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS
} from '../constants';

export const getEtherBalance = async (provider, address, contract = false) => {
    try {
        if (contract) {
            const balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
            return balance;
        } else {
            const balance = await provider.getBalance(address);
            return balance;
        }
    } catch (err) {
        console.error(err);
        return 0;
    }
};

export const getCryptoDevTokenBalance = async (provider, address) => {
    try {
        const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);
        const balance = await tokenContract.balanceOf(address);
        return balance;
    } catch (err) {
        console.error(err);
        return 0;
    };
};

export const getLPTokenBalance = async (provider, address) => {
    try {
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider);
        const balance = await exchangeContract.balanceOf(address);
        return balance;
    } catch (error) {
        console.error(error);
        return 0;
    }
};

export const getReserveOfCryptoDevTokens = async (provider) => {
    try {
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider);
        const balance = await exchangeContract.getReserve();
        return balance;
    } catch (err) {
        console.error(err);
        return 0;
    }
}
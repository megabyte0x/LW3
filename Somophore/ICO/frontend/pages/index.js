import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
    NFT_CONTRACT_ABI,
    NFT_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {

    const zero = BigNumber.from(0);

    const [walletConnected, setWalletConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isOwner, setOwner] = useState(false);

    const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
    const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] = useState(zero);
    const [tokenAmount, setTokenAmount] = useState(zero);
    const [tokensMinted, setTokensMinted] = useState(zero);

    const web3ModalRef = useRef();

    const getProviderOrSigner = async (needSigner = false) => {

        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 80001) {
            window.alert("Change the network to Polygon Mumbai");
            throw new Error("Change network to Polygon Mumbai");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    };

    const connectWallet = async () => {
        try {
            await getProviderOrSigner();
            setWalletConnected(true);
        } catch (error) {
            console.error(error);
        }
    };

    const getTokensToBeClaimed = async () => {

        try {
            const provider = await getProviderOrSigner();

            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
            const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);

            const signer = await getProviderOrSigner(true);

            const address = await signer.getAddress();

            const balance = await nftContract.balanceOf(address);

            if (balance === zero) {
                setBalanceOfCryptoDevTokens(zero);
            } else {
                var amount = 0;

                for (var i = 0; i < balance; i++) {
                    const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
                    const claimed = await tokenContract.tokenIdsClaimed(tokenId);
                    if (!claimed) {
                        amount += 1;
                    }
                }

                setTokensToBeClaimed(amount);
            }
        } catch (error) {
            console.error(error);
            setTokensToBeClaimed(zero);
        }
    }

    const getBalanceOfCryptoDevToken = async () => {
        try {

            const signer = await getProviderOrSigner(true);

            const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);

            const address = await signer.getAddress();

            const balance = await tokenContract.balanceOf(address);

            setBalanceOfCryptoDevTokens(balance);
        } catch (error) {
            console.error(error);
            setBalanceOfCryptoDevTokens(zero);
        }
    }

    const mintCrptoDevToken = async (amount) => {

        try {
            const signer = await getProviderOrSigner(true);

            const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);

            const value = 0.001 * amount;

            const tx = await tokenContract.mint(amount, {
                value: utils.parseEther(value.toString()),
            });
            setLoading(true);

            await tx.wait();
            setLoading(false);

            window.alert("Sucessfully minted Crypto Dev Tokens");
            await getBalanceOfCryptoDevToken();
            await getTotalTokensMinted();
            await getTokensToBeClaimed();

        } catch (error) {
            console.error(error);
        }
    };

    const claimCryptoDevTokens = async () => {
        try {

            const signer = await getProviderOrSigner(true);


            const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);

            const tx = tokenContract.claim();
            setLoading(true);

            await tx.wait();
            setLoading(false);

            window.alert("Sucessfully claimed Crypto Dev Tokens");
            await getBalanceOfCryptoDevToken();
            await getTotalTokensMinted();
            await getTokensToBeClaimed();

        } catch (error) {
            console.error(error);
        }
    };

    const getTotalTokensMinted = async () => {
        try {
            const provider = await getProviderOrSigner();
            const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);

            const _tokensMinted = await tokenContract.totalSupply();
            setTokensMinted(_tokensMinted);

        } catch (error) {
            console.error(error);
        }
    };

    const getOwner = async () => {
        try {
            const provider = await getProviderOrSigner();

            const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);

            const _owner = await tokenContract.owner();

            const signer = await getProviderOrSigner(true);

            const address = await signer.getAddress();

            if (address.toLowerCase() === _owner.toLowerCase()) {
                console.log("owner found")
                setOwner(true);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const withdrawBalance = async () => {
        try {
            const signer = await getProviderOrSigner(true);

            const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);

            const tx = await tokenContract.withdraw();
            setLoading(true);

            await tx.wait();
            setLoading(false);

            await getOwner();
        } catch (error) {
            console.error(error);
            window.alert(err.reason);
        }
    };

    useEffect(() => {
        if (!walletConnected) {
            web3ModalRef.current = new Web3Modal({
                network: "matic",
                providerOptions: {},
                disableInjectedProvider: false,
            });
            connectWallet();
            getTotalTokensMinted();
            getBalanceOfCryptoDevToken();
            getTokensToBeClaimed();
            getOwner();
        }
    }, [walletConnected]);

    const renderButton = () => {
        if (loading) {
            return (
                <button
                    className={styles.button}>
                    Loading ...
                </button>
            );
        }
        if (tokensToBeClaimed > 0) {
            return (
                <div >
                    <div
                        className={styles.description}>
                        {tokensToBeClaimed * 10}Tokens to be Claimed!
                    </div>
                    <button
                        className={styles.button}
                        onClick={claimCryptoDevTokens}>
                        Claim Tokens
                    </button>
                </div>
            );
        }

        return (
            <div style={{ display: "flex-col" }} >
                <div>
                    <input
                        type="number"
                        placeholder="Amount of Tokens"
                        onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
                        className={styles.inpur}
                    />
                </div>
                <button
                    className={styles.button}
                    disabled={!(tokenAmount > 0)}
                    onClick={() => mintCrptoDevToken(tokenAmount)}>
                    Mint Tokens!
                </button>
            </div >
        );
    };

    return (
        <div>
            <Head>
                <title>Crypto Devs</title>
                <meta name="description" content="ICO-Dapp" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.main}>
                <div>
                    <h1 className={styles.title}>Welcome to Crypto Devs</h1>
                    <div className={styles.description}>
                        You can claim or mint Crypto Dev tokens here!
                    </div>
                    {walletConnected ? (
                        <div>
                            <div className={styles.description}>
                                You have minted {utils.formatEther(balanceOfCryptoDevTokens)} Crypto Dev Tokens
                            </div>
                            <div className={styles.description}>
                                Overall {utils.formatEther(tokensMinted)} /10000 have been minted!!!
                            </div>
                            {renderButton()}
                            {isOwner ? (
                                <div>
                                    {
                                        loading ?
                                            <button className={styles.button} >Loading...</button>
                                            :
                                            <button className={styles.button} onClick={withdrawCoins}>
                                                Withdraw Coins
                                            </button>
                                    }
                                </div>
                            ) : ("")}
                        </div>
                    ) : (
                        <button className={styles.button} onClick={connectWallet} >Connect Wallet</button>

                    )
                    }
                </div>
                <div>
                    <img className={styles.image} src="./cryptodevs/0.svg" />
                </div>
            </div>
            <footer className={styles.footer}>
                Made with &#10084; by Crypto Devs
            </footer>
        </div>
    );

}

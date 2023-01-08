import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [preSaleStarted, setPreSaleStarted] = useState(false);
  const [preSaleEnded, setPreSaleEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setOwner] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
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

  const preSaleMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      const tx = await nftContract.preSaleMint({
        value: utils.parseEther("0.01")
      })

      setLoading(true);

      await tx.wait();

      setLoading(false);

      window.alert("You successfully minted a Crypto Dev!");
    } catch (error) {
      console.error(error);
    }
  }

  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(NFT_CONTRACT_ADDRESSl, abi, signer);

      const tx = await nftContract.preSaleMint({
        value: utils.parseEther("0.01")
      })

      setLoading(true);

      await tx.wait();

      setLoading(false);

      window.alert("You successfully minted a Crypto Dev!");
    } catch (error) {
      console.error(error);
    }
  }

  const startPreSale = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      const tx = await nftContract.startPreSale();

      setLoading(true);

      await tx.wait();

      setLoading(false);

      await checkIfPreSaleStarted();
    } catch (error) {
      console.error(error);
    }
  }

  const checkIfPreSaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      const _preSaleStarted = await nftContract.preSaleStarted();

      if (!_preSaleStarted) {
        await getOwner();
      }
      setPreSaleStarted(_preSaleStarted);
      return _preSaleStarted;

    } catch (error) {
      console.error(error);
      return false;
    }
  }

  const checkIfPreSaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      const _preSaleEnded = await nftContract.preSaleEnded();

      const hasEnded = _preSaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPreSaleEnded(true);
      } else {
        setPreSaleEnded(false);
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      const _owner = await nftContract.owner();

      const signer = await getProviderOrSigner(true);

      const address = await signer.getAddress();

      if (address.toLowerCase() === _owner.toLowerCase()) {
        console.log("owner found")
        setOwner(true);
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  const getTokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      const _tokenIds = await nftContract.tokenIds();

      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      const _preSaleStarted = checkIfPreSaleStarted();
      if (_preSaleStarted) {
        checkIfPreSaleEnded();
      }

      getTokenIdsMinted();

      const preSaleEndedInterval = setInterval(async function () {
        const _preSaleStarted = await checkIfPreSaleEnded();
        if (_preSaleStarted) {
          const _preSaleEnded = await checkIfPreSaleEnded();
          if (_preSaleEnded) {
            clearInterval(preSaleEndedInterval);
          }
        }
      }, 5 * 1000);

      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);

    }
  }, [walletConnected]);

  const renderButton = () => {

    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }


    if (loading) {
      return (
        <button className={styles.button}>Loading...</button>
      );
    }

    if (isOwner && !preSaleStarted) {
      return (
        <button className={styles.button} onClick={startPreSale}>
          Start PreSale!
        </button>
      );
    }

    if (!preSaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasnt started!</div>
        </div>
      );
    }

    if (preSaleStarted && !preSaleEnded) {
      return (
        <div >
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Crypto
            Dev 🥳
          </div>
          <button className={styles.button} onClick={preSaleMint}>
            PreSale Mint!!!
          </button>
        </div>
      );
    }

    if (preSaleStarted && preSaleEnded) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint
        </button>
      );
    }
  };

  return (
    <>
      <div>
        <Head>
          <title>Crypto Devs</title>
          <meta name="description" content="Whitelist-Dapp" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
            <div className={styles.description}>
              Its an NFT collection for developers in Crypto.
            </div>
            <div className={styles.description}>
              {tokenIdsMinted}/20 have been minted
            </div>
            {renderButton()}
          </div>
          <div>
            <img className={styles.image} src="./cryptodevs/0.svg" />
          </div>
        </div>
        <footer className={styles.footer}>
          Made with &#10084; by Crypto Devs
        </footer>
      </div>
    </>
  )


}
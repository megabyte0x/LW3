import { BigNumber, utils, providers } from "ethers";
import React, { useEffect, useState, useRef } from "react";
import Web3Modal from "web3modal";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { addLiquidity, calculateCrpytoDevTokenAmount } from "../utils/addLiquidity";
import {
  getEtherBalance,
  getCryptoDevTokenBalance,
  getReserveOfCryptoDevTokens,
  getLPTokenBalance
} from "../utils/getAmounts";
import {
  getTokenAfterRemove,
  removeLiquidity,
} from "../utils/removeLiquidity";
import { swaps, getAmountOfTokenReceivedFromSwap } from "../utils/swap";

export default function Home() {

  const [loading, setLoading] = useState(false);

  const [liquidityTab, setLiquidityTab] = useState(true);

  const zero = BigNumber.from(0);

  const [ethBalance, setEthBalance] = useState(zero);

  const [reserveCryptoDevTokenBalance, setReserveCryptoDevTokenBalance] = useState(zero);

  const [ethBalanceContract, setEthBalanceContract] = useState(zero);

  const [cryptoDevTokenBalance, setCryptoDevTokenBalance] = useState(zero);

  const [lpTokenBalance, setLpTokenBalance] = useState(zero);

  const [addETH, setAddETH] = useState(zero);

  const [addCryptoDevToken, setAddCryptoDevToken] = useState(zero);

  const [removeETH, setRemoveETH] = useState(zero);

  const [removeCryptoDevToken, setRemoveCryptoDevToken] = useState(zero);

  const [removeLPToken, setRemoveLPToken] = useState(zero);

  const [swapAmount, setSwapAmount] = useState(zero);

  const [tokenToBeReceivedAfterSwap, setTokenToBeReceivedAfterSwap] = useState(zero);

  const [ethSelected, setETHSelected] = useState(true);

  const web3ModalRef = useRef();

  const [walletConnected, setWalletConnect] = useState(false);

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
      setWalletConnect(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getAmounts = async () => {
    try {
      const provider = await getProviderOrSigner();
      const signer = await getProviderOrSigner(true);
      const address = signer.getAddress();

      const _ethBalance = await getEtherBalance(provider, address);
      setEthBalance(_ethBalance);

      const _reserveCryptoDevTokenBalance = await getReserveOfCryptoDevTokens(provider);
      setReserveCryptoDevTokenBalance(_reserveCryptoDevTokenBalance);

      const _ethBalanceContract = await getEtherBalance(provider, null, true);
      setEthBalanceContract(_ethBalanceContract);

      const _cryptoDevTokenBalance = await getCryptoDevTokenBalance(provider, address);
      setCryptoDevTokenBalance(_cryptoDevTokenBalance);

      const _lpTokenBalance = await getLPTokenBalance(provider, address);
      setLpTokenBalance(_lpTokenBalance);
    } catch (err) {
      console.error(err);
    }
  };

  const _swapTokens = async () => {
    try {
      const _swapAmountInWEI = utils.parseEther(swapAmount);

      if (!_swapAmountInWEI.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);

        await swaps(
          signer,
          _swapAmountInWEI,
          tokenToBeReceivedAfterSwap,
          ethSelected,
        );

        setLoading(false);

        await getAmounts();
        setSwapAmount("");

      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setSwapAmount("");
    }
  };

  const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
    try {
      const _swapAmountInWEI = utils.parseEther(_swapAmount.toString());
      if (!_swapAmountInWEI.eq(zero)) {
        const provider = await getProviderOrSigner();
        const _ethBalance = await getEtherBalance(provider, null, true);
        const amountOfToken = await getAmountOfTokenReceivedFromSwap(
          provider,
          _swapAmountInWEI,
          ethSelected,
          _ethBalance,
          reserveCryptoDevTokenBalance
        );
        setTokenToBeReceivedAfterSwap(amountOfToken);
      } else {
        setCryptoDevTokenBalance(zero);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const _addLiquidity = async () => {
    try {
      const addETHInWEI = utils.parseEther(addETH.toString());

      if (!addCryptoDevToken.eq(zero) && !addETHInWEI.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);

        await addLiquidity(
          signer,
          addETHInWEI,
          addCryptoDevToken
        );
        setLoading(false);

        setAddCryptoDevToken(zero);

        await getAmounts();
      } else {
        setAddCryptoDevToken(zero);
      }

    } catch (err) {
      console.error(err);
      setLoading(false);
      setAddCryptoDevToken(zero);
    }
  };

  const _removeLiquidity = async () => {
    try {
      const singer = await getProviderOrSigner(true);

      const removeLPTokenInWEI = utils.parseEther(removeLPToken);
      setLoading(true);

      await removeLiquidity(signer, removeLPTokenInWEI);
      setLoading(false);

      await getAmounts();
      setRemoveCryptoDevToken(zero);
      setRemoveETH(zero);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setRemoveCryptoDevToken(zero);
      setRemoveETH(zero);
    }
  };

  const _getTokensAfterRemove = async (_removeCryptoDevToken) => {
    try {
      const provider = await getProviderOrSigner();

      const _removeCryptoDevTokenInWEI = utils.parseEther(_removeCryptoDevToken);

      const _ethBalance = await getEtherBalance(provider, null, true);

      const _cryptoDevtTokenReserveBalance = await getReserveOfCryptoDevTokens(provider);

      const { _removeETH, _removeCryptoDev } = await getTokenAfterRemove(
        provider,
        _removeCryptoDevTokenInWEI,
        _ethBalance,
        _cryptoDevtTokenReserveBalance
      );

      setRemoveETH(_removeETH);
      setRemoveCryptoDevToken(_removeCryptoDev);
    } catch (error) {
      console.error(error);
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
      getAmounts();
    }
  }, [walletConnected]);

  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    if (liquidityTab) {
      return (
        <div>
          <div className={styles.description}>
            You have:
            <br />
            {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
            {utils.formatEther(cryptoDevTokenBalance)} Crypto Dev Tokens
            <br />
            {utils.formatEther(ethBalance)} Matic
            <br />
            {utils.formatEther(lpTokenBalance)} Crypto Dev LP tokens
          </div>
          <div>
            {/* If reserved CD is zero, render the state for liquidity zero where we ask the user
            how much initial liquidity he wants to add else just render the state where liquidity is not zero and
            we calculate based on the `Eth` amount specified by the user how much `CD` tokens can be added */}
            {utils.parseEther(reserveCryptoDevTokenBalance.toString()).eq(zero) ? (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Matic"
                  onChange={(e) => setAddETH(e.target.value || "0")}
                  className={styles.input}
                />
                <input
                  type="number"
                  placeholder="Amount of CryptoDev tokens"
                  onChange={(e) =>
                    setAddCryptoDevToken(
                      BigNumber.from(utils.parseEther(e.target.value || "0"))
                    )
                  }
                  className={styles.input}
                />
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Matic"
                  onChange={async (e) => {
                    setAddETH(e.target.value || "0");
                    // calculate the number of CD tokens that
                    // can be added given  `e.target.value` amount of Eth
                    const _addCDTokens = await calculateCrpytoDevTokenAmount(
                      e.target.value || "0",
                      ethBalanceContract,
                      reserveCryptoDevTokenBalance
                    );
                    setAddCryptoDevToken(_addCDTokens);
                  }}
                  className={styles.input}
                />
                <div className={styles.inputDiv}>
                  {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                  {`You will need ${utils.formatEther(addCryptoDevToken)} Crypto Dev
                  Tokens`}
                </div>
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
              </div>
            )}
            <div>
              <input
                type="number"
                placeholder="Amount of LP Tokens"
                onChange={async (e) => {
                  setRemoveLPToken(e.target.value || "0");
                  // Calculate the amount of Ether and CD tokens that the user would receive
                  // After he removes `e.target.value` amount of `LP` tokens
                  await _getTokensAfterRemove(e.target.value || "0");
                }}
                className={styles.input}
              />
              <div className={styles.inputDiv}>
                {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                {`You will get ${utils.formatEther(removeCryptoDevToken)} Crypto
              Dev Tokens and ${utils.formatEther(removeETH)} Eth`}
              </div>
              <button className={styles.button1} onClick={_removeLiquidity}>
                Remove
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <input
            type="number"
            placeholder="Amount"
            onChange={async (e) => {
              setSwapAmount(e.target.value || "");
              // Calculate the amount of tokens user would receive after the swap
              await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
            }}
            className={styles.input}
            value={swapAmount}
          />
          <select
            className={styles.select}
            name="dropdown"
            id="dropdown"
            onChange={async () => {
              setETHSelected(!ethSelected);
              // Initialize the values back to zero
              await _getAmountOfTokensReceivedFromSwap(0);
              setSwapAmount("");
            }}
          >
            <option value="eth">Matic</option>
            <option value="cryptoDevToken">Crypto Dev Token</option>
          </select>
          <br />
          <div className={styles.inputDiv}>
            {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
            {ethSelected
              ? `You will get ${utils.formatEther(
                tokenToBeReceivedAfterSwap
              )} Crypto Dev Tokens`
              : `You will get ${utils.formatEther(
                tokenToBeReceivedAfterSwap
              )} Matic`}
          </div>
          <button className={styles.button1} onClick={_swapTokens}>
            Swap
          </button>
        </div>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs Exchange!</h1>
          <div className={styles.description}>
            Exchange Matic &#60;&#62; Crypto Dev Tokens
          </div>
          <div>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(true);
              }}
            >
              Liquidity
            </button>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(false);
              }}
            >
              Swap
            </button>
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
  );
}

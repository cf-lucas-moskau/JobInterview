import './App.css';
import React, { useEffect, useState } from 'react';
import web3 from 'web3';
import { ethers } from "ethers";

function App() {

  const [account, setAccount] = useState();

  // Function to connect wallet
  const connectWallet = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (accounts.length > 0) {
      const chainId = "1287"; // Moonbase Alpha chainId
  
      if (window.ethereum.networkVersion !== chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: web3.utils.toHex(chainId) }]
          });
        } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
          if (err.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: 'Moonbase Alpha',
                  chainId: web3.utils.toHex(chainId),
                  nativeCurrency: { name: 'DEV', decimals: 18, symbol: 'DEV' },
                  rpcUrls: ['https://rpc.testnet.moonbeam.network']
                }
              ]
            });
          }
        }
      }
      // set account
      console.log(accounts);
      setAccount(accounts[0]);
    }
  }

  const getSigner = async () => {
      // A Web3Provider wraps a standard Web3 provider, which is
      // what MetaMask injects as window.ethereum into each page
      const provider = await getProvider();

      // MetaMask requires requesting permission to connect users accounts
      await provider.send("eth_requestAccounts", []);

      // The MetaMask plugin also allows signing transactions
      // For this, you need the account signer...
      const signer = provider.getSigner();
      return signer;
  }

  const getProvider = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const block = await provider.getBlockNumber();
    console.log(block);
    return provider;
  }

  // Function to start playing the game

  // Function to start listening to events

  return (
    <div>
      {account ? (
        <div>
          <h1>Connected Account</h1>
          <p>{account}</p>
          {/* App Code goes here */}
        </div>
      ) : (
        <button className='connect-button' onClick={connectWallet}>
          Connect to Moonbase Alpha
        </button>
      )}

    </div>
  );
}

export default App;

import "./App.css";
import React, { useEffect, useState } from "react";
import web3 from "web3";
import { ethers } from "ethers";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { gameContractAbi, gameContractAddress } from "./gameContractInfo";

function App() {
  const [account, setAccount] = useState();
  const [loading, setLoading] = useState(false);
  const [smartContract, setSmartContract] = useState();
  const [participated, setParticipated] = useState([]);

  // Function to connect wallet
  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length > 0) {
      const chainId = "1287"; // Moonbase Alpha chainId

      if (window.ethereum.networkVersion !== chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: web3.utils.toHex(chainId) }],
          });
        } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
          if (err.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainName: "Moonbase Alpha",
                  chainId: web3.utils.toHex(chainId),
                  nativeCurrency: { name: "DEV", decimals: 18, symbol: "DEV" },
                  rpcUrls: ["https://rpc.testnet.moonbeam.network"],
                },
              ],
            });
          }
        }
      }
      // set account
      console.log(accounts);
      setAccount(accounts[0]);
    }
  };

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
  };

  const getProvider = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const block = await provider.getBlockNumber();
    console.log(block);
    return provider;
  };

  // Function to start playing the game
  const playGame = async (e) => {
    setLoading(true);
    const signer = await getSigner();
    const smartContract = new ethers.Contract(
      gameContractAddress,
      gameContractAbi,
      signer
    );
    setSmartContract(smartContract);

    await smartContract.playGame();
  };

  // Function to start listening to events
  useEffect(() => {
    if (smartContract) {
      smartContract.once(
        "Participated",
        (lastParticipant, lastNumber, lastRandom, winner) => {
          setParticipated((currentParticipated) => [
            ...currentParticipated,
            {
              lastParticipant,
              lastNumber,
              lastRandom,
              winner,
            },
          ]);
          setLoading(false);
        }
      );
    }
  }, [smartContract]);

  return (
    <div className="m-4 d-flex justify-content-center">
      {account ? (
        <div className="d-flex flex-column align-items-center">
          <Alert key="success" variant="success" className="text-center m-6">
            <h3>Connected Account</h3>
            <p>{account}</p>
          </Alert>

          <Button
            variant="outline-success"
            disabled={loading}
            onClick={!loading ? playGame : null}
          >
            {loading ? "Loading…" : smartContract ? "Play Again" : "Play Game"}
          </Button>

          {participated.length > 0 ? (
            <div className="m-4">
              {[...participated].reverse().map((p, i) => (
                <Card
                  className="m-3"
                  key={i}
                  border={i === 0 ? "success" : "secondary"}
                >
                  {i === 0 && (
                    <Card.Header className="bg-success lead lead-text text-white">
                      Last Game
                    </Card.Header>
                  )}
                  <Card.Body>
                    <p>Participant: {p.lastParticipant}</p>
                    <p>Last Number: {p.lastNumber.toNumber()}</p>
                    <p>Last Random: {p.lastRandom.toNumber()}</p>
                    <p>Winner: {p.winner ? "yes" : "no"}</p>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className="m-4">
              {loading ? (
                <Spinner animation="border" />
              ) : (
                <span>
                  Start the Game by clicking on the "Play Game" Button
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <Button variant="success" onClick={connectWallet}>
          Connect to Moonbase Alpha
        </Button>
      )}
    </div>
  );
}

export default App;

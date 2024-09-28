const HDWalletProvider = require("@truffle/hdwallet-provider");
const {Web3} = require("web3");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv")
dotenv.config()


const Factory = require("./build/UploadFactory.json");

const provider = new HDWalletProvider(
  "sketch sunset delay movie group drama mesh usage spot sausage olive cost",
  process.env.sepolia
);

const web3 = new Web3(provider);

const deploy = async () => {
  try {
    const accounts = await web3.eth.getAccounts();
    console.log("Attempting to deploy from account", accounts[0]);

    const result = await new web3.eth.Contract(Factory.abi)
      .deploy({ data: '0x' + Factory.evm.bytecode.object })
      .send({ gas: "250000", from: accounts[0] });

    console.log("Contract deployed to", result); 
  } catch (error) {
    console.error("Deployment failed:", error);
  } finally {
    provider.engine.stop();
  }
};

deploy();

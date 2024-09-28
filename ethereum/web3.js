const {Web3} = require('web3');
const dotenv = require("dotenv")
dotenv.config()
let web3;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  
  window.ethereum.request({ method: "eth_requestAccounts" })
    .catch(error => console.error("User denied account access"));
  web3 = new Web3(window.ethereum);
} else {
  const provider = new Web3.providers.HttpProvider(
    process.env.sepolia
  );
  web3 = new Web3(provider);
}

module.exports = web3;

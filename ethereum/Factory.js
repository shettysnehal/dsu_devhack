const Web3 = require('./web3');
const dotenv = require("dotenv")
dotenv.config()
const Factory = require('./build/UploadFactory.json');
const instance = new Web3.eth.Contract(
    Factory.abi,
    process.env.factory
);

module.exports = instance;
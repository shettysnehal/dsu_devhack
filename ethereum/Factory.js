const Web3 = require('./web3');
const Factory = require('./build/UploadFactory.json');
const instance = new Web3.eth.Contract(
    Factory.abi,
    '0x5a388cbBc40A900f0F8Dc2a5c924E82239903844'
);

module.exports = instance;
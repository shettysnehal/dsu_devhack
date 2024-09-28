const Web3 = require('./web3');
const Upload = require('./build/Upload.json');

module.exports = (address) => {
  return new Web3.eth.Contract(Upload.abi, address);
};
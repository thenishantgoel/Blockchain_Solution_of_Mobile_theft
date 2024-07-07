var IMEI = artifacts.require("./IMEI.sol");

module.exports = function (deployer) {
  deployer.deploy(IMEI);
};
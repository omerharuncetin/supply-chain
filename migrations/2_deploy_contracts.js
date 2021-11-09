var ItemManager = artifacts.require("../contracts/ItemManager.sol");

module.exports = function(deployer) {
  deployer.deploy(ItemManager);
};

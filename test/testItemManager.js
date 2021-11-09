const ItemManager = artifacts.require('./ItemManager.sol')

contract("ItemManager", async accounts => {
    it("should be able to add an Item", async () => {
        const itemManagerInstance = await ItemManager.deployed();
        const itemName = "test1";
        const itemPrice = 500;
        
        let result = await itemManagerInstance.createItem(itemName, itemPrice, {from: accounts[0]})
        assert.equal(result.logs[0].args._itemIndex, 0, "It's not the first item")

        let item = await itemManagerInstance.items(result.logs[0].args._itemIndex)
        assert.equal(item._item, result.logs[0].args._itemAddress, "It's not the same item")
    })

    it("should be able pay item", async () => {
        const itemManagerInstance = await ItemManager.deployed();
        const itemName = "test2";
        const itemPrice = 500;
        
        let itemResult = await itemManagerInstance.createItem(itemName, itemPrice, {from: accounts[0]})

        await web3.eth.sendTransaction({from: accounts[0], to: itemResult.logs[0].args._itemAddress, value: itemPrice, gas: 300000})
        
        let item = await itemManagerInstance.items(itemResult.logs[0].args._itemIndex)
        assert.equal(item._state, 1, "Item is not paid.")
    })

    it("should be able deliver item", async () => {
        const itemManagerInstance = await ItemManager.deployed();
        const itemName = "test3";
        const itemPrice = 500;
        
        let itemResult = await itemManagerInstance.createItem(itemName, itemPrice, {from: accounts[0]})

        await web3.eth.sendTransaction({from: accounts[0], to: itemResult.logs[0].args._itemAddress, value: itemPrice, gas: 300000})
        
        await itemManagerInstance.triggerDelivery(itemResult.logs[0].args._itemIndex, {from: accounts[0]})
        
        
        let item = await itemManagerInstance.items(itemResult.logs[0].args._itemIndex)
        assert.equal(item._state, 2, "Item is not delivered.")
    })
})
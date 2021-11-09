pragma solidity ^0.6.0;

import "./Item.sol";
import "./Ownable.sol";

contract ItemManager is Ownable {
    enum SupplyChainState {
        Created,
        Paid,
        Delivered
    }

    struct S_Item {
        Item _item;
        string _identifier;
        uint256 _itemPrice;
        ItemManager.SupplyChainState _state;
    }

    event SupplyChainStep(
        uint256 _itemIndex,
        uint256 _step,
        address _itemAddress
    );

    mapping(uint256 => S_Item) public items;
    uint256 itemIndex;

    function createItem(string memory _identifier, uint256 _itemPrice)
        public
        onlyOwner
    {
        Item item = new Item(this, _itemPrice, itemIndex);
        items[itemIndex]._item = item;

        items[itemIndex]._identifier = _identifier;
        items[itemIndex]._itemPrice = _itemPrice;
        items[itemIndex]._state = SupplyChainState.Created;

        emit SupplyChainStep(
            itemIndex,
            uint256(items[itemIndex]._state),
            address(item)
        );
        itemIndex++;
    }

    function triggerPayment(uint256 _itemIndex) public payable {
        require(
            items[_itemIndex]._itemPrice == msg.value,
            "Only full payments accepted."
        );
        require(
            items[_itemIndex]._state == SupplyChainState.Created,
            "Item is further on the chain."
        );

        items[_itemIndex]._state = SupplyChainState.Paid;

        emit SupplyChainStep(
            _itemIndex,
            uint256(SupplyChainState.Paid),
            address(items[_itemIndex]._item)
        );
    }

    function triggerDelivery(uint256 _itemIndex) public onlyOwner {
        require(
            items[_itemIndex]._state == SupplyChainState.Paid,
            "Item is further on the chain."
        );
        items[_itemIndex]._state = SupplyChainState.Delivered;

        emit SupplyChainStep(
            _itemIndex,
            uint256(items[_itemIndex]._state),
            address(items[_itemIndex]._item)
        );
    }
}

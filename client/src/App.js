import React, { Component } from "react";
import ItemManagerContract from "./contracts/ItemManager.json";
import ItemContract from "./contracts/Item.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, cost: 0, itemName: "", itemNumber: 0, currentItems: [] };



  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.itemManager = new this.web3.eth.Contract(
        ItemManagerContract.abi,
        ItemManagerContract.networks[this.networkId] && ItemManagerContract.networks[this.networkId].address,
      );

      this.item = new this.web3.eth.Contract(
        ItemContract.abi,
        ItemContract.networks[this.networkId] && ItemContract.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToPaymentEvent();
      this.setState({ loaded: true });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }

  handleSubmit = async () => {
    const { cost, itemName } = this.state;
    let result = await this.itemManager.methods.createItem(itemName, cost).send({ from: this.accounts[0] })
    this.saveItem(result.events.SupplyChainStep.returnValues, cost, itemName);
    alert(`Send ${cost} wei to ${result.events.SupplyChainStep.returnValues._itemAddress}`)
  }

  handleDeliverItem = async () => {
    const { itemNumber } = this.state;
    let result = await this.itemManager.methods.triggerDelivery(itemNumber).send({ from: this.accounts[0] })
  }

  getStateName = (state) => {
    switch (state) {
      case 0:
        return 'Created'
      case 1:
        return 'Paid'
      case 2:
        return 'Delivered'
      default:
        return ''
    }
  }

  saveItem = (event, cost, identifier) => {
    const { currentItems } = this.state;

    const currentItem = {
      index: parseInt(event._itemIndex),
      address: event._itemAddress,
      state: parseInt(event._step),
      costInWei: cost,
      identifier
    };

    this.setState({
      currentItems: [...currentItems, currentItem]
    })
  }

  setStateOfItem = (itemIndex, state) => {
    let { currentItems } = this.state;

    currentItems = currentItems.map((item) => {
      if (item.index == itemIndex) {
        item.state = state;
      }
      return item;
    })
    this.setState({
      currentItems
    });
  }

  listenToPaymentEvent = () => {
    this.itemManager.events.SupplyChainStep().on("data", async (event) => {
      const itemIndex = parseInt(event.returnValues._itemIndex);
      const itemObj = await this.itemManager.methods.items(itemIndex).call();
      this.setStateOfItem(itemIndex, parseInt(event.returnValues._step));
      switch (event.returnValues._step) {
        case "1":
          alert(`${itemObj._identifier} price is paid, deliver it now`)
          break;
        case "2":
          alert(`${event.returnValues._itemAddress} is delivered`)
          break;
        default:
          break;
      }
    })
  }

  render() {
    if (!this.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Event Trigger / Supply Chain Example</h1>
        <h2>Items</h2>
        <h2>Add Items:</h2>
        Cost In Wei: <input type="number" name="cost" value={this.state.cost} onChange={this.handleInputChange} />
        Item Identifier: <input type="text" name="itemName" value={this.state.itemName} onChange={this.handleInputChange} />
        <button type="button" onClick={this.handleSubmit}>Create New Item</button>
        <p></p>
        Index: <input type="text" name="itemNumber" value={this.state.itemNumber} onChange={this.handleInputChange} />
        <button type="button" onClick={this.handleDeliverItem}>Deliver Item</button>
        <ul>
          {this.state.currentItems.length > 0 && this.state.currentItems.map((item) =>
            <li className='list-item'>
              <span>Identifier: {item.identifier}</span>
              <span>Address: {item.address}</span>
              <span>Index: {item.index}</span>
              <span>Cost In Wei: {item.costInWei}</span>
              <span>Cost In ETH: {this.web3.utils.fromWei(item.costInWei, 'ether')}</span>
              <span>State: {this.getStateName(item.state)}</span>
            </li>
          )}
        </ul>
      </div>
    );
  }
}

export default App;

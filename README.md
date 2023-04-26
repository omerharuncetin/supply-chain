# Supply Chain Project with Solidity, Truffle and React.js
In this project, you can create Supply Chain by using React.js, Truffle and Solidity.

Main directory contains React.js frontend in `client` directory and Solidity contracts in `contracts` directory. You can find contract artifacts in `client/src/contracts`. 

You should create 2 terminals. 

In **Terminal 1** you should run blockchain. 

In the **Terminal 2** you should run React.js application

## Requirements
- You should run blockchain first, then frontend application.
- You should connect your metamask to **localhost:8545**.
- You should add your metamask one of the truffle accounts and use the platform with that.

## Run Blockchain
Run the commands below one by one
### Install Packages
`npm install`
### Start Truffle Development Environment
`truffle develop`
### Compile Smart Contracts
`truffle compile` or `compile`
### Deploy Smart Contracts To Local Blockchain
`truffle migrate` or `migrate`

## Run React.js Application

### Install Packages
`yarn install`

### Start Application
`yarn start`

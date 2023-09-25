# Smart contract to add liquidity to Uniswap V2

## Description

The MyERC1155 contract is an implementation of the ERC1155 token standard. It allows for the creation and management of multiple token types within a single contract. The contract supports both single and batch transfers of tokens, as well as minting new tokens. It also includes functions for checking token balances and approvals.

The contract is defined in the file `MyERC1155.sol`. It imports the necessary interfaces and libraries from OpenZeppelin to ensure compliance with the ERC1155 standard. The contract includes mappings to track token balances and operator approvals, as well as a URI function to retrieve the metadata URI for a given token ID.

The contract includes functions for minting new tokens, both individually and in batches. These functions require the caller to be the owner of the contract. The contract also includes functions for transferring tokens between addresses, both individually and in batches. These functions enforce the necessary checks and requirements to ensure the transfer is valid.

Overall, the MyERC1155 contract provides a robust and flexible implementation of the ERC1155 token standard, allowing for the creation and management of multiple token types within a single contract.

## Deployed contract example

You can find and test my deployed contract in goerli testnet by this address: [[0xa3073345541e46944Cb55d565B08555AB76DB990](https://mumbai.polygonscan.com/address/0x11df7A89D4cF807AE6Cfa9013967Ab4fA1dbcd79)

## Installation

Clone the repository using the following command:
Install the dependencies using the following command:

```
npm i
```

## Deployment

Fill in all the required environment variables(copy .env-example to .env and fill it).
Note:

- Mnemonic is 12 words phrase you can obtain while creating a new account (in Metamask for example)
- RPC_URL may be choosen here: https://chainlist.org
- ETHERSCAN may be obtained in your account profile on etherscan

Deploy contract to the chain (mumbai testnet):

```
npx hardhat run scripts/deploy.ts --network polygon-mumbai
```

## Tasks

Create new task(s) ans save it(them) in the folder "tasks". Add a new task name in the file "tasks/index.ts".

Running a task:

```
npx hardhat addLiquidity --token-a {TOKEN_A ADDRESS} --token-b {TOKEN_B ADDRESS} --value-a 10000000 --value-b 10000000 --network goerli
```

Note: Replace {TOKEN\_\* ADDRESS} with the address of the token.

## Verification

Verify the installation by running the following command:

```
npx hardhat verify --network goerli {CONTRACT_ADDRESS}
```

Note: Replace {CONTRACT_ADDRESS} with the address of the contract

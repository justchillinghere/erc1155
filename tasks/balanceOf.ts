import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from "cluster";
import { contractAddress } from "../hardhat.config";

task(
  "balanceOf",
  "This method allows to get balance of tokens on some user's account."
)
  .addParam("account", "Address of the account")
  .addParam("id", "Id of token to get")
  .setAction(
    async ({ account, id }: { account: string; id: number }, { ethers }) => {
      const TokenContract = await ethers.getContractFactory("MyERC1155");
      const tokenContract = TokenContract.attach(contractAddress!);

      const balance: BigNumber = await tokenContract.balanceOf(account, id);

      console.log(`${account} balance of token ${id} is ${balance.toString()}`);
    }
  );

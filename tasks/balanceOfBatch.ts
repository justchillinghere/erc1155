import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from "cluster";
import { contractAddress } from "../hardhat.config";

task(
  "balanceOfBatch",
  "This method allows to get balance of tokens on some user's account."
)
  .addParam("accounts", "Address of the account")
  .addParam("ids", "Id of token to get")
  .setAction(
    async (
      { accounts, ids }: { accounts: string[]; ids: number[] },
      { ethers }
    ) => {
      const TokenContract = await ethers.getContractFactory("MyERC1155");
      const tokenContract = TokenContract.attach(contractAddress!);

      const balances: BigNumber[] = await tokenContract.balanceOfBatch(
        accounts,
        ids
      );

      console.log(`${accounts} balances of tokens are ${balances.join(", ")}`);
    }
  );

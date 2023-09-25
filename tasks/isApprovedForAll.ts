import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from "cluster";
import { contractAddress } from "../hardhat.config";

task(
  "isApprovedForAll",
  "Returns true if operator is approved to transfer account's tokens"
)
  .addParam("account", "Address of the account for the request")
  .addParam("operator", "Address to check approval for")
  .setAction(
    async (
      { account, operator }: { account: string; operator: string },
      { ethers }
    ) => {
      const TokenContract = await ethers.getContractFactory("MyERC1155");
      const tokenContract = TokenContract.attach(contractAddress!);

      const isApprovedForAll: Boolean = await tokenContract.isApprovedForAll(
        account,
        operator
      );
      console.log(
        `The status of the approval for ${operator} of ${account} is ${isApprovedForAll}`
      );
    }
  );

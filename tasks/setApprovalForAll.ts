import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from "cluster";
import { contractAddress } from "../hardhat.config";

task(
  "setApprovalForAll",
  "This method allows the owner to mint new tokens \
	 and transfer them to a specified address."
)
  .addParam(
    "operator",
    "Address of from to approve spending\
	 tokens on behalf of the sender"
  )
  .addParam(
    "approved",
    "Grants or revokes permission to operator\
	 to transfer the caller's tokens"
  )
  .setAction(
    async (
      { operator, approved }: { operator: string; approved: boolean },
      { ethers }
    ) => {
      const TokenContract = await ethers.getContractFactory("MyERC1155");
      const tokenContract = TokenContract.attach(contractAddress!);

      const tokenContractTx: ContractTransaction =
        await tokenContract.setApprovalForAll(operator, approved);
      const tokenContractReceipt: ContractReceipt =
        await tokenContractTx.wait();

      const event = tokenContractReceipt.events?.find(
        (event) => event.event === "ApprovalForAll"
      );
      const eventAccount: Address = event?.args!["account"];
      const eventOperator: Address = event?.args!["operator"];
      const eventApproved: Boolean = event?.args!["approved"];
      console.log(
        `${eventAccount} has set permission (${eventApproved}) for ${eventOperator}`
      );
    }
  );

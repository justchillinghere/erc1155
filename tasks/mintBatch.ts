import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from "cluster";
import { contractAddress } from "../hardhat.config";

task(
  "mintBatch",
  "This method allows the owner to mint batch of tokens \
	 and transfer them to a specified address."
)
  .addParam("to", "Address of the receiver")
  .addParam("ids", "Ids of token to transfer")
  .addParam("amounts", "Amounts of tokens to mint")
  .addOptionalParam(
    "data",
    "Bytes data for additional information (0x for no data)",
    "0x"
  )
  .setAction(
    async (
      {
        to,
        ids,
        amounts,
        data,
      }: { to: string; ids: number[]; amounts: number[]; data: string },
      { ethers }
    ) => {
      const TokenContract = await ethers.getContractFactory("MyERC1155");
      const tokenContract = TokenContract.attach(contractAddress!);

      const tokenContractTx: ContractTransaction =
        await tokenContract.mintBatch(to, ids, amounts, data);
      const tokenContractReceipt: ContractReceipt =
        await tokenContractTx.wait();

      const event = tokenContractReceipt.events?.find(
        (event) => event.event === "TransferBatch"
      );
      const eventOperator: Address = event?.args!["operator"];
      const eventTo: Address = event?.args!["to"];
      const eventId: Number[] = event?.args!["ids"];
      const eventValue: Number[] = event?.args!["values"];
      console.log("The owner minted tokens");
      console.log(`Operator address: ${eventOperator}`);
      console.log(`Minted to: ${eventTo}`);
      console.log(`Minted token IDs: ${eventId}`);
      console.log(`Amounts minted: ${eventValue}`);
    }
  );

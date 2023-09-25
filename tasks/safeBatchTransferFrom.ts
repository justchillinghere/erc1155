import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from "cluster";
import { contractAddress } from "../hardhat.config";

task("transferBatchFrom", "Batch transfer tokens from one account to another")
  .addParam("from", "Address of the sender")
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
        from,
        to,
        ids,
        amounts,
        data,
      }: {
        from: string;
        to: string;
        ids: number[];
        amounts: number[];
        data: string;
      },
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
      const eventFrom: Address = event?.args!["from"];
      const eventTo: Address = event?.args!["to"];
      const eventId: number[] = event?.args!["ids"];
      const eventValue: number[] = event?.args!["values"];
      console.log("Transferred batch of tokens");
      console.log(`Operator address: ${eventOperator}`);
      console.log(`Transferred from address: ${eventFrom}`);
      console.log(`Transferred to: ${eventTo}`);
      console.log(`Transferred token IDs: ${eventId.join(", ")}`);
      console.log(`Transferred amounts: ${eventValue.join(", ")}`);
    }
  );

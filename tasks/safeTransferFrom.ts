import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from "cluster";
import { contractAddress } from "../hardhat.config";

task("transferFrom", "Transfer tokens from one account to another")
  .addParam("from", "Address of the sender")
  .addParam("to", "Address of the receiver")
  .addParam("id", "Id of token to transfer")
  .addParam("amount", "Amount of tokens to transfer")
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
        id,
        amount,
        data,
      }: { from: string; to: string; id: number; amount: number; data: string },
      { ethers }
    ) => {
      const TokenContract = await ethers.getContractFactory("MyERC1155");
      const tokenContract = TokenContract.attach(contractAddress!);

      const tokenContractTx: ContractTransaction =
        await tokenContract.safeTransferFrom(from, to, id, amount, data);
      const tokenContractReceipt: ContractReceipt =
        await tokenContractTx.wait();

      const event = tokenContractReceipt.events?.find(
        (event) => event.event === "TransferSingle"
      );
      const eventOperator: Address = event?.args!["operator"];
      const eventFrom: Address = event?.args!["from"];
      const eventTo: Address = event?.args!["to"];
      const eventId: Address = event?.args!["id"];
      const eventValue: Address = event?.args!["value"];
      console.log("Transfered tokens:");
      console.log(`Operator address: ${eventOperator}`);
      console.log(`From address: ${eventFrom}`);
      console.log(`Transfer to: ${eventTo}`);
      console.log(`Transfer token ID: ${eventId}`);
      console.log(`Amount transfered: ${eventValue}`);
    }
  );

import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from "cluster";
import { contractAddress } from "../hardhat.config";

task(
  "mint",
  "This method allows the owner to mint new tokens \
	 and transfer them to a specified address."
)
  .addParam("to", "Address of the receiver")
  .addParam("id", "Id of token to transfer")
  .addParam("amount", "Amount of tokens to mint")
  .addOptionalParam(
    "data",
    "Bytes data for additional information (0x for no data)",
    "0x"
  )
  .setAction(async ({ to, id, amount, data }, { ethers }) => {
    const TokenContract = await ethers.getContractFactory("MyERC1155");
    const tokenContract = TokenContract.attach(contractAddress!);

    const tokenContractTx: ContractTransaction = await tokenContract.mint(
      to,
      id,
      amount,
      data
    );
    const tokenContractReceipt: ContractReceipt = await tokenContractTx.wait();

    const event = tokenContractReceipt.events?.find(
      (event) => event.event === "TransferSingle"
    );
    const eventOperator: Address = event?.args!["operator"];
    const eventTo: Address = event?.args!["to"];
    const eventId: Address = event?.args!["id"];
    const eventValue: Address = event?.args!["value"];
    console.log("The owner minted tokens");
    console.log(`Operator address: ${eventOperator}`);
    console.log(`Minted to: ${eventTo}`);
    console.log(`Minted token ID: ${eventId}`);
    console.log(`Amount minted: ${eventValue}`);
  });

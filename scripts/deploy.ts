import { ethers, run, network } from "hardhat";
import process from "process";

const delay = async (time: number) => {
  return new Promise((resolve: any) => {
    setInterval(() => {
      resolve();
    }, time);
  });
};

async function main() {
  const uri =
    "https://ipfs.io/ipfs/QmaoGJ8Y2CFwyUwu4yZ71Dc9y71JEtVPCfNZkvpf2LgdTN?filename=ERC1155_metadata.json";
  const MyContract = await ethers.getContractFactory("MyERC1155");
  const myContract = await MyContract.deploy(uri);

  await myContract.deployed();

  console.log(`The contract has been deployed to ${myContract.address}`);

  console.log("wait of delay...");
  await delay(30000); // delay 30 seconds
  console.log("starting verify token...");
  try {
    await run("verify:verify", {
      address: myContract!.address,
      contract: "contracts/MyERC1155.sol:MyERC1155",
      constructorArguments: [uri],
    });
    console.log("verify success");
    return;
  } catch (e: any) {
    console.log(e.message);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

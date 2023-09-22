import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BaseProvider } from "ethers/node_modules/@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import {
  MyERC1155,
  MyERC1155__factory,
  GameItems,
  GameItems__factory,
} from "../src/types";

describe("Test ERC1155 implementation", function () {
  let myERC1155: MyERC1155;
  let MyERC1155: MyERC1155__factory;
  let gameItems: GameItems;
  let GameItems: GameItems__factory;

  let owner: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress,
    users: SignerWithAddress[];

  const provider: BaseProvider = ethers.getDefaultProvider();

  beforeEach(async () => {
    [owner, user1, user2, ...users] = await ethers.getSigners();
    MyERC1155 = (await ethers.getContractFactory(
      "MyERC1155"
    )) as MyERC1155__factory;
    myERC1155 = await MyERC1155.deploy("https://example.com/");

    // GameItems = (await ethers.getContractFactory(
    //   "GameItems"
    // )) as GameItems__factory;
    // gameItems = await GameItems.deploy("https://example.com/");
  });

  describe("Test token mint", function () {
    it("should mint correct amount of tokens to the owner", async () => {
      const amountToTransfer = ethers.utils.parseUnits("10", "18");
      await myERC1155.mint(owner.address, 0, amountToTransfer, []);
      expect(await myERC1155.balanceOf(owner.address, 0)).to.equal(
        amountToTransfer
      );
    });
    it("should emit event with correct arguments after mint", async () => {
      const amountToTransfer = ethers.utils.parseUnits("10", "18");
      expect(await myERC1155.mint(owner.address, 0, amountToTransfer, []))
        .to.emit(myERC1155, "TransferSingle")
        .withArgs(
          owner.address,
          "0x0000000000000000000000000000000000000000",
          owner.address,
          0,
          amountToTransfer
        );
    });
  });
});

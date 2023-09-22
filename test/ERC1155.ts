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
  const bytesData = "0x";

  let owner: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress,
    users: SignerWithAddress[];

  const provider: BaseProvider = ethers.getDefaultProvider();
  const amountToTransfer = ethers.utils.parseUnits("10", "18");

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
      await myERC1155.mint(owner.address, 0, amountToTransfer, bytesData);
      expect(await myERC1155.balanceOf(owner.address, 0)).to.equal(
        amountToTransfer
      );
    });
    it("should emit event with correct arguments after mint", async () => {
      expect(
        await myERC1155.mint(owner.address, 0, amountToTransfer, bytesData)
      )
        .to.emit(myERC1155, "TransferSingle")
        .withArgs(
          owner.address,
          "0x0000000000000000000000000000000000000000",
          owner.address,
          0,
          amountToTransfer
        );
    });
    it("should mint batch", async () => {
      const ids = [0, 1, 2, 3, 4, 5];
      const amounts = [1, 2, 3, 4, 5, 6];
      myERC1155.mintBatch(owner.address, ids, amounts, bytesData);
      for (let i = 0; i < ids.length; i++) {
        expect(await myERC1155.balanceOf(owner.address, ids[i])).to.equal(
          amounts[i]
        );
      }
    });
    it("should emit event after mint batch", async () => {
      const ids = [0, 1, 2, 3, 4, 5];
      const amounts = [1, 2, 3, 4, 5, 6];
      expect(await myERC1155.mintBatch(owner.address, ids, amounts, bytesData))
        .to.emit(myERC1155, "TransferBatch")
        .withArgs(
          owner.address,
          "0x0000000000000000000000000000000000000000",
          owner.address,
          ids,
          amounts
        );
    });
  });
  describe("Test token transfer", function () {
    const ids = [0, 1, 2, 3, 4, 5];
    const amounts = [1, 2, 3, 4, 5, 6];
    const oneTransferIndex = 0;
    beforeEach(async () => {
      myERC1155.mintBatch(owner.address, ids, amounts, bytesData);
    });
    it("should transfer correct amount of tokens", async () => {
      await myERC1155.safeTransferFrom(
        owner.address,
        user1.address,
        ids[oneTransferIndex],
        amounts[oneTransferIndex],
        bytesData
      );
      expect(await myERC1155.balanceOf(user1.address, 0)).to.equal(
        amounts[oneTransferIndex]
      );
    });
    it("should emit after transfer", async () => {
      expect(
        await myERC1155.safeTransferFrom(
          owner.address,
          user1.address,
          ids[oneTransferIndex],
          amounts[oneTransferIndex],
          bytesData
        )
      )
        .to.emit(myERC1155, "TransferSingle")
        .withArgs(
          owner.address,
          owner.address,
          user1.address,
          ids[oneTransferIndex],
          amounts[oneTransferIndex],
          bytesData
        );
    });
    it("should batch transfer correct amount of tokens", async () => {
      await myERC1155.safeBatchTransferFrom(
        owner.address,
        user1.address,
        ids,
        amounts,
        bytesData
      );
      for (let i = 0; i < ids.length; i++) {
        expect(await myERC1155.balanceOf(user1.address, ids[i])).to.equal(
          amounts[i]
        );
      }
    });
    it("should emit after batch transfer", async () => {
      expect(
        await myERC1155.safeBatchTransferFrom(
          owner.address,
          user1.address,
          ids,
          amounts,
          bytesData
        )
      )
        .to.emit(myERC1155, "TransferSingle")
        .withArgs(
          owner.address,
          owner.address,
          user1.address,
          ids,
          amounts,
          bytesData
        );
    });
  });
});

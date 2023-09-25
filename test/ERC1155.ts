import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BaseProvider } from "ethers/node_modules/@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import {
  MyERC1155,
  MyERC1155__factory,
  MyERC1155Receiver,
  MyERC1155Receiver__factory,
  GameItems,
  GameItems__factory,
} from "../src/types";

describe("Test ERC1155 implementation", function () {
  let myERC1155: MyERC1155;
  let MyERC1155: MyERC1155__factory;
  let gameItems: GameItems;
  let GameItems: GameItems__factory;
  const bytesData = "0x";
  const uri = "https://example.com/";

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
    myERC1155 = await MyERC1155.deploy(uri);

    // GameItems = (await ethers.getContractFactory(
    //   "GameItems"
    // )) as GameItems__factory;
    // gameItems = await GameItems.deploy("https://example.com/");
  });

  describe("Test URI in contract", function () {
    it("should return correct URI", async () => {
      expect(await myERC1155.uri(12)).to.equal(uri);
    });
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
          ethers.constants.AddressZero,
          owner.address,
          0,
          amountToTransfer
        );
    });
    it("should mint batch", async () => {
      const ids = [0, 1, 2, 3, 4, 5];
      const amounts = [1, 2, 3, 4, 5, 6];
      await myERC1155.mintBatch(owner.address, ids, amounts, bytesData);
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
          ethers.constants.AddressZero,
          owner.address,
          ids,
          amounts
        );
    });
  });
  describe("Negative cases for mint and mintBatch functions", function () {
    it("should revert mint for non-owner", async () => {
      await expect(
        myERC1155
          .connect(user1)
          .mint(user1.address, 0, amountToTransfer, bytesData)
      ).to.be.revertedWith("ERC1155: you are not an owner");
    });

    it("should revert mint to the zero address", async () => {
      await expect(
        myERC1155.mint(
          ethers.constants.AddressZero,
          0,
          amountToTransfer,
          bytesData
        )
      ).to.be.revertedWith("ERC1155: mint to the zero address");
    });

    it("should revert mintBatch for non-owner", async () => {
      const ids = [0, 1, 2];
      const amounts = [1, 2, 3];
      await expect(
        myERC1155
          .connect(user1)
          .mintBatch(user1.address, ids, amounts, bytesData)
      ).to.be.revertedWith("ERC1155: you are not an owner");
    });

    it("should revert mintBatch to the zero address", async () => {
      const ids = [0, 1, 2];
      const amounts = [1, 2, 3];
      await expect(
        myERC1155.mintBatch(
          ethers.constants.AddressZero,
          ids,
          amounts,
          bytesData
        )
      ).to.be.revertedWith("ERC1155: mint to the zero address");
    });

    it("should revert mintBatch if ids and amounts length mismatch", async () => {
      const ids = [0, 1, 2];
      const amounts = [1, 2];
      await expect(
        myERC1155.mintBatch(owner.address, ids, amounts, bytesData)
      ).to.be.revertedWith("ids and amounts length mismatch");
    });
  });
  describe("Test balanceOf and balanceOfBatch functions", function () {
    it("should return correct amount of tokens for batch", async () => {
      const ids = [0, 1, 2, 3, 4, 5];
      const amounts = [1, 2, 3, 4, 5, 6];
      let addresses: string[] = [];
      ids.forEach((_) => {
        addresses.push(owner.address);
      });
      await myERC1155.mintBatch(owner.address, ids, amounts, bytesData);
      const balanceOfBatch = await myERC1155.balanceOfBatch(addresses, ids);
      for (let i = 0; i < ids.length; i++) {
        expect(balanceOfBatch[i]).to.equal(amounts[i]);
      }
    });
    it("should revert if address is zero", async () => {
      await myERC1155.mint(owner.address, 0, amountToTransfer, bytesData);
      await expect(
        myERC1155.balanceOf(ethers.constants.AddressZero, 0)
      ).to.revertedWith("ERC1155: address zero is not a valid owner");
    });
    it("should revert if trying to get batch balance and ids and amounts arrays length mismatch", async () => {
      const ids = [0, 1, 2, 3, 4, 5];
      const amounts = [1, 2, 3, 4, 5, 6];
      await myERC1155.mintBatch(owner.address, ids, amounts, bytesData);
      await expect(
        myERC1155.balanceOfBatch([owner.address], ids)
      ).to.revertedWith("ERC1155: Accounts and ids length mismatch");
    });
  });
  describe("Test setApprovalForAll function", function () {
    it("should set approval for an operator correctly", async () => {
      const operator = user1.address;
      const approved = true;

      await myERC1155.setApprovalForAll(operator, approved);

      expect(
        await myERC1155.isApprovedForAll(owner.address, operator)
      ).to.equal(approved);
    });

    it("should emit ApprovalForAll event with the correct arguments", async () => {
      const operator = user1.address;
      const approved = true;

      expect(await myERC1155.setApprovalForAll(operator, approved))
        .to.emit(myERC1155, "ApprovalForAll")
        .withArgs(owner.address, operator, approved);
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
    it("Should transfer to a ERC1155Receiver Contract", async () => {
      const ReceiverContract = (await ethers.getContractFactory(
        "MyERC1155Receiver"
      )) as MyERC1155Receiver__factory;
      const receiverContract = await ReceiverContract.deploy();
      await receiverContract.deployed();
      await myERC1155.safeTransferFrom(
        owner.address,
        receiverContract.address,
        ids[oneTransferIndex],
        amounts[oneTransferIndex],
        bytesData
      );
      expect(await myERC1155.balanceOf(receiverContract.address, 0)).to.equal(
        amounts[oneTransferIndex]
      );
    });
    it("Should batch transfer to a ERC1155Receiver Contract", async () => {
      const ReceiverContract = (await ethers.getContractFactory(
        "MyERC1155Receiver"
      )) as MyERC1155Receiver__factory;
      const receiverContract = await ReceiverContract.deploy();
      await receiverContract.deployed();
      await myERC1155.safeBatchTransferFrom(
        owner.address,
        receiverContract.address,
        ids,
        amounts,
        bytesData
      );
      for (let i = 0; i < ids.length; i++) {
        expect(
          await myERC1155.balanceOf(receiverContract.address, ids[i])
        ).to.equal(amounts[i]);
      }
    });
  });
  describe("Negative cases for test token transfer", function () {
    const ids = [0, 1, 2, 3, 4, 5];
    const amounts = [1, 2, 3, 4, 5, 6];
    const oneTransferIndex = 0;
    beforeEach(async () => {
      myERC1155.mintBatch(owner.address, ids, amounts, bytesData);
    });
    it("should revert if trying to transfer more tokens than balance", async () => {
      await expect(
        myERC1155.safeTransferFrom(
          owner.address,
          user1.address,
          ids[oneTransferIndex],
          amounts[oneTransferIndex] + 1,
          bytesData
        )
      ).to.be.revertedWith("ERC1155: insufficient balance");
    });
    it("should revert if trying to transfer without allowance", async () => {
      myERC1155.safeTransferFrom(
        owner.address,
        user1.address,
        ids[oneTransferIndex],
        amounts[oneTransferIndex],
        bytesData
      );
      expect(
        await myERC1155.safeTransferFrom(
          user1.address,
          user2.address,
          ids[oneTransferIndex],
          amounts[oneTransferIndex],
          bytesData
        )
      ).to.be.revertedWith("ERC1155: insufficient allowance");
    });
    it("should revert if trying to batch transfer with ids and amounts arrays length mismatch", async () => {
      await expect(
        myERC1155.safeBatchTransferFrom(
          owner.address,
          user1.address,
          ids.slice(0, ids.length - 1),
          amounts,
          bytesData
        )
      ).to.be.revertedWith("ERC1155: Amounts and ids length mismatch");
    });
    it("should revert if trying to transfer to zero address", async () => {
      await expect(
        myERC1155.safeTransferFrom(
          owner.address,
          ethers.constants.AddressZero,
          ids[oneTransferIndex],
          amounts[oneTransferIndex] + 1,
          bytesData
        )
      ).to.be.revertedWith("ERC1155: cannot transfer to the zero address");
    });
    it("Should revert if trying to transfer to a non-IERC1155Receiver Contract", async () => {
      const ReceiverContract = (await ethers.getContractFactory(
        "MyERC1155"
      )) as MyERC1155__factory;
      const receiverContract = await ReceiverContract.deploy("some-uri");
      await receiverContract.deployed();
      await expect(
        myERC1155.safeTransferFrom(
          owner.address,
          receiverContract.address,
          ids[oneTransferIndex],
          amounts[oneTransferIndex],
          bytesData
        )
      ).to.be.revertedWith(
        "ERC1155: transfer to non-ERC1155Receiver implementer"
      );
    });

    it("should revert if trying to batch transfer to the zero address", async () => {
      const ids = [0, 1, 2];
      const amounts = [1, 2, 3];
      await expect(
        myERC1155.safeBatchTransferFrom(
          owner.address,
          ethers.constants.AddressZero,
          ids,
          amounts,
          bytesData
        )
      ).to.be.revertedWith("ERC1155: cannot transfer to the zero address");
    });
  });
  describe("Negative cases for batch test token transfer", function () {
    const ids = [0, 1, 2, 3, 4, 5];
    const amounts = [1, 2, 3, 4, 5, 6];
    beforeEach(async () => {
      myERC1155.mintBatch(owner.address, ids, amounts, bytesData);
    });
    it("should revert if trying to batch transfer without allowance", async () => {
      const ids = [0, 1, 2];
      const amounts = [1, 2, 3];
      await expect(
        myERC1155
          .connect(user1)
          .safeBatchTransferFrom(
            owner.address,
            user1.address,
            ids,
            amounts,
            bytesData
          )
      ).to.be.revertedWith("ERC1155: insufficient allowance");
    });

    it("should revert if trying to batch transfer more tokens than balance", async () => {
      const ids = [0, 1, 2];
      const amounts = [1, 2, 3];
      await expect(
        myERC1155.safeBatchTransferFrom(
          owner.address,
          user1.address,
          ids,
          [2, 3, 4], // Transfer more tokens than balance
          bytesData
        )
      ).to.be.revertedWith("ERC1155: insufficient balance");
    });
    it("Should revert if trying to batch transfer to a non-IERC1155Receiver Contract", async () => {
      const ReceiverContract = (await ethers.getContractFactory(
        "MyERC1155"
      )) as MyERC1155__factory;
      const receiverContract = await ReceiverContract.deploy("some-uri");
      await receiverContract.deployed();
      await expect(
        myERC1155.safeBatchTransferFrom(
          owner.address,
          receiverContract.address,
          ids,
          amounts,
          bytesData
        )
      ).to.be.revertedWith(
        "ERC1155: transfer to non-ERC1155Receiver implementer"
      );
    });
  });
});

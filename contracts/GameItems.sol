// contracts/GameItems.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./MyERC1155.sol";

contract GameItems is MyERC1155 {
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant THORS_HAMMER = 2;
    uint256 public constant SWORD = 3;
    uint256 public constant SHIELD = 4;

    constructor(string memory uri) MyERC1155(uri) {
        mint(msg.sender, GOLD, 10 ** 18, "");
        mint(msg.sender, SILVER, 10 ** 27, "");
        mint(msg.sender, THORS_HAMMER, 1, "");
        mint(msg.sender, SWORD, 10 ** 9, "");
        mint(msg.sender, SHIELD, 10 ** 9, "");
    }
}

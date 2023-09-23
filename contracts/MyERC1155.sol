// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./interfaces/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract MyERC1155 is IERC1155, ERC165 {
    address public owner;

    // Mapping from token ID to account balances
    mapping(uint256 => mapping(address => uint256)) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    // Mapping from account to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    string private _uri;

    constructor(string memory uri) {
        owner = msg.sender;
        _uri = uri;
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public {
        require(msg.sender == owner, "ERC1155: you are not an owner");
        require(to != address(0), "ERC1155: mint to the zero address");
        _balances[id][to] += amount;
        emit TransferSingle(msg.sender, address(0), to, id, amount);
        if (_isContract(to)) {
            _checkSafeTransferAcceptance(
                msg.sender,
                address(0),
                to,
                id,
                amount,
                data
            );
        }
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public {
        require(msg.sender == owner, "ERC1155: you are not an owner");
        require(to != address(0), "ERC1155: mint to the zero address");
        require(
            ids.length == amounts.length,
            "ids and amounts length mismatch"
        );
        for (uint256 i = 0; i < ids.length; i++) {
            _balances[ids[i]][to] += amounts[i];
        }
        emit TransferBatch(msg.sender, address(0), to, ids, amounts);
        if (_isContract(to)) {
            _checkSafeBatchTransferAcceptance(
                msg.sender,
                address(0),
                to,
                ids,
                amounts,
                data
            );
        }
    }

    function _mint(address to, uint256 id, uint256 amount) internal {
        _balances[id][to] += amount;
        emit TransferSingle(msg.sender, address(0), to, id, amount);
    }

    function balanceOf(
        address account,
        uint256 id
    ) public view returns (uint256) {
        require(
            account != address(0),
            "ERC1155: address zero is not a valid owner"
        );
        return _balances[id][account];
    }

    function balanceOfBatch(
        address[] calldata accounts,
        uint256[] calldata ids
    ) public view returns (uint256[] memory) {
        require(
            accounts.length == ids.length,
            "ERC1155: Accounts and ids length mismatch"
        );
        uint256[] memory balanceBatch = new uint256[](accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            balanceBatch[i] = balanceOf(accounts[i], ids[i]);
        }
        return balanceBatch;
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(
        address account,
        address operator
    ) public view returns (bool) {
        return _operatorApprovals[account][operator];
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165) returns (bool) {
        return
            interfaceId == type(IERC1155).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    function _checkSafeTransferAcceptance(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) private {
        try
            IERC1155Receiver(to).onERC1155Received(
                operator,
                from,
                id,
                amount,
                data
            )
        returns (bytes4 response) {
            if (response != IERC1155Receiver.onERC1155Received.selector) {
                revert("ERC1155: ERC1155Receiver rejected tokens");
            }
        } catch {
            revert("ERC1155: transfer to non-ERC1155Receiver implementer");
        }
    }

    function _checkSafeBatchTransferAcceptance(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) private {
        try
            IERC1155Receiver(to).onERC1155BatchReceived(
                operator,
                from,
                ids,
                amounts,
                data
            )
        returns (bytes4 response) {
            if (response != IERC1155Receiver.onERC1155BatchReceived.selector) {
                revert("ERC1155: ERC1155Receiver rejected tokens");
            }
        } catch {
            revert("ERC1155: transfer to non-ERC1155Receiver implementer");
        }
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) public {
        require(
            to != address(0),
            "ERC1155: cannot transfer to the zero address"
        );
        require(
            owner == msg.sender || isApprovedForAll(from, msg.sender),
            "ERC1155: insufficient allowance"
        );
        require(_balances[id][from] >= amount, "ERC1155: insufficient balance");
        _balances[id][from] -= amount;
        _balances[id][to] += amount;
        emit TransferSingle(msg.sender, from, to, id, amount);
        if (_isContract(to)) {
            _checkSafeTransferAcceptance(
                msg.sender,
                from,
                to,
                id,
                amount,
                data
            );
        }
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external {
        require(
            ids.length == amounts.length,
            "ERC1155: Amounts and ids length mismatch"
        );
        require(
            to != address(0),
            "ERC1155: cannot transfer to the zero address"
        );
        require(
            owner == msg.sender || isApprovedForAll(from, msg.sender),
            "ERC1155: insufficient allowance"
        );
        for (uint256 i = 0; i < ids.length; i++) {
            require(
                _balances[ids[i]][from] >= amounts[i],
                "ERC1155: insufficient balance"
            );
            _balances[ids[i]][from] -= amounts[i];
            _balances[ids[i]][to] += amounts[i];
        }
        emit TransferBatch(msg.sender, from, to, ids, amounts);
        if (_isContract(to)) {
            _checkSafeBatchTransferAcceptance(
                msg.sender,
                from,
                to,
                ids,
                amounts,
                data
            );
        }
    }
}

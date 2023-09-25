// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./interfaces/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @dev Implementation of the basic standard multi-token using Open Zeppelin Interface.
 * See https://eips.ethereum.org/EIPS/eip-1155
 * Originally based on code by Enjin: https://github.com/enjin/erc-1155
 *
 */
contract MyERC1155 is IERC1155, ERC165 {
    address public owner;
    // Mapping from token ID to account balances
    mapping(uint256 => mapping(address => uint256)) private _balances;
    // Mapping from token ID to operator approvals
    mapping(uint256 => address) private _tokenApprovals;
    // Mapping from account to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    // Used as the URI for all token types by relying on ID substitution, e.g. https://token-cdn-domain/{id}.json
    string private _uri;

    constructor(string memory uriInput) {
        owner = msg.sender;
        _uri = uriInput;
    }

    /**
     *
     * This implementation returns the same URI for *all* token types. It relies
     * on the token type ID substitution mechanism
     * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP].
     *
     * Clients calling this function must replace the `\{id\}` substring with the
     * actual token type ID.
     */
    function uri(uint256) public view returns (string memory) {
        return _uri;
    }

    /**
     * @dev Creates `amount` tokens of token type `id`, and assigns them to `to`.
     *
     * Emits a {TransferSingle} event.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
     * acceptance magic value.
     */
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

    /**
     * @dev Batched version of mint.
     *
     * Emits a {TransferBatch} event.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
     * acceptance magic value.
     */
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

    /**
     * @dev See {IERC1155-balanceOf}.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
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

    /**
     * @dev See {IERC1155-balanceOfBatch}.
     *
     * Requirements:
     *
     * - `accounts` and `ids` must have the same length.
     */
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

    /**
     * @dev Approve `operator` to operate on all of `owner` tokens
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @dev Queries the approval status of an operator for a given owner
     */
    function isApprovedForAll(
        address account,
        address operator
    ) public view returns (bool) {
        return _operatorApprovals[account][operator];
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165) returns (bool) {
        return
            interfaceId == type(IERC1155).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev Checks if the given address is a contract
     */
    function _isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    /**
     * @dev See {IERC1155Receiver-onERC1155Received}.
     *
     * Internal util function that checks
     * if the given address is a contract that
     * can accept ERC1155 tokens
     *
     */
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

    /**
     * @dev See {IERC1155Receiver-onERC1155BatchReceived}.
     *
     * Internal util function that checks
     * if the given address is a contract that
     * can accept batch of ERC1155 tokens
     *
     */
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

    /**
     * @dev See {IERC1155-safeTransferFrom}.
     */
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
            from == msg.sender || isApprovedForAll(from, msg.sender),
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

    /**
     * @dev See {IERC1155-safeBatchTransferFrom}.
     */
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
            from == msg.sender || isApprovedForAll(from, msg.sender),
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

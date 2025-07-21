// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract RequestContract is ERC2771Context {
    enum RequestStatus {Pending, Matched, Fulfilled}

    struct Request {
        address ngo;
        string requestedFoodType;
        uint quantity;
        uint timestamp;
        RequestStatus status;
    }

    Request[] public requests;

    event RequestCreated(
        uint indexed requestId,
        address indexed ngo,
        string requestedFoodType,
        uint quantity,
        uint timestamp
    );

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

    function createRequest(
        string memory requestedFoodType,
        uint quantity
    ) public returns (uint) {
        require(quantity > 1, "Quantity must be greater than 1 Kilogram");

        address sender = _msgSender();

        Request memory newRequest = Request({
            ngo: sender,
            requestedFoodType: requestedFoodType,
            quantity: quantity,
            timestamp: block.timestamp,
            status: RequestStatus.Pending
        });

        requests.push(newRequest);
        uint requestId = requests.length - 1;

        emit RequestCreated(
            requestId,
            sender,
            requestedFoodType,
            quantity,
            block.timestamp
        );

        return requestId;
    }

    function getRequest(uint requestId) public view returns (Request memory) {
        require(requestId < requests.length, "Invalid ID");
        return requests[requestId];
    }

    function getAllRequests() public view returns (Request[] memory) {
        return requests;
    }

    function updateStatus(uint requestId, RequestStatus newStatus) public {
        require(requestId < requests.length, "Invalid ID");
        requests[requestId].status = newStatus;
    }

    // Required overrides for meta-transactions
     function _msgSender()
        internal
        view
        override(ERC2771Context)
        returns (address sender)
    {
        return ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        override(ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }
}

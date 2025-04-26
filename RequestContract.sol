// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RequestContract {
    enum RequestStatus { Pending, Matched, Fulfilled }

    struct Request {
        address ngo;
        string foodType;
        uint quantityNeeded;
        uint urgency;
        RequestStatus status;
    }

    Request[] public requests;

    event RequestCreated(
        uint indexed requestId,
        address indexed ngo,
        string foodType,
        uint quantityNeeded,
        uint urgency
    );

    function createRequest(
        string memory foodType,
        uint quantityNeeded,
        uint urgency
    ) public returns (uint) {
        require(quantityNeeded > 0, "Quantity must be greater than 0");
        require(urgency >= 1 && urgency <= 5, "Urgency must be 1-5");

        Request memory newRequest = Request({
            ngo: msg.sender,
            foodType: foodType,
            quantityNeeded: quantityNeeded,
            urgency: urgency,
            status: RequestStatus.Pending
        });

        requests.push(newRequest);
        uint requestId = requests.length - 1;

        emit RequestCreated(
            requestId,
            msg.sender,
            foodType,
            quantityNeeded,
            urgency
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

}

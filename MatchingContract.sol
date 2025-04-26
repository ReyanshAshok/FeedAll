// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDonationContract {
    function getDonation(uint donationId) external view returns (
        address, string memory, uint, uint, string memory, uint
    );
    function donations(uint) external view returns (
        address, string memory, uint, uint, string memory, uint
    );
    function updateStatus(uint donationId, uint status) external;
}

interface IRequestContract {
    function requests(uint) external view returns (
        address, string memory, uint, uint, uint
    );
    function updateStatus(uint requestId, uint status) external;
}

contract MatchingContract {
    IDonationContract public donationContract;
    IRequestContract public requestContract;

    event MatchMade(uint indexed donationId, uint indexed requestId);

    constructor(address _donationContract, address _requestContract) {
        donationContract = IDonationContract(_donationContract);
        requestContract = IRequestContract(_requestContract);
    }

    function matchDonationToRequest(uint donationId, uint requestId) public {
        // In a real app, fetch & compare foodType, quantity, etc.

        donationContract.updateStatus(donationId, 1); // Matched
        requestContract.updateStatus(requestId, 1);   // Matched

        emit MatchMade(donationId, requestId);
    }
}

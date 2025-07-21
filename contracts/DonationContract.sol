// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract DonationContract is ERC2771Context {
    enum Status {Available, Matched, InTransit, Delivered}

    struct Donation {
        address donor;
        string foodType;
        uint quantity;
        uint expiryTimestamp;
        string ipfsHash;
        Status status;
    }

    Donation[] public donations;

    event DonationCreated(
        uint indexed donationId,
        address indexed donor,
        string foodType,
        uint quantity,
        uint expiryTimestamp,
        string ipfsHash
    );

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

    function createDonation(
        string memory foodType,
        uint quantity,
        uint expiryTimestamp,
        string memory ipfsHash
    ) public returns (uint) {
        require(quantity > 2, "Quantity must be greater than 2 Kilograms");
        require(expiryTimestamp > block.timestamp + 5 days, "Expiration Date must be at least 5 days ahead");

        address sender = _msgSender();

        Donation memory newDonation = Donation({
            donor: sender,
            foodType: foodType,
            quantity: quantity,
            expiryTimestamp: expiryTimestamp,
            ipfsHash: ipfsHash,
            status: Status.Available
        });

        donations.push(newDonation);
        uint donationId = donations.length - 1;

        emit DonationCreated(
            donationId,
            sender,
            foodType,
            quantity,
            expiryTimestamp,
            ipfsHash
        );

        return donationId;
    }

    function getDonation(uint donationId) public view returns (Donation memory) {
        require(donationId < donations.length, "Invalid ID");
        return donations[donationId];
    }

    function getAllDonations() public view returns (Donation[] memory) {
        return donations;
    }

    function updateStatus(uint donationId, Status newStatus) public {
        require(donationId < donations.length, "Invalid ID");
        donations[donationId].status = newStatus;
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

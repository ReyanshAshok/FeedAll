// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DonationContract{
    enum Status {Available, Matched, InTransit, Delivered}

    struct Donation{
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

    function createDondation(
        string memory foodType,
        uint quantity,
        uint expiryTimeStamp,
        string memory ipfsHash
    ) public returns(uint) {
        require(quantity>2,"Quantity must be grater than 2 Kilograms");
        require(expiryTimeStamp>block.timestamp +5 days,"Expiration Date must be 5 days minimum ");

        Donation memory newDonation = Donation({
            donor:msg.sender,
            foodType: foodType,
            quantity:quantity, 
            expiryTimestamp: expiryTimeStamp,
            ipfsHash:ipfsHash,
            status: Status.Available
        });

        donations.push(newDonation);
        uint donationId = donations.length - 1;

        emit DonationCreated(donationId,
            msg.sender,
            foodType,
            quantity,
            expiryTimeStamp,
            ipfsHash
            );
        return donationId;
    }

    function getDonation(uint donationId) public view returns(Donation memory){
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



}




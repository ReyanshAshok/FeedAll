// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract TransportContract is ERC2771Context {
    enum TransportStatus {Assigned, InTransit, Delivered}

    struct Transport {
        uint donationId;
        uint requestId;
        address transporter;
        uint pickupTime;
        uint deliveryTime;
        TransportStatus status;
        string vehicleInfo;
        string deliveryProofIPFS; // Optional: proof image or receipt
    }

    Transport[] public transports;

    event TransportAssigned(
        uint indexed transportId,
        uint donationId,
        uint requestId,
        address transporter,
        string vehicleInfo,
        uint pickupTime
    );

    event DeliveryConfirmed(
        uint indexed transportId,
        uint deliveryTime,
        string deliveryProofIPFS
    );

    constructor(address trustedForwarder)
        ERC2771Context(trustedForwarder)
    {}

    function assignTransport(
        uint donationId,
        uint requestId,
        string memory vehicleInfo
    ) public returns (uint) {
        Transport memory newTransport = Transport({
            donationId: donationId,
            requestId: requestId,
            transporter: _msgSender(),
            pickupTime: block.timestamp,
            deliveryTime: 0,
            status: TransportStatus.Assigned,
            vehicleInfo: vehicleInfo,
            deliveryProofIPFS: ""
        });

        transports.push(newTransport);
        uint transportId = transports.length - 1;

        emit TransportAssigned(
            transportId,
            donationId,
            requestId,
            _msgSender(),
            vehicleInfo,
            block.timestamp
        );

        return transportId;
    }

    function confirmDelivery(
        uint transportId,
        string memory deliveryProofIPFS
    ) public {
        require(transportId < transports.length, "Invalid transport ID");
        require(transports[transportId].transporter == _msgSender(), "Not authorized");

        transports[transportId].status = TransportStatus.Delivered;
        transports[transportId].deliveryTime = block.timestamp;
        transports[transportId].deliveryProofIPFS = deliveryProofIPFS;

        emit DeliveryConfirmed(
            transportId,
            block.timestamp,
            deliveryProofIPFS
        );
    }

    function getTransport(uint transportId) public view returns (Transport memory) {
        require(transportId < transports.length, "Invalid ID");
        return transports[transportId];
    }

    function getAllTransports() public view returns (Transport[] memory) {
        return transports;
    }

    // Meta-tx support
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

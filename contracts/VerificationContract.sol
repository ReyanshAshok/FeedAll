// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract VerificationContract is ERC2771Context {
    enum VerificationStatus {Pending, Verified, Rejected}

    struct DeliveryVerification {
        uint transportId;
        address ngo;
        string feedback;              // e.g., "Food was fresh", "Delayed delivery"
        string imageProofIPFS;        // Optional: image or document proof
        uint verificationTime;
        VerificationStatus status;
    }

    DeliveryVerification[] public verifications;

    event VerificationSubmitted(
        uint indexed verificationId,
        uint transportId,
        address ngo,
        string feedback,
        string imageProofIPFS
    );

    event VerificationCompleted(
        uint indexed verificationId,
        VerificationStatus status
    );

    constructor(address trustedForwarder)
        ERC2771Context(trustedForwarder)
    {}

    function submitVerification(
        uint transportId,
        string memory feedback,
        string memory imageProofIPFS
    ) public returns (uint) {
        DeliveryVerification memory v = DeliveryVerification({
            transportId: transportId,
            ngo: _msgSender(),
            feedback: feedback,
            imageProofIPFS: imageProofIPFS,
            verificationTime: block.timestamp,
            status: VerificationStatus.Pending
        });

        verifications.push(v);
        uint verificationId = verifications.length - 1;

        emit VerificationSubmitted(
            verificationId,
            transportId,
            _msgSender(),
            feedback,
            imageProofIPFS
        );

        return verificationId;
    }

    function updateVerificationStatus(
        uint verificationId,
        VerificationStatus newStatus
    ) public {
        require(verificationId < verifications.length, "Invalid ID");

        // In a real system, this might only be done by a moderator or DAO
        verifications[verificationId].status = newStatus;

        emit VerificationCompleted(verificationId, newStatus);
    }

    function getVerification(uint verificationId) public view returns (DeliveryVerification memory) {
        require(verificationId < verifications.length, "Invalid ID");
        return verifications[verificationId];
    }

    function getAllVerifications() public view returns (DeliveryVerification[] memory) {
        return verifications;
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

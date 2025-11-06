// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

interface IDonationContract {
    function getDonation(uint donationId) external view returns (
        address, string memory,string memory,string memory, uint, uint, string memory, uint
    );
    function donations(uint) external view returns (
        address, string memory,string memory,string memory, uint, uint, string memory, uint
    );
    function updateStatus(uint donationId, uint status) external;
}

interface IRequestContract {
    function requests(uint) external view returns (
        address, string memory, uint, uint, uint
    );
    function updateStatus(uint requestId, uint status) external;
}

contract MatchingContract is ERC2771Context {
    IDonationContract public donationContract;
    IRequestContract public requestContract;

    event MatchMade(
        uint indexed donationId,
        uint indexed requestId,
        address indexed matchedBy
    );

    constructor(
        address _donationContract,
        address _requestContract,
        address trustedForwarder
    ) ERC2771Context(trustedForwarder) {
        donationContract = IDonationContract(_donationContract);
        requestContract = IRequestContract(_requestContract);
    }

    function matchDonationToRequest(uint donationId, uint requestId) public {
        // Could validate food type, expiry, etc.

        donationContract.updateStatus(donationId, 1); // Matched
        requestContract.updateStatus(requestId, 1);   // Matched

        emit MatchMade(donationId, requestId, _msgSender());
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

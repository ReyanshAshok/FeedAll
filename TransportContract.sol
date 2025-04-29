// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Transport Contract for Food Donation System
/// @notice Manages assignment, tracking, and confirmation of food deliveries

contract transportContract{

    struct TransportAssignment{
        uint256 donationId;
        uint256 pickUpTime;
        address transporter;
        uint256 expectedDeliveryTime;
        uint256 actualDeliveryTime;
        bool delivered;
        string gpsProof;
    }

    uint256 public nextAssignmentId;
    address public owner; 

    mapping(uint256 =>TransportAssignment) public assignments;

     event TransportAssigned(
        uint256 indexed assignmentId,
        uint256 donationId,
        address indexed transporter,
        uint256 pickupTime,
        uint256 expectedDeliveryTime
    );

    event DeliveryConfirmed(
        uint256 indexed assignmentId,
        uint256 actualDeliveryTime,
        string gpsProof
    );

    modifier onlyOwner(){
        require(msg.sender==owner,"Not autharized ");
        _;
    }

    modifier onlyTransporter(uint256 _assignmentId){
        require(assignments[_assignmentId].transporter == msg.sender, "Not the assigned transporter");
        _;
    }
     constructor() {
        owner = msg.sender;
        nextAssignmentId = 1;  // start IDs from 1 for easier tracking
    }

    function transport(
        uint256 _donationId,
        address _transporter,
        uint256 _expectedDeliveryTime
    )external onlyOwner{
        require(_transporter != address(0), "Invalid transporter address");
        require(_expectedDeliveryTime > block.timestamp, "Expected delivery must be future");

        assignments[nextAssignmentId]=TransportAssignment({
            donationId:_donationId,
            transporter:_transporter,
            pickUpTime: block.timestamp,
            expectedDeliveryTime:_expectedDeliveryTime,
            actualDeliveryTime: 0,
            delivered: false,
            gpsProof: ""
        });

    emit TransportAssigned(
        nextAssignmentId, 
        _donationId, 
        _transporter, 
        block.timestamp, 
        _expectedDeliveryTime
        );

    nextAssignmentId++;
    }

    /// @notice Confirm delivery by transporter
    function confirmDelivery(
        uint256 _assignmentId,
        string memory _gpsProof
        )external onlyTransporter(_assignmentId){
            TransportAssignment storage assignment = assignments[_assignmentId];
        require(!assignment.delivered, "Already delivered");

        assignment.actualDeliveryTime = block.timestamp;
        assignment.gpsProof = _gpsProof;
        assignment.delivered = true;

        emit DeliveryConfirmed(
            _assignmentId,
            block.timestamp,
            _gpsProof
        );
        }
            /// @notice Get details of a transport assignment
    function getAssignment(uint256 _assignmentId) external view returns (TransportAssignment memory) {
        return assignments[_assignmentId];
    }

}
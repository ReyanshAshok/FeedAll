//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

interface ITransportContract {
    function getTransport(uint transportId) external view returns 
(
    uint donationId,
    uint requestId,
    address transporters,
    uint pickUpTime,
    uint deliveryTime,
    uint status,
    string memory vehicleInfo,
    string memory deliveryProofIPFS
);
}

contract PaymentEscrow is ERC2771Context {
    ITransportContract transportContract;

    mapping(uint => uint) public payments;
    mapping(uint => bool) public released;

    event PaymentDeposited(uint indexed transportId, address indexed ngo , uint amount );
    event PaymentReleased(uint indexed transportId, address indexed transporter, uint amount);

    constructor (address _transportContract, address trustedForwarder) ERC2771Context(trustedForwarder)
    {
        transportContract = ITransportContract(_transportContract);
    }

    function depositPayment(uint transportId) external payable {
        require (msg.value > 0, "No payment sent");
        require (payments[transportId]==0,"Alread paid");
        payments[transportId]= msg.value;
        emit PaymentDeposited(transportId, _msgSender(), msg.value);

    }

    function releasePayment(uint transportId) external {
        require(!released[transportId],"Already released");
        (, , address transporter, , , uint status, ,) = transportContract.getTransport(transportId);
        require (status == 2, "Delivary not confirmed");
        uint amount = payments[transportId];
        require (amount > 0, "No payment to release");
        released[transportId] = true;
        (bool sent, ) = transporter.call{value: amount}("");
        require(sent,"payment");
        emit PaymentReleased(transportId, transporter, amount); 
    }

}
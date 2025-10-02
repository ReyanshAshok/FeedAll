const {ethers} = require("hardhat");
const {expect} = require("chai");

describe("PaymentEscrow",function(){
    it("should depost and release payments",async function(){
        const MockTransport = await ethers.getContractFactory("MockTransportContract");
        const mockTransport = await MockTransport.deploy();

        const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
        const escrow = await PaymentEscrow.deploy(mockTransport.address, trustedForwarder.adddress. )
    })
})
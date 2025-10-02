const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RequestContract", function () {
  let requestContract;
  let ngo;

  beforeEach(async function () {
    [ngo] = await ethers.getSigners();

    const RequestContract = await ethers.getContractFactory("RequestContract");
    requestContract = await RequestContract.deploy(
      "0x0000000000000000000000000000000000000000"
    );
    await requestContract.waitForDeployment();
  });

  it("should create a valid request", async function () {
    const tx = await requestContract.connect(ngo).createRequest("Rice", 5);
    const receipt = await tx.wait();

    const event = receipt.logs.find(e => e.fragment?.name === "RequestCreated");
    const requestId = event.args.requestId;

    const request = await requestContract.getRequest(requestId);
    expect(request.requestedFoodType).to.equal("Rice");
    expect(request.quantity).to.equal(5);
  });

  it("should fail if quantity < 2", async function () {
    await expect(
      requestContract.connect(ngo).createRequest("Milk", 1)
    ).to.be.revertedWith("Quantity must be greater than 1 Kilogram");
  });

  it("should allow reading all requests", async function () {
    await requestContract.connect(ngo).createRequest("Bread", 10);
    const requests = await requestContract.getAllRequests();
    expect(requests.length).to.be.gt(0);
  });

  it("should allow updating request status", async function () {
    const tx = await requestContract.connect(ngo).createRequest("Wheat", 3);
    const receipt = await tx.wait();
    const requestId = receipt.logs.find(e => e.fragment?.name === "RequestCreated").args.requestId;

    await requestContract.updateStatus(requestId, 2); // Fulfilled
    const updated = await requestContract.getRequest(requestId);
    expect(updated.status).to.equal(2);
  });
});

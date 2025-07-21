const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RequestContract", function () {
  let requestContract;
  let ngo;
  let fiveDaysLater;

  beforeEach(async function () {
    [ngo] = await ethers.getSigners();

    const RequestContract = await ethers.getContractFactory("RequestContract");
    requestContract = await RequestContract.deploy();
    await requestContract.deployed();

    fiveDaysLater = Math.floor(Date.now() / 1000) + (6 * 24 * 60 * 60); // 6 days from now
  });

  it("should create a valid request", async function () {
    const tx = await requestContract.connect(ngo).createRequest(
      "Rice",
      5,
      fiveDaysLater
    );
    const receipt = await tx.wait();

    const event = receipt.events.find(e => e.event === "RequestCreated");
    const requestId = event.args.requestId;

    const request = await requestContract.getRequest(requestId);
    expect(request.foodType).to.equal("Rice");
    expect(request.quantity).to.equal(5);
  });

  it("should fail if quantity < 2", async function () {
    await expect(
      requestContract.connect(ngo).createRequest("Milk", 1, fiveDaysLater)
    ).to.be.revertedWith("Quantity must be greater than 2 Kilograms");
  });

  it("should fail if needed by date is too soon", async function () {
    const soon = Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60);
    await expect(
      requestContract.connect(ngo).createRequest("Milk", 5, soon)
    ).to.be.revertedWith("Needed by date must be at least 5 days ahead");
  });

  it("should allow reading all requests", async function () {
    await requestContract.connect(ngo).createRequest("Bread", 10, fiveDaysLater);
    const requests = await requestContract.getAllRequests();
    expect(requests.length).to.be.gt(0);
  });

  it("should allow updating request status", async function () {
    const tx = await requestContract.connect(ngo).createRequest("Wheat", 3, fiveDaysLater);
    const receipt = await tx.wait();
    const requestId = receipt.events.find(e => e.event === "RequestCreated").args.requestId;

    await requestContract.updateStatus(requestId, 2); // Example status code
    const updated = await requestContract.getRequest(requestId);
    expect(updated.status).to.equal(2);
  });
});

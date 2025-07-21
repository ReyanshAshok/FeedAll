const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonationContract", function () {
  let DonationContract, donationContract, owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const TrustedForwarder = owner.address; // temporary dummy forwarder
  
    DonationContract = await ethers.getContractFactory("DonationContract");
    donationContract = await DonationContract.deploy(TrustedForwarder);
    await donationContract.waitForDeployment(); // FIX: new version of Hardhat requires this
  });
  

  it("should create a valid donation", async function () {
    const expiry = Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60; // 6 days from now

    const tx = await donationContract.createDonation(
      "Rice",
      10,
      expiry,
      "QmFakeIpfsHash123"
    );

    await tx.wait();

    const donation = await donationContract.getDonation(0);
    expect(donation.foodType).to.equal("Rice");
    expect(donation.quantity).to.equal(10);
    expect(donation.status).to.equal(0); // Status.Available
  });

  it("should fail if quantity < 2", async function () {
    const expiry = Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60;
    await expect(
      donationContract.createDonation("Bread", 1, expiry, "QmHash")
    ).to.be.revertedWith("Quantity must be greater than 2 Kilograms");
  });

  it("should fail if expiry < 5 days", async function () {
    const expiry = Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60;
    await expect(
      donationContract.createDonation("Milk", 5, expiry, "QmHash")
    ).to.be.revertedWith("Expiration Date must be at least 5 days ahead");
  });
});

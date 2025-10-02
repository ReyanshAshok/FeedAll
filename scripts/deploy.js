const { ethers } = require("hardhat");

async function main() {
  // 1. Deploy MinimalForwarder (for gasless tx)
const [deployer] = await ethers.getSigners();
const Forwarder = await ethers.getContractFactory("ERC2771Forwarder");
const forwarder = await Forwarder.deploy(deployer.address); // ✅ pass argument
await forwarder.waitForDeployment();
const forwarderAddress = await forwarder.getAddress();
console.log("✅ ERC2771Forwarder deployed at:", forwarderAddress);

  // 2. Deploy DonationContract
  const Donation = await ethers.getContractFactory("DonationContract");
  const donation = await Donation.deploy(forwarderAddress);
  await donation.waitForDeployment();
  console.log("✅ DonationContract deployed at:", await donation.getAddress());

  // 3. Deploy RequestContract
  const Request = await ethers.getContractFactory("RequestContract");
  const request = await Request.deploy(forwarderAddress);
  await request.waitForDeployment();
  console.log("✅ RequestContract deployed at:", await request.getAddress());

  // 4. Deploy MatchingContract
  const Matching = await ethers.getContractFactory("MatchingContract");
  const matching = await Matching.deploy(
    await donation.getAddress(),
    await request.getAddress(),
    forwarderAddress
  );
  await matching.waitForDeployment();
  console.log("✅ MatchingContract deployed at:", await matching.getAddress());

  // 5. Deploy TransportContract
  const Transport = await ethers.getContractFactory("TransportContract");
  const transport = await Transport.deploy(forwarderAddress);
  await transport.waitForDeployment();
  console.log("✅ TransportContract deployed at:", await transport.getAddress());

  // 6. Deploy VerificationContract
  const Verification = await ethers.getContractFactory("VerificationContract");
  const verification = await Verification.deploy(forwarderAddress);
  await verification.waitForDeployment();
  console.log("✅ VerificationContract deployed at:", await verification.getAddress());

  console.log("\n🎉 All contracts deployed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

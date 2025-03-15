const hre = require("hardhat");

async function main() {
  console.log("Deploying PuzzleNFT...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const PuzzleNFT = await hre.ethers.getContractFactory("PuzzleNFT");
  const puzzleNFT = await PuzzleNFT.deploy();

  await puzzleNFT.waitForDeployment();
  
  const address = await puzzleNFT.getAddress();
  console.log("PuzzleNFT deployed to:", address);

  // Wait for block confirmations
  console.log("Waiting for block confirmations...");
  await puzzleNFT.deploymentTransaction().wait(6);

  // Verify the contract
  console.log("Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: []
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.log("Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
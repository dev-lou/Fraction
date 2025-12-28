
const hre = require("hardhat");

async function main() {
    console.log("Deploying PropertyRegistry...");

    const PropertyRegistry = await hre.ethers.getContractFactory("PropertyRegistry");
    const registry = await PropertyRegistry.deploy();

    await registry.waitForDeployment();

    const address = await registry.getAddress();
    console.log(`PropertyRegistry deployed to: ${address}`);
    console.log("Save this address to your .env.local as NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

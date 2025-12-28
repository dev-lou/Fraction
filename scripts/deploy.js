
import hre from "hardhat";

async function main() {
    console.log("Deploying PropertyRegistry with Viem...");

    const registry = await hre.viem.deployContract("PropertyRegistry");

    console.log(`PropertyRegistry deployed to: ${registry.address}`);
    console.log("Save this address to your .env.local as NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

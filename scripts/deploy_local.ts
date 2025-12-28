
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { localhost } from 'viem/chains';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv'; // Still useful if we needed env, but localhost is mostly hardcoded

// Load env explicitly
dotenv.config({ path: '.env.local' });

async function main() {
    console.log("Starting LOCALHOST deployment...");

    // 1. Get credentials (Hardhat Test Account #0)
    // Publicly known key for testing - DO NOT USE ON MAINNET
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

    // 2. Prepare Artifact
    const artifactPath = path.join(process.cwd(), 'artifacts/contracts/PropertyRegistry.sol/PropertyRegistry.json');
    if (!fs.existsSync(artifactPath)) {
        throw new Error(`Artifact not found at ${artifactPath}. Run 'npx hardhat compile' first.`);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const { abi, bytecode } = artifact;

    // 3. Setup Client
    const account = privateKeyToAccount(privateKey);
    const rpcUrl = "http://127.0.0.1:8545";

    console.log(`Using account: ${account.address}`);
    console.log(`Using RPC: ${rpcUrl}`);

    // Hardhat's default Chain ID is 31337, but Viem's 'localhost' defaults to 1337.
    // We define a custom chain to match Hardhat.
    const hardhatLocal = {
        ...localhost,
        id: 31337,
    };

    const client = createWalletClient({
        account,
        chain: hardhatLocal,
        transport: http(rpcUrl)
    }).extend(publicActions);

    // Balance check (should be massive on localhost)
    const balance = await client.getBalance({ address: account.address });
    console.log(`Balance: ${balance.toString()} wei`);

    // 4. Deploy
    console.log("Sending deployment transaction...");
    const hash = await client.deployContract({
        abi,
        bytecode: bytecode as `0x${string}`,
    });

    console.log(`Transaction sent: ${hash}`);
    console.log("Waiting for receipt...");

    const receipt = await client.waitForTransactionReceipt({ hash });

    if (receipt.contractAddress) {
        console.log(`\nSUCCESS! Contract deployed to: ${receipt.contractAddress}`);
        console.log(`\nUpdating .env.local with new address...`);

        // In a real script we might automate this, but for now we log it.
        // I will use another tool to update the file separately to be safe.
    } else {
        console.error("Deployment failed or no address returned.");
    }
}

main().catch(console.error);

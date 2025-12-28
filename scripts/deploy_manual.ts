
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

// Load env explicitly
dotenv.config({ path: '.env.local' });

async function main() {
    console.log("Starting manual deployment...");

    // 1. Get credentials
    // Support both versions of the key (raw or 0x)
    let pk = process.env.PRIVATE_KEY || '';
    if (pk && !pk.startsWith('0x')) pk = '0x' + pk;

    const alchemyId = (process.env.NEXT_PUBLIC_ALCHEMY_ID || '').trim();

    if (!pk || pk === '0x') throw new Error("Missing PRIVATE_KEY");

    // 2. Prepare Artifact
    // Adjust path if needed. Current CWD is root.
    const artifactPath = path.join(process.cwd(), 'artifacts/contracts/PropertyRegistry.sol/PropertyRegistry.json');
    if (!fs.existsSync(artifactPath)) {
        throw new Error(`Artifact not found at ${artifactPath}. Run 'npx hardhat compile' first.`);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const { abi, bytecode } = artifact;

    // 3. Setup Client
    const account = privateKeyToAccount(pk as `0x${string}`);

    // Use public RPC if Alchemy fails, or construct Alchemy URL
    const rpcUrl = alchemyId
        ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyId}`
        : "https://1rpc.io/sepolia";

    console.log(`Using account: ${account.address}`);
    console.log(`Using RPC: ${rpcUrl}`);

    const client = createWalletClient({
        account,
        chain: sepolia,
        transport: http(rpcUrl)
    }).extend(publicActions);

    const balance = await client.getBalance({ address: account.address });
    console.log(`Balance: ${balance.toString()} wei`);

    if (balance === 0n) {
        console.error("\n❌ ERROR: Your wallet has 0 ETH on Sepolia.");
        console.error("You need to get free testnet ETH from a faucet.");
        console.error("Go to: https://www.alchemy.com/faucets/ethereum-sepolia");
        process.exit(1);
    }

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
        console.log(`\nAdd this to your .env.local:`);
        console.log(`NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS=${receipt.contractAddress}`);
    } else {
        console.error("Deployment failed or no address returned.");
    }
}

main().catch(console.error);

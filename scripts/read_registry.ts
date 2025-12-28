
import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';
import { propertyRegistryAbi } from '../lib/onchain';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const registryAddress = (process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || '').trim() as `0x${string}`;
    const rpcUrl = "http://127.0.0.1:8545";

    if (!registryAddress) throw new Error('Missing registry address in .env.local');

    // Hardhat Localhost Chain ID is 31337
    const hardhatLocal = { ...hardhat, id: 31337 };

    const client = createPublicClient({
        chain: hardhatLocal,
        transport: http(rpcUrl)
    });

    console.log(`📡 Reading Registry at: ${registryAddress}`);
    console.log(`🔗 Connecting to: ${rpcUrl}`);

    try {
        const data = await client.readContract({
            address: registryAddress,
            abi: propertyRegistryAbi,
            functionName: 'listProperties',
        }) as any[];

        console.log(`\n✅ FOUND ${data.length} PROPERTIES ON BLOCKCHAIN:\n`);

        data.forEach((p, i) => {
            console.log(`[${i}] ${p.title} (${p.city}) - Status: ${p.status}`);
            if (p.slug === 'genesis-block-mansion') {
                console.log(`    ⭐ THIS ONE IS BLOCKCHAIN-ONLY! (Not in code)`);
            }
        });

        console.log("\n(These properties are stored in the Smart Contract state, not just local files.)");
    } catch (error) {
        console.error("❌ Failed to read contract. Is Hardhat Node running?", error);
    }
}

main().catch(console.error);

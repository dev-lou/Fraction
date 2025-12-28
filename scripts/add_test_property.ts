
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { localhost } from 'viem/chains';
import { propertyRegistryAbi } from '../lib/onchain';
import dotenv from 'dotenv'; // Load env
dotenv.config({ path: '.env.local' });

async function main() {
    const registryAddress = (process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || '').trim() as `0x${string}`;
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const rpcUrl = "http://127.0.0.1:8545";

    if (!registryAddress) throw new Error('Missing registry address');

    const hardhatLocal = { ...localhost, id: 31337 };
    const account = privateKeyToAccount(privateKey);
    const client = createWalletClient({ account, chain: hardhatLocal, transport: http(rpcUrl) });

    // A unique property that definitely isn't in your code
    const uniqueProperty = {
        slug: 'genesis-block-mansion',
        title: 'Genesis Block Mansion', // << LOOK FOR THIS
        city: 'Cyber City',
        status: 0, // live
        available: 5000n,
        total: 10000n,
        blueprint: '/images/properties/prop1.jpg', // Reusing an image so it renders
        render: '/images/properties/prop1.jpg',
        tokenized: '',
        latE6: 40712800,
        lngE6: -74006000,
        apyBps: 1500, // 15.00% (number, as per ABI uint16)
        tokenPriceUsdCents: 5000n // $50.00
    };

    console.log(`Adding unique blockchain property: "${uniqueProperty.title}"...`);

    const txHash = await client.writeContract({
        address: registryAddress,
        abi: propertyRegistryAbi,
        functionName: 'upsert', // Using upsert to add single
        args: [uniqueProperty, 999n], // 999n as index invokes "push" logic in contract if out of bounds, or we can use setProperties replacement. 
        // Actually, checking contract: upsert(meta, index). If index < length, update. Else push.
        // So passing a huge index like 999 will force a push.
    });

    console.log('tx sent:', txHash);
    console.log('✅ Unique property added to the blockchain!');
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});


import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { localhost } from 'viem/chains';
import { propertyRegistryAbi } from '../lib/onchain';
import { PROPERTIES } from '../lib/properties';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

type StatusMap = Record<'live' | 'coming-soon' | 'sold-out', number>;
const STATUS: StatusMap = { 'live': 0, 'coming-soon': 1, 'sold-out': 2 };

function slugify(input: string) {
    const slug = input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return slug || 'property';
}

function parsePercent(apy: string) {
    const clean = parseFloat(apy.replace(/[^0-9.]/g, '')) || 0;
    return Math.round(clean * 100);
}

function parsePriceUsd(price: string) {
    const clean = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    return Math.round(clean * 100);
}

async function main() {
    const registryAddress = (process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || '').trim() as `0x${string}`;
    // Hardhat Account #0
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const rpcUrl = "http://127.0.0.1:8545";

    if (!registryAddress) {
        throw new Error('Set NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS in .env.local');
    }

    // Custom localhost chain with correct ID
    const hardhatLocal = { ...localhost, id: 31337 };

    const account = privateKeyToAccount(privateKey);
    const client = createWalletClient({ account, chain: hardhatLocal, transport: http(rpcUrl) });

    const payload = PROPERTIES.map((p) => ({
        slug: slugify(p.title),
        title: p.title,
        city: p.city,
        status: STATUS[p.status],
        available: BigInt(p.available),
        total: BigInt(p.total),
        blueprint: p.blueprint,
        render: p.render,
        tokenized: p.tokenized,
        latE6: Math.round(p.latLng[0] * 1_000_000),
        lngE6: Math.round(p.latLng[1] * 1_000_000),
        apyBps: BigInt(parsePercent(p.apy)),
        tokenPriceUsdCents: BigInt(parsePriceUsd(p.tokenPrice)),
    }));

    console.log(`Sending ${payload.length} properties to registry ${registryAddress} on LOCALHOST...`);

    const txHash = await client.writeContract({
        address: registryAddress,
        abi: propertyRegistryAbi,
        functionName: 'setProperties',
        args: [payload],
    });

    console.log('tx sent:', txHash);
    // No need to wait long on localhost
    console.log('✅ done');
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});

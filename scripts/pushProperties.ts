import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { propertyRegistryAbi } from '../lib/onchain';
import { PROPERTIES } from '../lib/properties';

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
  const privateKey = (process.env.PRIVATE_KEY || '').trim() as `0x${string}`;
  const rpcFromAlchemy = process.env.NEXT_PUBLIC_ALCHEMY_ID
    ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
    : undefined;
  const rpcUrl = process.env.RPC_URL || rpcFromAlchemy || sepolia.rpcUrls.public.http[0];

  if (!registryAddress) {
    throw new Error('Set NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS to your deployed registry');
  }
  if (!privateKey) {
    throw new Error('Set PRIVATE_KEY (0x...) funded with Sepolia ETH to push data');
  }

  const account = privateKeyToAccount(privateKey);
  const client = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl) });

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

  console.log(`Sending ${payload.length} properties to registry ${registryAddress} on Sepolia...`);

  const txHash = await client.writeContract({
    address: registryAddress,
    abi: propertyRegistryAbi,
    functionName: 'setProperties',
    args: [payload],
  });

  console.log('tx sent:', txHash);
  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  console.log('✅ done at block', receipt.blockNumber);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
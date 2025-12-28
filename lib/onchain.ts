import { useQuery } from '@tanstack/react-query';
import { Address, createPublicClient, http } from 'viem';
import { sepolia, hardhat } from 'wagmi/chains';
import { usePublicClient } from 'wagmi';
import { PROPERTIES, type Property, type PropertyStatus } from './properties';

// Minimal registry ABI: listProperties returns an array of property structs
// struct PropertyMeta {
//   string slug;
//   string title;
//   string city;
//   uint8 status; // 0=live,1=coming-soon,2=sold-out
//   uint256 available;
//   uint256 total;
//   string blueprint;
//   string render;
//   string tokenized;
//   int32 latE6;
//   int32 lngE6;
//   uint16 apyBps; // 987 = 9.87%
//   uint64 tokenPriceUsdCents; // 108 = $1.08
// }
// function listProperties() external view returns (PropertyMeta[] memory)
export const propertyRegistryAbi = [
  {
    name: 'setProperties',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'slug', type: 'string' },
          { name: 'title', type: 'string' },
          { name: 'city', type: 'string' },
          { name: 'status', type: 'uint8' },
          { name: 'available', type: 'uint256' },
          { name: 'total', type: 'uint256' },
          { name: 'blueprint', type: 'string' },
          { name: 'render', type: 'string' },
          { name: 'tokenized', type: 'string' },
          { name: 'latE6', type: 'int32' },
          { name: 'lngE6', type: 'int32' },
          { name: 'apyBps', type: 'uint16' },
          { name: 'tokenPriceUsdCents', type: 'uint64' },
        ],
      },
    ],
    outputs: [],
  },
  {
    name: 'listProperties',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'slug', type: 'string' },
          { name: 'title', type: 'string' },
          { name: 'city', type: 'string' },
          { name: 'status', type: 'uint8' },
          { name: 'available', type: 'uint256' },
          { name: 'total', type: 'uint256' },
          { name: 'blueprint', type: 'string' },
          { name: 'render', type: 'string' },
          { name: 'tokenized', type: 'string' },
          { name: 'latE6', type: 'int32' },
          { name: 'lngE6', type: 'int32' },
          { name: 'apyBps', type: 'uint16' },
          { name: 'tokenPriceUsdCents', type: 'uint64' },
        ],
      },
    ],
  },
  {
    name: 'upsert',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        type: 'tuple',
        components: [
          { name: 'slug', type: 'string' },
          { name: 'title', type: 'string' },
          { name: 'city', type: 'string' },
          { name: 'status', type: 'uint8' },
          { name: 'available', type: 'uint256' },
          { name: 'total', type: 'uint256' },
          { name: 'blueprint', type: 'string' },
          { name: 'render', type: 'string' },
          { name: 'tokenized', type: 'string' },
          { name: 'latE6', type: 'int32' },
          { name: 'lngE6', type: 'int32' },
          { name: 'apyBps', type: 'uint16' },
          { name: 'tokenPriceUsdCents', type: 'uint64' },
        ],
      },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'invest',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'slug', type: 'string' },
      { name: 'quantity', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

const STATUS_MAP: Record<number, PropertyStatus> = {
  0: 'live',
  1: 'coming-soon',
  2: 'sold-out',
};

function formatBpsToPercent(apyBps: bigint): string {
  const pct = Number(apyBps) / 100;
  return `${pct.toFixed(2)}%`;
}

function formatUsdCents(value: bigint): string {
  const dollars = Number(value) / 100;
  return `$${dollars.toFixed(2)}`;
}

function toProperty(raw: any): Property {
  const status = STATUS_MAP[Number(raw.status)] || 'live';
  const apy = formatBpsToPercent(raw.apyBps ?? 0n);
  const tokenPrice = formatUsdCents(raw.tokenPriceUsdCents ?? 0n);
  const lat = Number(raw.latE6 ?? 0) / 1_000_000;
  const lng = Number(raw.lngE6 ?? 0) / 1_000_000;

  return {
    title: raw.title || raw.slug || 'Untitled',
    apy,
    tokenPrice,
    city: raw.city || 'Unknown',
    status,
    available: Number(raw.available || 0n),
    total: Number(raw.total || 0n) || 1,
    blueprint: raw.blueprint || raw.render || '',
    render: raw.render || raw.tokenized || '',
    tokenized: raw.tokenized || raw.render || '',
    latLng: [lat, lng],
  } satisfies Property;
}

function getFallbackClient() {
  const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID;
  // If we have an Alchemy ID, assume Sepolia (unless overridden).
  // If no ID, and we are in dev, likely Localhost.

  if (alchemyId) {
    const rpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${alchemyId}`;
    return createPublicClient({ chain: sepolia, transport: http(rpcUrl) });
  }

  // Fallback to Localhost
  return createPublicClient({ chain: hardhat, transport: http('http://127.0.0.1:8545') });
}

export function useProperties() {
  const registryAddress = (process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || '').trim() as Address | '';
  // Don't rely on Wagmi's public client for this specific hook to ensure stability
  // const wagmiClient = usePublicClient({ chainId: hardhat.id });

  return useQuery({
    queryKey: ['properties', registryAddress],
    enabled: Boolean(registryAddress),
    initialData: { source: 'fallback' as const, items: [] as Property[] },
    staleTime: 30_000,
    retry: 1,
    queryFn: async () => {
      // If no address, return empty list (don't show fake data if we expect real data)
      if (!registryAddress) return { source: 'fallback' as const, items: [] as Property[] };

      // Use a dedicated read-only client to ensure we always fetch from Localhost
      // This bypasses MetaMask/Wagmi context to prevent 'Connection Interrupted' or wrong network issues
      const client = createPublicClient({
        chain: hardhat,
        transport: http('http://127.0.0.1:8545', {
          batch: { wait: 16 }, // Batch requests to reduce load
          retryCount: 3,
        })
      });
      console.log('Fetching properties from:', registryAddress);

      try {
        const rows = (await client.readContract({
          address: registryAddress,
          abi: propertyRegistryAbi,
          functionName: 'listProperties',
        })) as any[];

        console.log('Raw Blockchain Data:', rows);

        const items = rows.map(toProperty);
        console.log('Parsed Items:', items);

        // Remove the filter for now to see everything
        // .filter((p) => p.title && p.render);

        return { source: 'onchain' as const, items };
      } catch (e: any) {
        console.error('Blockchain Read Error:', e);
        // Extract a readable message
        const msg = e.shortMessage || e.message || 'Unknown error';
        return { source: 'error' as const, items: [], error: msg };
      }
    },
  });
}

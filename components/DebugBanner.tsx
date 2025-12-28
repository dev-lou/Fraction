
'use client';

import { useState, useEffect } from 'react';
import { useProperties } from '@/lib/onchain';

export function DebugBanner() {
    const [mounted, setMounted] = useState(false);
    const { data } = useProperties();
    const address = process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS;

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed top-20 right-4 z-50 rounded-xl border border-red-500/50 bg-black/90 p-4 text-xs font-mono text-red-200 shadow-2xl backdrop-blur-md max-w-xs pointer-events-none">
            <h3 className="mb-2 font-bold uppercase text-red-400">Blockchain Debugger</h3>
            <div className="space-y-1">
                <p>
                    <span className="text-neutral-500">Source:</span>{' '}
                    <span className={data?.source === 'onchain' ? 'text-lime-400' : 'text-red-400'}>
                        {data?.source ?? 'Loading...'}
                    </span>
                </p>
                {data?.source === 'error' && (
                    <p className="text-[10px] text-red-300 leading-tight border-l-2 border-red-500 pl-2">
                        {(data as any).error}
                    </p>
                )}
                <p>
                    <span className="text-neutral-500">Items:</span> {data?.items?.length ?? 0}
                </p>
                <p>
                    <span className="text-neutral-500">Contract:</span>{' '}
                    <span className="break-all">{address?.slice(0, 8)}...</span>
                </p>
                {data?.items && data.items.length > 0 && (
                    <p>
                        <span className="text-neutral-500">Top:</span> {data.items[0].title}
                    </p>
                )}
            </div>
        </div>
    );
}

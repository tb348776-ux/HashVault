import React from 'react';
import { formatXMR, formatNumber } from '../../lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';

interface Block {
  hash: string;
  height: number;
  ts: number;
  difficulty: number;
  reward: number;
  fee: number;
}

interface BlockVisualizerProps {
  blocks?: Block[];
  currentEffort?: number;
  networkDifficulty?: number;
  poolHashRate?: number;
}

export default function BlockchainVisual({
  blocks = [],
  currentEffort = 0,
  networkDifficulty = 0,
  poolHashRate = 0,
}: BlockVisualizerProps) {
  const recentBlocks = blocks?.slice(0, 5) || [];
  const effortPercentage = Math.min((currentEffort || 0) / 100 * 100, 100);
  const isLoading = blocks === undefined;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 bg-gray-800 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Effort Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-mono">
            Block Progress
          </span>
          <span className="text-sm font-mono font-bold text-orange-400">
            {currentEffort?.toFixed(2) || '0'}%
          </span>
        </div>
        <div className="h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full shadow-lg shadow-orange-500/50 transition-all duration-1000"
            style={{ width: `${Math.min(effortPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Block Feed */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {recentBlocks.length > 0 ? (
          recentBlocks.map((block, index) => (
            <div
              key={block.hash}
              className="bg-gray-900/50 border border-orange-500/20 rounded-lg p-3 hover:border-orange-500/50 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-orange-400 font-bold">
                      #{block.height}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(block.ts * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                  <code className="text-xs font-mono text-orange-300 break-all block">
                    {block.hash?.slice(0, 16)}...
                  </code>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-green-400 font-bold">
                    {formatXMR(block.reward)} XMR
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Fee: {formatXMR(block.fee)}
                  </div>
                </div>
              </div>
              {index === 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-orange-500/10">
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow shadow-green-500/50 animate-pulse" />
                  <span className="text-xs text-green-400 font-mono">JUST FOUND</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="h-24 flex items-center justify-center text-gray-500 text-sm font-mono">
            No blocks found yet
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-orange-500/10">
        <div className="text-center">
          <span className="text-xs text-gray-500 font-mono block">TOTAL BLOCKS</span>
          <span className="text-lg font-mono font-bold text-orange-400">
            {formatNumber(recentBlocks.length)}
          </span>
        </div>
        <div className="text-center">
          <span className="text-xs text-gray-500 font-mono block">NETWORK DIFF</span>
          <span className="text-sm font-mono text-orange-300 truncate">
            {formatNumber(networkDifficulty)}
          </span>
        </div>
        <div className="text-center">
          <span className="text-xs text-gray-500 font-mono block">POOL HASH</span>
          <span className="text-sm font-mono text-orange-300 truncate">
            {formatNumber(poolHashRate)}
          </span>
        </div>
      </div>
    </div>
  );
}

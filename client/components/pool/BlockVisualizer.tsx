import React, { useState, useEffect } from 'react';
import { Box, ChevronRight, Zap, Activity } from 'lucide-react';

const formatXMR = (atomic: number | null | undefined): string => {
  if (!atomic) return '0';
  return (atomic / 1e12).toFixed(4);
};

const formatNumber = (num: number | null | undefined): string => {
  if (!num) return '0';
  return num.toLocaleString();
};

const formatTimeAgo = (ts: number): string => {
  const seconds = Math.floor((Date.now() - ts * 1000) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

interface Block {
  hash: string;
  height: number;
  ts: number;
  difficulty?: number;
  value: number;
  fee: number;
  effort?: number;
  solo?: boolean;
}

interface BlockCardProps {
  block: Block;
  index: number;
  isLatest: boolean;
}

const BlockCard = ({ block, index, isLatest }: BlockCardProps) => {
  const effort = block.effort || 0;
  const effortColor = effort < 50 ? 'from-green-500 to-green-600'
    : effort < 100 ? 'from-cyan-500 to-blue-500'
      : effort < 150 ? 'from-orange-500 to-amber-500'
        : 'from-red-500 to-pink-500';

  const effortBorder = effort < 50 ? 'border-green-500/50'
    : effort < 100 ? 'border-cyan-500/50'
      : effort < 150 ? 'border-orange-500/50'
        : 'border-red-500/50';

  const effortGlow = effort < 50 ? 'shadow-green-500/30'
    : effort < 100 ? 'shadow-cyan-500/30'
      : effort < 150 ? 'shadow-orange-500/30'
        : 'shadow-red-500/30';

  const isSolo = block.solo === true;

  return (
    <div
      className={`relative flex-shrink-0 w-24 sm:w-28 md:w-36 lg:w-40 animate-slideIn ${isLatest ? 'z-10' : ''}`}
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div
        className={`relative h-36 sm:h-40 md:h-48 lg:h-52 rounded-lg border ${effortBorder}
                      bg-gradient-to-b ${effortColor} bg-opacity-20
                      backdrop-blur-sm overflow-hidden
                      shadow-lg ${effortGlow}
                      hover:scale-105 transition-transform cursor-pointer group`}
        style={{
          background: `linear-gradient(180deg,
            rgba(0,0,0,0.8) 0%,
            rgba(0,0,0,0.6) 50%,
            rgba(0,0,0,0.8) 100%)`
        }}
      >
        {/* Gradient overlay based on effort */}
        <div className={`absolute inset-0 bg-gradient-to-b ${effortColor} opacity-20`} />

        {/* Scan line effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
          }}
        />

        {/* Block height badge */}
        <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-sm py-1.5 px-2 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-white">
            #{formatNumber(block.height)}
          </span>
          <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded ${isSolo ? 'bg-green-500/30 text-green-400' : 'bg-pink-500/30 text-pink-400'}`}>
            {isSolo ? 'SOLO' : 'POOL'}
          </span>
        </div>

        {/* Block content */}
        <div className="relative h-full pt-10 pb-2 px-2 flex flex-col justify-between">

          {/* Effort indicator */}
          <div className="text-center">
            <div className={`text-lg md:text-xl font-bold font-mono
                          ${effort < 100 ? 'text-green-400' : 'text-orange-400'}`}>
              {effort.toFixed(1)}%
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400">Effort</div>
          </div>

          {/* Reward */}
          <div className="text-center">
            <div className="text-sm font-mono text-orange-400 font-bold">
              {formatXMR(block.value)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">XMR</div>
          </div>

          {/* Time */}
          <div className="text-center">
            <div className="text-xs font-mono text-gray-400">
              {formatTimeAgo(block.ts)}
            </div>
          </div>

          {/* Hash preview */}
          <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity">
            <code className="text-[8px] font-mono text-cyan-400/70">
              {block.hash?.slice(0, 8)}...
            </code>
          </div>
        </div>

        {/* Latest block indicator */}
        {isLatest && (
          <div className="absolute -top-1 -right-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
          </div>
        )}
      </div>

      {/* Connection line to next block */}
      {index < 5 && (
        <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 hidden md:block">
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </div>
      )}
    </div>
  );
};

interface PendingBlockProps {
  currentEffort?: number;
  difficulty?: number;
  poolHashRate?: number;
}

const PendingBlock = ({ currentEffort = 0, difficulty = 0, poolHashRate = 0 }: PendingBlockProps) => {
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIntensity(Math.random());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const estimatedSeconds = difficulty && poolHashRate ? Math.floor(difficulty / poolHashRate) : 0;
  const estimatedMinutes = Math.floor(estimatedSeconds / 60);

  return (
    <div className="relative flex-shrink-0 w-28 sm:w-32 md:w-40 lg:w-44 animate-fadeIn">
      <div
        className="relative h-36 sm:h-40 md:h-48 lg:h-52 rounded-lg border-2 border-dashed border-cyan-500/50
                    backdrop-blur-sm overflow-hidden
                    shadow-lg shadow-cyan-500/20"
        style={{
          background: `linear-gradient(180deg,
            rgba(0,255,247,${0.05 + pulseIntensity * 0.1}) 0%,
            rgba(0,0,0,0.8) 50%,
            rgba(0,255,247,${0.05 + pulseIntensity * 0.1}) 100%)`
        }}
      >

        {/* Animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-transparent to-cyan-500/10 animate-pulse" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,247,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,255,247,0.1) 1px, transparent 1px)`,
            backgroundSize: '10px 10px'
          }}
        />

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-cyan-500/20 backdrop-blur-sm py-1.5 px-2 border-b border-cyan-500/30">
          <div className="flex items-center justify-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-cyan-400">MINING</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative h-full pt-10 pb-2 px-2 flex flex-col justify-between items-center">

          {/* Effort */}
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold font-mono text-cyan-400 animate-pulse">
              {currentEffort?.toFixed(1) || '0'}%
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400">Current Effort</div>
          </div>

          {/* Mining animation */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-lg animate-ping" />
            <div className="absolute inset-2 border border-cyan-500/50 rounded animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          {/* ETA */}
          <div className="text-center">
            <div className="text-xs font-mono text-gray-400">
              ~{estimatedMinutes}m ETA
            </div>
            <div className="text-[10px] text-gray-500">avg block time</div>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
      </div>
    </div>
  );
};

const ChainArrow = () => (
  <div className="flex-shrink-0 flex items-center justify-center w-8 sm:w-12 md:w-20 lg:w-24">
    <div className="relative">
      {/* Arrow line */}
      <div className="w-6 sm:w-10 md:w-16 lg:w-20 h-0.5 bg-gradient-to-r from-cyan-500 via-pink-500 to-orange-500" />

      {/* Arrow head */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
        <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-orange-500" />
      </div>

      {/* Animated particles */}
      <div
        className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50 animate-floatParticle"
        style={{ transform: 'translateY(-50%)' }}
      />
    </div>
  </div>
);

interface BlockchainVisualProps {
  blocks?: Block[];
  currentEffort?: number;
  networkDifficulty?: number;
  poolHashRate?: number;
}

const BlockchainVisual = ({ blocks, currentEffort = 0, networkDifficulty = 0, poolHashRate = 0 }: BlockchainVisualProps) => {
  return (
    <div className="relative">
      {/* Chain label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-orange-400" />
          <span className="text-xs uppercase tracking-widest text-gray-500 font-mono">
            Blockchain → Recent Blocks
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-500">&lt;50% effort</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-gray-500">50-100%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-gray-500">100-150%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-500">&gt;150%</span>
          </div>
        </div>
      </div>

      {/* Blocks container */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 overflow-x-auto pb-3 md:pb-4 scrollbar-hide">

        {/* Pending/Mining block */}
        <PendingBlock
          currentEffort={currentEffort}
          difficulty={networkDifficulty}
          poolHashRate={poolHashRate}
        />

        {/* Chain arrow */}
        <ChainArrow />

        {/* Recent blocks */}
        {blocks?.slice(0, 6).map((block, index) => (
          <BlockCard
            key={block.hash}
            block={block}
            index={index}
            isLatest={index === 0}
          />
        ))}
      </div>

      {/* Stats bar */}
      <div className="mt-3 md:mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 p-3 md:p-4 bg-black/40 rounded-lg border border-gray-800">
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-cyan-400">
            {blocks?.length && blocks[0].height ? formatNumber(blocks[0].height) : '-'}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Latest Height</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-pink-400">
            {blocks && blocks.slice(0, 10).length > 0
              ? (blocks.slice(0, 10).reduce((acc, b) => acc + (b.effort || 0), 0) / Math.min(blocks.length, 10)).toFixed(1)
              : '0'}%
          </div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Avg Effort (10)</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-orange-400">
            {blocks && blocks.slice(0, 10).length > 0
              ? formatXMR(blocks.slice(0, 10).reduce((acc, b) => acc + (b.value || 0), 0) / Math.min(blocks.length, 10))
              : '0'}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Avg Reward</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-green-400">
            {blocks?.[0] ? formatTimeAgo(blocks[0].ts) : '-'}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Last Found</div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes floatParticle {
          0% {
            transform: translateY(-50%) translateX(0);
          }
          50% {
            transform: translateY(-50%) translateX(60px);
          }
          100% {
            transform: translateY(-50%) translateX(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-floatParticle {
          animation: floatParticle 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BlockchainVisual;

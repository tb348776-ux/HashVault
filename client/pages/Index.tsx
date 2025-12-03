import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import {
  Cpu, Activity, Zap, TrendingUp, TrendingDown,
  Box, Users, Clock, Gauge, Server, Wallet,
  ArrowUpRight, Shield, Database, RefreshCw, AlertCircle
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import BlockchainVisual from '../components/pool/BlockVisualizer';
import { formatHashRate, formatNumber, formatXMR } from '../lib/formatters';

// Fetch pool stats from HashVault API
const fetchPoolStats = async () => {
  const response = await fetch('https://api.hashvault.pro/v3/monero/pool/stats');
  if (!response.ok) throw new Error('Failed to fetch pool stats');
  return response.json();
};

// Fetch hashrate chart data
const fetchHashrateChart = async () => {
  const response = await fetch('https://api.hashvault.pro/v3/monero/pool/chart/hashrate/allWorkers');
  if (!response.ok) throw new Error('Failed to fetch chart data');
  return response.json();
};

// Fetch recent blocks
const fetchBlocks = async () => {
  const response = await fetch('https://api.hashvault.pro/v3/monero/pool/blocks');
  if (!response.ok) throw new Error('Failed to fetch blocks');
  return response.json();
};

// Cyberpunk glitch text component
const GlitchText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span className="absolute top-0 left-0.5 text-cyan-400 opacity-70 animate-pulse">{children}</span>
      <span className="absolute top-0 -left-0.5 text-pink-500 opacity-70 animate-pulse">{children}</span>
    </span>
  );
};

// Animated scan line overlay
const ScanLines = () => (
  <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-10">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scan"
      style={{ backgroundSize: '100% 4px' }} />
  </div>
);

// Neon stat card
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down';
  color?: 'cyan' | 'pink' | 'green' | 'orange' | 'purple';
  glow?: boolean;
  loading?: boolean;
}

const StatCard = ({ icon: Icon, label, value, subValue, trend, color = "cyan", glow = false, loading = false }: StatCardProps) => {
  const colors: Record<string, { border: string; text: string; glow: string; bg: string }> = {
    cyan: { border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-cyan-500/50', bg: 'bg-cyan-500/5' },
    pink: { border: 'border-pink-500/30', text: 'text-pink-400', glow: 'shadow-pink-500/50', bg: 'bg-pink-500/5' },
    green: { border: 'border-green-500/30', text: 'text-green-400', glow: 'shadow-green-500/50', bg: 'bg-green-500/5' },
    orange: { border: 'border-orange-500/30', text: 'text-orange-400', glow: 'shadow-orange-500/50', bg: 'bg-orange-500/5' },
    purple: { border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/50', bg: 'bg-purple-500/5' },
  };
  const c = colors[color];

  return (
    <div className={`relative ${c.bg} ${c.border} border rounded-lg p-4 backdrop-blur-sm
                    ${glow ? `shadow-lg ${c.glow}` : ''} transition-all duration-300 hover:scale-[1.02]
                    hover:shadow-xl group`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-mono">{label}</span>
          {typeof Icon === 'function' ? <Icon className={`w-4 h-4 ${c.text} opacity-60 group-hover:opacity-100 transition-opacity`} /> : Icon}
        </div>
        {loading ? (
          <Skeleton className="h-7 w-24 bg-gray-800" />
        ) : (
          <div className={`text-xl md:text-2xl font-bold font-mono ${c.text} truncate`}>{value}</div>
        )}
        {subValue && !loading && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
            <span className="text-xs text-gray-400 font-mono">{subValue}</span>
          </div>
        )}
      </div>
      <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${c.border}`} />
      <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${c.border}`} />
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${c.border}`} />
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${c.border}`} />
    </div>
  );
};

// Effort meter with glow
interface EffortMeterProps {
  label: string;
  value?: number;
  color?: 'cyan' | 'pink' | 'orange' | 'green';
}

const EffortMeter = ({ label, value, color = "cyan" }: EffortMeterProps) => {
  const percentage = Math.min(value || 0, 200);
  const colors: Record<string, { bar: string; glow: string; text: string }> = {
    cyan: { bar: 'bg-cyan-500', glow: 'shadow-cyan-500/50', text: 'text-cyan-400' },
    pink: { bar: 'bg-pink-500', glow: 'shadow-pink-500/50', text: 'text-pink-400' },
    orange: { bar: 'bg-orange-500', glow: 'shadow-orange-500/50', text: 'text-orange-400' },
    green: { bar: 'bg-green-500', glow: 'shadow-green-500/50', text: 'text-green-400' },
  };
  const c = colors[color];
  const isOver100 = percentage > 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase tracking-wider text-gray-500 font-mono">{label}</span>
        <span className={`text-sm font-mono font-bold ${isOver100 ? 'text-orange-400 animate-pulse' : c.text}`}>
          {(value || 0).toFixed(2)}%
        </span>
      </div>
      <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
        <div
          className={`h-full ${c.bar} rounded-full shadow-lg ${c.glow} transition-all duration-1000`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

// Section panel
interface CyberPanelProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  color?: 'cyan' | 'pink' | 'green' | 'orange' | 'purple';
}

const CyberPanel = ({ title, children, icon: Icon, color = "cyan" }: CyberPanelProps) => {
  const colors: Record<string, { border: string; text: string; line: string }> = {
    cyan: { border: 'border-cyan-500/20', text: 'text-cyan-400', line: 'bg-cyan-500' },
    pink: { border: 'border-pink-500/20', text: 'text-pink-400', line: 'bg-pink-500' },
    green: { border: 'border-green-500/20', text: 'text-green-400', line: 'bg-green-500' },
    orange: { border: 'border-orange-500/20', text: 'text-orange-400', line: 'bg-orange-500' },
    purple: { border: 'border-purple-500/20', text: 'text-purple-400', line: 'bg-purple-500' },
  };
  const c = colors[color];

  return (
    <div className={`bg-black/40 ${c.border} border rounded-xl p-4 md:p-6 backdrop-blur-md relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-px ${c.line} opacity-50`} />
      <div className="flex items-center gap-3 mb-4">
        {Icon && typeof Icon === 'function' && <Icon className={`w-5 h-5 ${c.text}`} />}
        <h2 className={`text-sm uppercase tracking-widest font-mono ${c.text}`}>{title}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent" />
      </div>
      {children}
    </div>
  );
};

// Market ticker item
interface MarketItemProps {
  label: string;
  value: string | number;
  change?: number;
}

const MarketItem = ({ label, value, change }: MarketItemProps) => {
  const isPositive = change && change > 0;
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
      <span className="text-xs text-gray-500 font-mono">{label}</span>
      <div className="text-right">
        <span className="text-sm font-mono text-purple-400">{value}</span>
        {change !== undefined && (
          <span className={`ml-2 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default function MoneroPool() {
  const [time, setTime] = useState(new Date());
  const [pulse, setPulse] = useState(false);

  // Fetch live data
  const { data: poolData, isLoading, error, refetch } = useQuery({
    queryKey: ['poolStats'],
    queryFn: fetchPoolStats,
    refetchInterval: 30000,
  });

  const { data: chartData } = useQuery({
    queryKey: ['hashChart'],
    queryFn: fetchHashrateChart,
    refetchInterval: 30000,
  });

  const { data: blocksData } = useQuery({
    queryKey: ['blocks'],
    queryFn: fetchBlocks,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setPulse(p => !p);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Process chart data
  const processedChartData = chartData?.map((point: any, index: number) => ({
    time: new Date(point.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pool: point.hs / 1e6,
  })).slice(-48) || [];

  const pool = poolData?.pool_statistics?.collective;
  const solo = poolData?.pool_statistics?.solo;
  const network = poolData?.network_statistics;
  const market = poolData?.market;
  const template = poolData?.block_template;

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 font-mono">Failed to load pool data</p>
          <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-mono text-sm hover:bg-cyan-500/30 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <ScanLines />

      {/* Background image */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692c40d31de36b9c6fba6aeb/7c8e74f50_backdrop.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }} />

      {/* Main content */}
      <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 border border-orange-500/50 flex items-center justify-center
                            shadow-lg shadow-orange-500/30">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-mono">
                  <GlitchText>HASHVAULT</GlitchText>
                  <span className="text-gray-500 text-lg ml-2">// XMR POOL</span>
                </h1>
                <p className="text-xs text-gray-500 font-mono mt-1">MONERO MINING PROTOCOL // LIVE FEED</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => refetch()} className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors">
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className={`w-2 h-2 rounded-full ${pulse ? 'bg-green-400 shadow-lg shadow-green-500/50' : 'bg-green-500/50'} transition-all`} />
            <span className="text-xs font-mono text-gray-400">
              LIVE :: {time.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Top Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Activity}
            label="Network Hash"
            value={formatHashRate((network?.difficulty || 0) / 120)}
            color="cyan"
            glow
            loading={isLoading}
          />
          <StatCard
            icon={Cpu}
            label="Pool Hash"
            value={formatHashRate(pool?.hashRate)}
            color="pink"
            glow
            loading={isLoading}
          />
          <StatCard
            icon={Users}
            label="Miners Online"
            value={formatNumber((pool?.miners || 0) + (solo?.miners || 0))}
            color="green"
            loading={isLoading}
          />
          <StatCard
            icon={Wallet}
            label="XMR/USD"
            value={`$${(market?.price_usd || 0).toFixed(2)}`}
            subValue={`${(market?.percent_change_24h || 0) > 0 ? '+' : ''}${(market?.percent_change_24h || 0).toFixed(2)}%`}
            trend={(market?.percent_change_24h || 0) > 0 ? 'up' : 'down'}
            color="purple"
            loading={isLoading}
          />
        </div>

        {/* Blockchain Visualizer */}
        <CyberPanel title="Block Chain // Live Feed" icon={Box} color="orange">
          <BlockchainVisual
            blocks={blocksData}
            currentEffort={pool?.currentEffort}
            networkDifficulty={network?.difficulty}
            poolHashRate={pool?.hashRate}
          />
        </CyberPanel>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Network Panel */}
          <CyberPanel title="Network Status" icon={Server} color="cyan">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 bg-gray-800" />)}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 font-mono block">BLOCK HEIGHT</span>
                    <span className="text-lg font-bold font-mono text-cyan-400">{formatNumber(network?.height)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-mono block">DIFFICULTY</span>
                    <span className="text-sm font-mono text-cyan-300 truncate block">{formatNumber(network?.difficulty)}</span>
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-cyan-500/10">
                  <span className="text-xs text-gray-500 font-mono block mb-1">LATEST BLOCK HASH</span>
                  <code className="text-xs font-mono text-cyan-300 break-all">
                    {network?.hash?.slice(0, 8)}...{network?.hash?.slice(-8)}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-mono">BLOCK REWARD</span>
                  <span className="text-sm font-mono text-cyan-400">{formatXMR(network?.value)} XMR</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-mono">TEMPLATE DIFF</span>
                  <span className="text-sm font-mono text-cyan-400">{formatNumber(template?.difficulty)}</span>
                </div>
              </div>
            )}
          </CyberPanel>

          {/* Pool Stats */}
          <CyberPanel title="Pool Mining" icon={Database} color="pink">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 bg-gray-800" />)}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 font-mono block">BLOCKS FOUND</span>
                    <span className="text-lg font-bold font-mono text-pink-400">{formatNumber(pool?.totalBlocksFound)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-mono block">ORPHANS</span>
                    <span className="text-lg font-mono text-red-400">{formatNumber(pool?.orphans)}</span>
                  </div>
                </div>
                <EffortMeter label="Current Effort" value={pool?.currentEffort} color="pink" />
                <EffortMeter label="Overall Effort" value={pool?.overallEffort} color="orange" />
                <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                  <span className="text-xs text-gray-500 font-mono">PPLNS WINDOW</span>
                  <span className="text-sm font-mono text-pink-300">
                    {Math.floor((pool?.pplnsWindowTime || 0) / 60)}:{String((pool?.pplnsWindowTime || 0) % 60).padStart(2, '0')}
                  </span>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-pink-500/10">
                  <span className="text-xs text-gray-500 font-mono block mb-1">LAST BLOCK</span>
                  <code className="text-xs font-mono text-pink-300">
                    {pool?.lastFoundBlock?.hash?.slice(0, 8)}...{pool?.lastFoundBlock?.hash?.slice(-8)}
                  </code>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-gray-500">Height: {formatNumber(pool?.lastFoundBlock?.height)}</span>
                    <span className="text-pink-400">{formatXMR(pool?.lastFoundBlock?.value)} XMR</span>
                  </div>
                </div>
              </div>
            )}
          </CyberPanel>

          {/* Solo Stats */}
          <CyberPanel title="Solo Mining" icon={Zap} color="green">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 bg-gray-800" />)}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 font-mono block">BLOCKS FOUND</span>
                    <span className="text-lg font-bold font-mono text-green-400">{formatNumber(solo?.totalBlocksFound)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-mono block">ORPHANS</span>
                    <span className="text-lg font-mono text-red-400">{formatNumber(solo?.orphans)}</span>
                  </div>
                </div>
                <EffortMeter label="Current Effort" value={solo?.currentEffort} color="green" />
                <EffortMeter label="Overall Effort" value={solo?.overallEffort} color="cyan" />
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800">
                  <div>
                    <span className="text-xs text-gray-500 font-mono block">HASH RATE</span>
                    <span className="text-sm font-mono text-green-400">{formatHashRate(solo?.hashRate)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-mono block">MINERS</span>
                    <span className="text-sm font-mono text-green-400">{formatNumber(solo?.miners)}</span>
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-green-500/10">
                  <span className="text-xs text-gray-500 font-mono block mb-1">LAST BLOCK</span>
                  <code className="text-xs font-mono text-green-300">
                    {solo?.lastFoundBlock?.hash?.slice(0, 8)}...{solo?.lastFoundBlock?.hash?.slice(-8)}
                  </code>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-gray-500">Height: {formatNumber(solo?.lastFoundBlock?.height)}</span>
                    <span className="text-green-400">{formatXMR(solo?.lastFoundBlock?.value)} XMR</span>
                  </div>
                </div>
              </div>
            )}
          </CyberPanel>
        </div>

        {/* Hash Rate Chart */}
        <CyberPanel title="Pool Hash Rate Telemetry" icon={Activity} color="cyan">
          <div className="h-64">
            {processedChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedChartData}>
                  <defs>
                    <linearGradient id="poolGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#374151"
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#374151"
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v.toFixed(0)} MH`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0a0f',
                      border: '1px solid #ec4899',
                      borderRadius: '8px',
                      fontFamily: 'monospace'
                    }}
                    labelStyle={{ color: '#ec4899' }}
                    formatter={(value: number) => [`${value.toFixed(2)} MH/s`, 'Pool Hash Rate']}
                  />
                  <Area
                    type="monotone"
                    dataKey="pool"
                    stroke="#ec4899"
                    fill="url(#poolGradient)"
                    strokeWidth={2}
                    name="Pool (MH/s)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="h-48 w-full bg-gray-800" />
              </div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500 shadow shadow-pink-500/50" />
              <span className="text-xs font-mono text-gray-400">Pool Hash Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">Updates every 60s</span>
            </div>
          </div>
        </CyberPanel>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          {/* Market Data */}
          <CyberPanel title="Market Data" icon={TrendingUp} color="purple">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 bg-gray-800" />)}
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <MarketItem label="XMR/BTC" value={(market?.price_btc || 0).toFixed(8)} />
                  <MarketItem label="XMR/USD" value={`$${(market?.price_usd || 0).toFixed(2)}`} change={market?.percent_change_24h} />
                  <MarketItem label="XMR/EUR" value={`€${(market?.price_eur || 0).toFixed(2)}`} />
                  <MarketItem label="Market Cap" value={`${formatNumber(market?.market_cap_btc)} BTC`} />
                  <MarketItem label="24h Volume" value={`${formatNumber(market?.["24h_volume_btc"])} BTC`} />
                  <MarketItem label="7 Day" value="" change={market?.percent_change_7d} />
                </div>
                <div className="mt-4 pt-4 border-t border-purple-500/20 text-center">
                  <span className="text-xs text-gray-500 font-mono">Powered by CoinGecko</span>
                </div>
              </>
            )}
          </CyberPanel>

          {/* Pool Config */}
          <CyberPanel title="Pool Configuration" icon={Gauge} color="orange">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                <span className="text-xs text-gray-500 font-mono">POW ALGORITHM</span>
                <span className="text-sm font-mono text-orange-400 font-bold">RandomX</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                <span className="text-xs text-gray-500 font-mono">POOL FEE</span>
                <span className="text-sm font-mono text-orange-400">{poolData?.config?.pplns_fee || 0.9}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                <span className="text-xs text-gray-500 font-mono">MIN PAYOUT</span>
                <span className="text-sm font-mono text-orange-400">{formatXMR(poolData?.config?.payout?.minimum)} XMR</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                <span className="text-xs text-gray-500 font-mono">PAYOUT INTERVAL</span>
                <span className="text-sm font-mono text-orange-400">Hourly</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                <span className="text-xs text-gray-500 font-mono">BLOCK MATURITY</span>
                <span className="text-sm font-mono text-orange-400">{poolData?.config?.maturity_depth || 30} blocks</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-gray-500 font-mono">ONLINE USERS</span>
                <span className="text-sm font-mono text-orange-400">{formatNumber(poolData?.online)}</span>
              </div>
            </div>
          </CyberPanel>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-gray-800/50">
          <p className="text-xs font-mono text-gray-600">
            <span className="text-cyan-500">&lt;</span>
            HASHVAULT MONERO POOL // CYBERDECK INTERFACE v2.0 // LIVE DATA
            <span className="text-cyan-500">/&gt;</span>
          </p>
          <div className="flex justify-center gap-4 mt-3">
            <a href="https://monero.hashvault.pro" target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-cyan-400 transition-colors font-mono flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Official Pool
            </a>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

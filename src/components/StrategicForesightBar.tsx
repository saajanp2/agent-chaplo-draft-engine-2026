import React from 'react';
import { Player, Position } from '../types';
import { TrendingUp, Flame, Zap, AlertTriangle, ShieldCheck, ShieldAlert, Target, Award, ArrowUpRight } from 'lucide-react';

interface StrategicForesightBarProps {
  availablePlayers: Player[];
  myTeam: Player[];
  onSelectPlayer: (player: Player) => void;
  onDraftPlayer: (player: Player) => void;
}

export const StrategicForesightBar: React.FC<StrategicForesightBarProps> = ({
  availablePlayers,
  myTeam,
  onSelectPlayer,
  onDraftPlayer,
}) => {
  // 1. Top Market Inefficiency (Highest Positive Gap)
  const topInefficiency = React.useMemo(() => {
    if (availablePlayers.length === 0) return null;
    return [...availablePlayers].sort((a, b) => b.Market_Gap - a.Market_Gap)[0];
  }, [availablePlayers]);

  // 2. Highest Ceiling Monster (90th Percentile Peak PPG)
  const topCeiling = React.useMemo(() => {
    if (availablePlayers.length === 0) return null;
    return [...availablePlayers].sort((a, b) => (b.Ceiling_PPG_26 || 0) - (a.Ceiling_PPG_26 || 0))[0];
  }, [availablePlayers]);

  // 3. Highest VORP King
  const topVorp = React.useMemo(() => {
    if (availablePlayers.length === 0) return null;
    return [...availablePlayers].sort((a, b) => b.VORP - a.VORP)[0];
  }, [availablePlayers]);

  // 4. Steepest Positional Cliff (Largest Dynamic Drop-Off to Next Available)
  const topCliffPlayer = React.useMemo(() => {
    if (availablePlayers.length === 0) return null;
    return [...availablePlayers].sort((a, b) => (b.Dynamic_Dropoff || 0) - (a.Dynamic_Dropoff || 0))[0];
  }, [availablePlayers]);

  // 5. Positional Scarcity & Positional Cliff Matrix
  const scarcityReport = React.useMemo(() => {
    const positions: Position[] = ['RB', 'WR', 'TE', 'QB'];
    const summary = positions.map((pos) => {
      const posPlayers = availablePlayers.filter((p) => p.Pos === pos);
      const tier1Count = posPlayers.filter((p) => p.Position_Tier === 1).length;
      const tier2Count = posPlayers.filter((p) => p.Position_Tier === 2).length;
      const topTier = tier1Count > 0 ? 1 : tier2Count > 0 ? 2 : 3;
      const countInTopTier = tier1Count > 0 ? tier1Count : tier2Count > 0 ? tier2Count : posPlayers.length;
      const leader = posPlayers[0];
      const maxDropoff = leader?.Dynamic_Dropoff || 0;
      const nextPlayerName = leader?.dynamicDropoff?.nextPlayerName;

      return {
        pos,
        topTier,
        countInTopTier,
        totalAvailable: posPlayers.length,
        maxDropoff,
        leaderName: leader?.Player_Name,
        nextPlayerName,
        isCritical: (countInTopTier <= 2 && topTier <= 2) || maxDropoff >= 2.5,
      };
    });

    // Roster-aware tactical recommendation
    const myQbCount = myTeam.filter((p) => p.Pos === 'QB').length;
    const myRbCount = myTeam.filter((p) => p.Pos === 'RB').length;
    const myWrCount = myTeam.filter((p) => p.Pos === 'WR').length;
    const myTeCount = myTeam.filter((p) => p.Pos === 'TE').length;

    let targetPos: Position = 'RB';
    let tacticalAdvice = 'Draft highest raw PPG / championship edge player available.';

    if (topCliffPlayer && (topCliffPlayer.Dynamic_Dropoff || 0) >= 2.5) {
      targetPos = topCliffPlayer.Pos;
      tacticalAdvice = `Steepest Point Cliff: ${topCliffPlayer.Player_Name} (${topCliffPlayer.Pos}) provides a massive +${topCliffPlayer.Dynamic_Dropoff} PPG weekly advantage over next available option.`;
    } else if (myQbCount === 0 && topVorp?.Pos === 'QB' && (topVorp.Proj_PPG_26 || 0) >= 27.0) {
      targetPos = 'QB';
      tacticalAdvice = `6-pt Pass TD Weapon: ${topVorp.Player_Name} projects for ${topVorp.Proj_PPG_26} PPG (+9.5 PPG weekly matchup advantage at QB).`;
    } else if (myRbCount + myWrCount < 6 && (topCliffPlayer?.Pos === 'RB' || topCliffPlayer?.Pos === 'WR')) {
      targetPos = topCliffPlayer.Pos;
      tacticalAdvice = `2-FLEX Point Engine: Lock in ${topCliffPlayer.Player_Name} (${topCliffPlayer.Pos}, ${topCliffPlayer.Proj_PPG_26} PPG) to maximize your 10-starter weekly ceiling.`;
    } else if (myTeCount === 0 && summary.find((s) => s.pos === 'TE')?.topTier === 1) {
      targetPos = 'TE';
      tacticalAdvice = 'Elite TE Advantage: Lock in Tier 1 TE for an automatic +7.5 PPG positional edge over 80% of the league.';
    } else {
      tacticalAdvice = `Point Optimization BPA: Target highest projected PPG and 90th percentile ceiling on the board.`;
    }

    return { summary, tacticalAdvice, targetPos };
  }, [availablePlayers, myTeam, topVorp, topCliffPlayer]);

  if (availablePlayers.length === 0) return null;

  return (
    <section className="my-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Market Inefficiency */}
        {topInefficiency && (
          <div
            id="card-market-inefficiency"
            onClick={() => onSelectPlayer(topInefficiency)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-neutral-900/60 to-neutral-950/80 p-3.5 backdrop-blur-md transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>#1 Market Inefficiency</span>
              </div>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                +{topInefficiency.Market_Gap} Pick Gap
              </span>
            </div>

            <div className="mt-1 flex items-start justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-neutral-100 group-hover:text-emerald-300 transition-colors">
                  {topInefficiency.Player_Name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-300">{topInefficiency.Pos}</span>
                  <span>•</span>
                  <span>{topInefficiency.Team}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">{topInefficiency.Sleeper_Tag}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDraftPlayer(topInefficiency);
                }}
                className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500 hover:text-neutral-950 transition-all"
                title="Draft this player immediately"
              >
                Draft
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-neutral-800/80 pt-2 text-[11px] text-neutral-400">
              <span>Avg ADP: <b className="text-neutral-200">{topInefficiency.Avg_ADP}</b></span>
              <span>True Rank: <b className="text-emerald-400">#{topInefficiency.Projected_Rank}</b></span>
              <span>Edge Score: <b className="text-emerald-300">{topInefficiency.Championship_Edge_Score}</b></span>
            </div>
          </div>
        )}

        {/* Card 2: Highest Ceiling Monster */}
        {topCeiling && (
          <div
            id="card-highest-ceiling"
            onClick={() => onSelectPlayer(topCeiling)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-neutral-900/60 to-neutral-950/80 p-3.5 backdrop-blur-md transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10"
          >
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <Flame className="h-3.5 w-3.5" />
                <span>#1 90th% Ceiling Peak</span>
              </div>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-500/30">
                {topCeiling.Ceiling_PPG_26} Peak PPG
              </span>
            </div>

            <div className="mt-1 flex items-start justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                  {topCeiling.Player_Name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-300">{topCeiling.Pos}</span>
                  <span>•</span>
                  <span>{topCeiling.Team}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-medium">Boom: {Math.round((topCeiling.Boom_Rate || 0.4) * 100)}%</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDraftPlayer(topCeiling);
                }}
                className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-500 hover:text-neutral-950 transition-all"
                title="Draft this player immediately"
              >
                Draft
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-neutral-800/80 pt-2 text-[11px] text-neutral-400">
              <span>Proj Total: <b className="text-neutral-200">{topCeiling.Proj_Fantasy_Pts_26} pts</b></span>
              <span>Floor: <b className="text-neutral-400">{topCeiling.Floor_PPG_26} PPG</b></span>
              <span>Edge: <b className="text-amber-300">{topCeiling.Championship_Edge_Score}</b></span>
            </div>
          </div>
        )}

        {/* Card 3: Highest VORP & Positional Drop-off King */}
        {topVorp && (
          <div
            id="card-highest-vorp"
            onClick={() => onSelectPlayer(topVorp)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-neutral-900/60 to-neutral-950/80 p-3.5 backdrop-blur-md transition-all hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
          >
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                <Award className="h-3.5 w-3.5" />
                <span>#1 VORP Advantage</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-500/30" title="Season VORP vs baseline starter">
                  +{topVorp.VORP} VORP
                </span>
                {(topVorp.Dynamic_Dropoff || 0) > 0 && (
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 ring-1 ring-rose-500/30" title={`Live drop-off vs next available ${topVorp.Pos} (${topVorp.dynamicDropoff?.nextPlayerName})`}>
                    +{topVorp.Dynamic_Dropoff} PPG Drop-off
                  </span>
                )}
              </div>
            </div>

            <div className="mt-1 flex items-start justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-neutral-100 group-hover:text-indigo-300 transition-colors">
                  {topVorp.Player_Name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-300">{topVorp.Pos}</span>
                  <span>•</span>
                  <span>{topVorp.Team}</span>
                  <span>•</span>
                  <span className="text-indigo-300 font-medium">Tier {topVorp.Position_Tier}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDraftPlayer(topVorp);
                }}
                className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300 ring-1 ring-indigo-500/40 hover:bg-indigo-500 hover:text-neutral-950 transition-all"
                title="Draft this player immediately"
              >
                Draft
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-neutral-800/80 pt-2 text-[11px] text-neutral-400">
              <span>Proj: <b className="text-neutral-200">{topVorp.Proj_PPG_26} PPG</b></span>
              <span>Next Drop: <b className="text-rose-300">+{topVorp.Dynamic_Dropoff || 0} PPG</b></span>
              <span>Edge: <b className="text-indigo-300">{topVorp.Championship_Edge_Score}</b></span>
            </div>
          </div>
        )}

        {/* Card 4: Positional Scarcity & War Room Recommendation */}
        <div
          id="card-scarcity-radar"
          className="relative overflow-hidden rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-950/20 via-neutral-900/60 to-neutral-950/80 p-3.5 backdrop-blur-md transition-all hover:border-rose-500/40"
        >
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Scarcity & Cliff Radar</span>
            </div>
            <span className="text-[10px] font-medium text-neutral-400">Max Positional Drop-off</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 py-1">
            {scarcityReport.summary.map((item) => (
              <div
                key={item.pos}
                className={`flex flex-col items-center rounded-lg p-1.5 text-center transition-all ${
                  item.isCritical
                    ? 'bg-rose-500/20 ring-1 ring-rose-500/40 animate-pulse'
                    : 'bg-neutral-800/60'
                }`}
                title={item.leaderName && item.nextPlayerName ? `${item.leaderName} → ${item.nextPlayerName}: -${item.maxDropoff} PPG` : `${item.totalAvailable} left`}
              >
                <span className="text-[10px] font-bold text-neutral-300">{item.pos}</span>
                <span
                  className={`text-xs font-extrabold ${
                    item.isCritical ? 'text-rose-400' : 'text-neutral-200'
                  }`}
                >
                  T{item.topTier}: {item.countInTopTier}
                </span>
                <span className="text-[9px] font-medium text-neutral-400">
                  {item.maxDropoff >= 1.5 ? `-${item.maxDropoff} PPG` : `${item.totalAvailable} left`}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2.5 border-t border-neutral-800/80 pt-2">
            <p className="text-[11px] leading-tight text-neutral-300 font-medium">
              💡 <span className="text-neutral-400">Tactical Insight:</span> {scarcityReport.tacticalAdvice}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

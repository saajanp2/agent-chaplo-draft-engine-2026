import React from 'react';
import { Player } from '../types';
import { 
  X, Flame, TrendingUp, Award, ShieldAlert, Sparkles, Plus, 
  Target, BarChart3, Activity, ArrowUpRight, Scale
} from 'lucide-react';

interface PlayerDetailModalProps {
  player: Player | null;
  onClose: () => void;
  onDraft: (player: Player) => void;
  isDrafted: boolean;
  onToggleCompare: (player: Player) => void;
  isCompared: boolean;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  onClose,
  onDraft,
  isDrafted,
  onToggleCompare,
  isCompared,
}) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 p-4 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-player-modal"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-black text-indigo-300 ring-1 ring-indigo-500/30">
                {player.Pos}
              </span>
              <span className="text-xs font-semibold text-neutral-400">{player.Team}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-xs text-neutral-400">Age {player.Age}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-xs text-amber-400 font-semibold">Tier {player.Position_Tier}</span>
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-neutral-100">
              {player.Player_Name}
            </h2>
            <p className="text-xs font-medium text-emerald-400">
              {player.Sleeper_Tag} — {player.Last_Depth_Chart}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={() => onToggleCompare(player)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isCompared
                  ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              <span>{isCompared ? 'Comparing' : 'Compare'}</span>
            </button>

            <button
              onClick={() => onDraft(player)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all shadow-lg ${
                isDrafted
                  ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>{isDrafted ? 'Remove from Team' : 'Draft Player'}</span>
            </button>
          </div>
        </div>

        {/* 5-Stat Core Key Metrics Strip */}
        <div className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Championship Edge
            </span>
            <div className="mt-1 font-mono text-xl font-extrabold text-emerald-400">
              {player.Championship_Edge_Score}/100
            </div>
            <span className="text-[10px] text-neutral-400">Algorithmic Grade</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Market Inefficiency
            </span>
            <div className="mt-1 font-mono text-xl font-extrabold text-indigo-300">
              +{player.Market_Gap}
            </div>
            <span className="text-[10px] text-neutral-400">Picks Ahead of ADP</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center" title="Season-long Value Over Replacement Starter (QB12, RB24, WR36, TE12)">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Season VORP
            </span>
            <div className="mt-1 font-mono text-xl font-extrabold text-amber-400">
              +{player.VORP}
            </div>
            <span className="text-[10px] text-neutral-400">Pts Above Baseline</span>
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 text-center" title={player.dynamicDropoff?.nextPlayerName ? `Drop-off vs next available ${player.Pos}: ${player.dynamicDropoff.nextPlayerName} (${player.dynamicDropoff.nextPlayerPPG} PPG)` : 'Next available at position'}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">
              Live Pos Drop-off
            </span>
            <div className="mt-1 font-mono text-xl font-extrabold text-rose-400">
              +{player.Dynamic_Dropoff || 0} PPG
            </div>
            <span className="text-[10px] text-neutral-400 truncate block">
              {player.dynamicDropoff?.nextPlayerName ? `vs ${player.dynamicDropoff.nextPlayerName}` : 'Next on Board'}
            </span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              90th% Ceiling Peak
            </span>
            <div className="mt-1 font-mono text-xl font-extrabold text-amber-300">
              {player.Ceiling_PPG_26 || '-'} PPG
            </div>
            <span className="text-[10px] text-neutral-400">Weekly Max Output</span>
          </div>
        </div>

        {/* Detailed 2025 Actuals vs 2026 Projections Breakdown */}
        <div className="my-5 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
          <h4 className="flex items-center gap-2 font-serif text-sm font-bold text-neutral-100">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <span>2025 Actual Production vs 2026 Projected Output</span>
          </h4>

          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 2025 Actual Column */}
            <div className="space-y-2 rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-3 text-xs">
              <span className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider">
                2025 Actual Statistics
              </span>
              <div className="flex justify-between border-b border-neutral-800/60 py-1 text-neutral-300">
                <span>Fantasy PPG:</span>
                <span className="font-mono font-bold text-white">{player.Fantasy_PPG_25 || '-'} PPG</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800/60 py-1 text-neutral-300">
                <span>Red Zone Touches:</span>
                <span className="font-mono text-white">{player.RZ_Touches_25} touches</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800/60 py-1 text-neutral-300">
                <span>Target Share:</span>
                <span className="font-mono text-white">{player.Target_Share_25 ? `${Math.round(player.Target_Share_25 * 100)}%` : '-'}</span>
              </div>
              <div className="flex justify-between py-1 text-neutral-300">
                <span>EPA / Play Efficiency:</span>
                <span className="font-mono text-emerald-400 font-bold">{player.EPA_Per_Play_25 || '-'}</span>
              </div>
            </div>

            {/* 2026 Projections Column */}
            <div className="space-y-2 rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-3 text-xs">
              <span className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider">
                2026 Projected Ceiling & Floor
              </span>
              <div className="flex justify-between border-b border-indigo-900/40 py-1 text-neutral-200">
                <span>Projected PPG:</span>
                <span className="font-mono font-bold text-emerald-400">{player.Proj_PPG_26} PPG</span>
              </div>
              <div className="flex justify-between border-b border-indigo-900/40 py-1 text-neutral-200">
                <span>Ceiling (90th percentile):</span>
                <span className="font-mono font-bold text-amber-300">{player.Ceiling_PPG_26 || '-'} PPG</span>
              </div>
              <div className="flex justify-between border-b border-indigo-900/40 py-1 text-neutral-200">
                <span>Floor (10th percentile):</span>
                <span className="font-mono text-neutral-400">{player.Floor_PPG_26 || '-'} PPG</span>
              </div>
              <div className="flex justify-between py-1 text-neutral-200">
                <span>Boom Potential (25+ pt games):</span>
                <span className="font-mono text-emerald-300 font-bold">
                  {player.Boom_Rate ? `${Math.round(player.Boom_Rate * 100)}%` : '35%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Scouting & Scheme Analysis */}
        <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-xs leading-relaxed text-neutral-300">
          <h4 className="flex items-center gap-2 font-serif text-sm font-bold text-amber-400">
            <Flame className="h-4 w-4 text-amber-400" />
            <span>Championship Playbook & Market Inefficiency Rationale</span>
          </h4>
          <p>{player.Notable_Description}</p>
          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-neutral-800 text-[11px]">
            <span className="rounded bg-neutral-900 px-2 py-1 text-neutral-300 border border-neutral-800">
              Yahoo ADP: <b className="text-neutral-100">{player.Yahoo_ADP}</b>
            </span>
            <span className="rounded bg-neutral-900 px-2 py-1 text-neutral-300 border border-neutral-800">
              Sleeper ADP: <b className="text-neutral-100">{player.Sleeper_ADP}</b>
            </span>
            <span className="rounded bg-neutral-900 px-2 py-1 text-neutral-300 border border-neutral-800">
              Expert Consensus (ECR): <b className="text-neutral-100">#{player.ECR_Rank}</b>
            </span>
            <span className="rounded bg-neutral-900 px-2 py-1 text-neutral-300 border border-neutral-800">
              Model True Rank: <b className="text-emerald-400 font-bold">#{player.Projected_Rank}</b>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

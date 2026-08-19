import React from 'react';
import { Player, Position } from '../types';
import { 
  X, Flame, TrendingUp, Award, ShieldAlert, Sparkles, Plus, 
  Target, BarChart3, Activity, ArrowUpRight, Scale, CheckCircle2, UserPlus
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

  const posBadgeColor = (pos: Position) => {
    switch (pos) {
      case 'QB': return 'bg-purple-500/20 text-purple-300 ring-purple-500/30';
      case 'RB': return 'bg-blue-500/20 text-blue-300 ring-blue-500/30';
      case 'WR': return 'bg-amber-500/20 text-amber-300 ring-amber-500/30';
      case 'TE': return 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30';
      case 'K': return 'bg-teal-500/20 text-teal-300 ring-teal-500/30';
      case 'DEF': return 'bg-rose-500/20 text-rose-300 ring-rose-500/30';
      default: return 'bg-neutral-800 text-neutral-300 ring-neutral-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 p-4 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-2xl text-neutral-100 space-y-5"
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

        {/* Header Section */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold ring-1 ${posBadgeColor(player.Pos)}`}>
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
            <p className="text-xs font-medium text-amber-400">
              {player.Sleeper_Tag} — Rank #{player.Offline_Draft_Rank} Overall
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={() => onToggleCompare(player)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isCompared
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              <span>{isCompared ? 'Comparing' : 'Compare'}</span>
            </button>

            <button
              onClick={() => onDraft(player)}
              disabled={isDrafted}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all shadow-lg ${
                isDrafted
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              {isDrafted ? (
                <span>Drafted</span>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Draft Player</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5-Stat Core Key Metrics Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              W1–4 Proj PPG
            </span>
            <div className="mt-1 font-mono text-xl font-extrabold text-emerald-400">
              {player.W1_4_Proj_PPG} PPG
            </div>
            <span className="text-[10px] text-neutral-400">{player.W1_4_Proj_Total_Pts} pts in W1-4</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              POADP Surplus
            </span>
            <div className={`mt-1 font-mono text-xl font-extrabold ${player.POADP_Points_Over_ADP >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {player.POADP_Points_Over_ADP >= 0 ? `+${player.POADP_Points_Over_ADP}` : player.POADP_Points_Over_ADP}
            </div>
            <span className="text-[10px] text-neutral-400">Spots Ahead of ADP</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              2026 Season Total
            </span>
            <div className="mt-1 font-mono text-xl font-extrabold text-amber-400">
              {player.Proj_Fantasy_Pts_2026}
            </div>
            <span className="text-[10px] text-neutral-400">Projected Points</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Season VORP
            </span>
            <div className="mt-1 font-mono text-xl font-extrabold text-indigo-300">
              +{player.VORP}
            </div>
            <span className="text-[10px] text-neutral-400">Points Over Baseline</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              90th% Boom Ceiling
            </span>
            <div className="mt-1 font-mono text-xl font-extrabold text-amber-300">
              {player.Ceiling_PPG_26 || '-'} PPG
            </div>
            <span className="text-[10px] text-neutral-400">Spike Week Max</span>
          </div>
        </div>

        {/* Opportunity & Strategic Archetype Box */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Primary Weekly Opportunity & Volume
            </span>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[11px] font-bold text-indigo-300 ring-1 ring-indigo-500/30">
              Category: {player.W1_4_Category}
            </span>
          </div>
          <p className="font-mono text-sm font-semibold text-neutral-100">
            {player.Primary_Weekly_Opportunity}
          </p>
        </div>

        {/* Head-to-Head Do's and Don'ts Strategy */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
          <h4 className="flex items-center gap-2 font-serif text-sm font-bold text-amber-400">
            <Flame className="h-4 w-4 text-amber-400" />
            <span>Head-to-Head Decision Strategy (Do's & Don'ts)</span>
          </h4>
          <p className="text-xs text-amber-200 leading-relaxed italic">
            "{player.Dos_And_Donts}"
          </p>
        </div>

        {/* Scouting Breakdown & Description */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 space-y-2 text-xs leading-relaxed text-neutral-300">
          <h4 className="font-serif text-sm font-bold text-neutral-100">
            Role & Scouting Breakdown
          </h4>
          <p>{player.Notable_Description}</p>

          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-neutral-800 text-[11px]">
            <span className="rounded bg-neutral-900 px-2 py-1 text-neutral-300 border border-neutral-800">
              Yahoo ADP: <b className="text-neutral-100">{player.Yahoo_ADP.toFixed(1)}</b>
            </span>
            <span className="rounded bg-neutral-900 px-2 py-1 text-neutral-300 border border-neutral-800">
              Sleeper ADP: <b className="text-neutral-100">{player.Sleeper_ADP.toFixed(1)}</b>
            </span>
            <span className="rounded bg-neutral-900 px-2 py-1 text-neutral-300 border border-neutral-800">
              Consensus (ECR): <b className="text-neutral-100">#{player.ECR_Rank}</b>
            </span>
            <span className="rounded bg-neutral-900 px-2 py-1 text-neutral-300 border border-neutral-800">
              True Model Rank: <b className="text-emerald-400 font-bold">#{player.Offline_Draft_Rank}</b>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

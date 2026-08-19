import React from 'react';
import { X, Trash2, UserPlus, Scale, Sparkles, AlertCircle } from 'lucide-react';
import { Player, Position } from '../types';

interface ComparisonDockProps {
  comparedPlayers: Player[];
  onRemovePlayer: (id: number) => void;
  onClearAll: () => void;
  onDraftPlayer: (player: Player) => void;
  draftedPlayerIds: Set<number>;
}

export const ComparisonDock: React.FC<ComparisonDockProps> = ({
  comparedPlayers,
  onRemovePlayer,
  onClearAll,
  onDraftPlayer,
  draftedPlayerIds,
}) => {
  if (comparedPlayers.length === 0) return null;

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
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
            <Scale className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-neutral-100">
              Player Head-to-Head Comparison Dock ({comparedPlayers.length}/4)
            </h3>
            <p className="text-xs text-neutral-400">
              Side-by-side metric comparison, POADP surplus differentials, and tactical decision advice
            </p>
          </div>
        </div>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear Dock</span>
        </button>
      </div>

      {/* Comparison Grid */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-${Math.min(4, Math.max(1, comparedPlayers.length))}`}>
        {comparedPlayers.map((player) => {
          const isDrafted = draftedPlayerIds.has(player.Player_ID);

          return (
            <div
              key={player.Player_ID}
              className="relative rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 space-y-3 shadow-lg"
            >
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] font-bold ring-1 ${posBadgeColor(player.Pos)}`}>
                      {player.Pos}
                    </span>
                    <span className="font-mono text-xs text-neutral-400">#{player.Offline_Draft_Rank}</span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-neutral-100 mt-1">
                    {player.Player_Name}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {player.Team} • {player.Sleeper_Tag} • Tier {player.Position_Tier}
                  </p>
                </div>

                <button
                  onClick={() => onRemovePlayer(player.Player_ID)}
                  className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-rose-400 transition-all"
                  title="Remove from comparison"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Metrics Table */}
              <div className="divide-y divide-neutral-800/80 rounded-lg bg-neutral-900/60 p-2.5 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Weeks 1–4 Proj PPG:</span>
                  <strong className="font-mono text-emerald-400">{player.W1_4_Proj_PPG} PPG</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">2026 Season Total:</span>
                  <strong className="font-mono text-neutral-200">{player.Proj_Fantasy_Pts_2026} pts</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Yahoo ADP:</span>
                  <span className="font-mono text-neutral-300">{player.Yahoo_ADP.toFixed(1)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">POADP Surplus:</span>
                  <strong className={`font-mono ${player.POADP_Points_Over_ADP >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {player.POADP_Points_Over_ADP >= 0 ? `+${player.POADP_Points_Over_ADP}` : player.POADP_Points_Over_ADP} spots
                  </strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Category:</span>
                  <span className="text-amber-300 font-medium text-[11px] truncate max-w-[140px]">{player.W1_4_Category}</span>
                </div>
              </div>

              {/* Opportunity */}
              <div className="rounded-lg bg-neutral-900/40 p-2 text-xs text-neutral-300">
                <span className="text-[10px] font-bold uppercase text-neutral-500 block">Weekly Opportunity:</span>
                <p className="text-[11px]">{player.Primary_Weekly_Opportunity}</p>
              </div>

              {/* H2H Tip */}
              <div className="rounded-lg bg-amber-950/20 border border-amber-500/30 p-2 text-xs text-amber-200/90 italic">
                <span className="text-[10px] font-bold uppercase text-amber-400 block not-italic">Decision Tip:</span>
                "{player.Dos_And_Donts}"
              </div>

              {/* Draft Button */}
              <button
                onClick={() => onDraftPlayer(player)}
                disabled={isDrafted}
                className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                  isDrafted
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
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
          );
        })}
      </div>
    </div>
  );
};

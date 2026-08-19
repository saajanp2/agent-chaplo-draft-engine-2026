import React from 'react';
import { Player } from '../types';
import { X, Scale, Plus, ArrowRight, TrendingUp, Flame, Award } from 'lucide-react';

interface ComparisonDockProps {
  comparedPlayers: Player[];
  onRemovePlayer: (playerId: number) => void;
  onClearAll: () => void;
  onDraftPlayer: (player: Player) => void;
  myTeamIds: Set<number>;
}

export const ComparisonDock: React.FC<ComparisonDockProps> = ({
  comparedPlayers,
  onRemovePlayer,
  onClearAll,
  onDraftPlayer,
  myTeamIds,
}) => {
  if (comparedPlayers.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-full max-w-4xl -translate-x-1/2 px-4 animate-slideUp">
      <div className="rounded-2xl border border-neutral-700/80 bg-neutral-900/95 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-amber-400" />
            <h4 className="font-serif text-sm font-bold text-neutral-100">
              Head-to-Head Comparison ({comparedPlayers.length}/4)
            </h4>
          </div>
          <button
            onClick={onClearAll}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {comparedPlayers.map((player) => {
            const isDrafted = myTeamIds.has(player.Player_ID);

            return (
              <div
                key={player.Player_ID}
                className="relative flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950/80 p-3"
              >
                <button
                  onClick={() => onRemovePlayer(player.Player_ID)}
                  className="absolute right-2 top-2 rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                  title="Remove from comparison"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400">
                    <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-indigo-300">
                      {player.Pos}
                    </span>
                    <span>{player.Team}</span>
                    <span>•</span>
                    <span className="text-amber-400">Tier {player.Position_Tier}</span>
                  </div>

                  <h5 className="mt-1 font-serif text-sm font-bold text-neutral-100 truncate pr-6">
                    {player.Player_Name}
                  </h5>

                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Edge Score:</span>
                      <b className="font-mono text-emerald-400">{player.Championship_Edge_Score}</b>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Market Gap:</span>
                      <b className="font-mono text-indigo-300">+{player.Market_Gap} picks</b>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Season VORP:</span>
                      <b className="font-mono text-amber-300">+{player.VORP}</b>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Next Drop-off:</span>
                      <b className="font-mono text-rose-300">+{player.Dynamic_Dropoff || 0} PPG</b>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>'26 Proj PPG:</span>
                      <b className="font-mono text-white">{player.Proj_PPG_26} PPG</b>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>90% Ceiling:</span>
                      <b className="font-mono text-rose-400">{player.Ceiling_PPG_26 || '-'} PPG</b>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>'25 RZ Touches:</span>
                      <b className="font-mono text-neutral-200">{player.RZ_Touches_25}</b>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDraftPlayer(player)}
                  className={`mt-3 w-full rounded-lg py-1 text-xs font-bold transition-all ${
                    isDrafted
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {isDrafted ? 'Drafted' : 'Draft Player'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

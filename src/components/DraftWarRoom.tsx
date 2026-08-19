import React from 'react';
import { Player, Position } from '../types';
import { 
  Trophy, X, Trash2, ArrowRight, ShieldCheck, Sparkles, Plus, 
  RotateCcw, Users, CheckCircle2, TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DraftWarRoomProps {
  isOpen: boolean;
  onClose: () => void;
  myTeam: Player[];
  onRemovePlayer: (player: Player) => void;
  onClearDraft: () => void;
  availablePlayers: Player[];
  onDraftPlayer: (player: Player) => void;
}

export const DraftWarRoom: React.FC<DraftWarRoomProps> = ({
  isOpen,
  onClose,
  myTeam,
  onRemovePlayer,
  onClearDraft,
  availablePlayers,
  onDraftPlayer,
}) => {
  if (!isOpen) return null;

  // Organize Team into Starting Lineup
  const qbs = myTeam.filter((p) => p.Pos === 'QB');
  const rbs = myTeam.filter((p) => p.Pos === 'RB');
  const wrs = myTeam.filter((p) => p.Pos === 'WR');
  const tes = myTeam.filter((p) => p.Pos === 'TE');
  const ks = myTeam.filter((p) => p.Pos === 'K');
  const defs = myTeam.filter((p) => p.Pos === 'DEF');

  const startingQB = qbs[0];
  const startingRB1 = rbs[0];
  const startingRB2 = rbs[1];
  const startingWR1 = wrs[0];
  const startingWR2 = wrs[1];
  const startingTE = tes[0];
  const startingK = ks[0];
  const startingDEF = defs[0];

  // Flex slots (2 FLEX spots: next best available RBs, WRs, TEs)
  const starterIds = new Set([
    startingQB?.Player_ID,
    startingRB1?.Player_ID,
    startingRB2?.Player_ID,
    startingWR1?.Player_ID,
    startingWR2?.Player_ID,
    startingTE?.Player_ID,
    startingK?.Player_ID,
    startingDEF?.Player_ID,
  ].filter(Boolean));

  const flexCandidates = myTeam.filter(
    (p) => !starterIds.has(p.Player_ID) && ['RB', 'WR', 'TE'].includes(p.Pos)
  );
  const startingFlex1 = flexCandidates[0];
  if (startingFlex1) starterIds.add(startingFlex1.Player_ID);

  const startingFlex2 = flexCandidates[1];
  if (startingFlex2) starterIds.add(startingFlex2.Player_ID);

  const bench = myTeam.filter((p) => !starterIds.has(p.Player_ID));

  // Calculate Projected Starting PPG across all 10 starters
  const starters = [
    startingQB, startingRB1, startingRB2, startingWR1, startingWR2, startingTE, startingFlex1, startingFlex2, startingK, startingDEF
  ].filter(Boolean) as Player[];
  const totalStartersProjPPG = Number(
    starters.reduce((sum, p) => sum + (p.Proj_PPG_26 || 12), 0).toFixed(1)
  );
  const totalStartersCeiling = Number(
    starters.reduce((sum, p) => sum + (p.Ceiling_PPG_26 || (p.Proj_PPG_26 || 12) * 1.3), 0).toFixed(1)
  );

  // Championship Roster Grade (Calibrated for 10-Starters, 6-pt Pass TD, 0.5 PPR)
  let grade = 'B';
  let gradeColor = 'text-indigo-400';
  if (totalStartersProjPPG >= 135) {
    grade = 'A+ CHAMPION';
    gradeColor = 'text-emerald-400';
  } else if (totalStartersProjPPG >= 120) {
    grade = 'A CONTENDER';
    gradeColor = 'text-amber-400';
  } else if (totalStartersProjPPG >= 105) {
    grade = 'B+ PLAYOFF LOCK';
    gradeColor = 'text-indigo-300';
  } else if (totalStartersProjPPG >= 90) {
    grade = 'B SOLID CORE';
    gradeColor = 'text-neutral-300';
  } else {
    grade = 'C BUILDING';
    gradeColor = 'text-rose-400';
  }

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const renderSlot = (slotName: string, player: Player | undefined, badgeColor: string) => (
    <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/70 p-3">
      <div className="flex items-center gap-3">
        <span className={`flex h-7 w-12 items-center justify-center rounded-md font-bold text-xs ${badgeColor}`}>
          {slotName}
        </span>
        {player ? (
          <div>
            <h5 className="font-serif text-sm font-bold text-neutral-100">{player.Player_Name}</h5>
            <p className="text-[11px] text-neutral-400">
              {player.Team} • {player.Sleeper_Tag} • Tier {player.Position_Tier}
            </p>
          </div>
        ) : (
          <span className="text-xs italic text-neutral-500">Empty Slot</span>
        )}
      </div>

      {player ? (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="font-mono text-xs font-bold text-emerald-400">
              {player.Proj_PPG_26} PPG
            </span>
            <div className="text-[10px] text-neutral-500">+{player.VORP} VORP</div>
          </div>
          <button
            onClick={() => onRemovePlayer(player)}
            className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-rose-400 transition-colors"
            title="Drop player"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <span className="text-[11px] text-neutral-600">Pending pick</span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-neutral-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="h-full w-full max-w-2xl overflow-y-auto border-l border-neutral-800 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-indigo-500/30">
              <Trophy className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-neutral-100">Live Draft War Room</h3>
              <p className="text-xs text-neutral-400">12-Team • 0.5 PPR • 6-pt Pass TD • 2 FLEX (10 Starters, 5 Bench)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="my-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 text-center">
            <span className="text-[10px] font-semibold uppercase text-neutral-400">Starting Proj PPG</span>
            <div className="mt-1 font-mono text-xl font-extrabold text-emerald-400">
              {totalStartersProjPPG}
            </div>
            <span className="text-[10px] text-neutral-500">{starters.length}/10 Starters Locked</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 text-center">
            <span className="text-[10px] font-semibold uppercase text-neutral-400">Ceiling Potential</span>
            <div className="mt-1 font-mono text-xl font-extrabold text-amber-400">
              {totalStartersCeiling}
            </div>
            <span className="text-[10px] text-neutral-500">90th% Boom Week</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 text-center">
            <span className="text-[10px] font-semibold uppercase text-neutral-400">Roster Grade</span>
            <div className={`mt-1 font-mono text-base font-extrabold ${gradeColor}`}>
              {grade}
            </div>
            <span className="text-[10px] text-neutral-500">{myTeam.length}/15 Roster Spots</span>
          </div>
        </div>

        {/* Starting Lineup Slots */}
        <div className="space-y-2">
          <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-neutral-400">
            Starting Lineup (10 Starters)
          </h4>
          {renderSlot('QB', startingQB, 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30')}
          {renderSlot('RB1', startingRB1, 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30')}
          {renderSlot('RB2', startingRB2, 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30')}
          {renderSlot('WR1', startingWR1, 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30')}
          {renderSlot('WR2', startingWR2, 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30')}
          {renderSlot('TE', startingTE, 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30')}
          {renderSlot('FLEX1', startingFlex1, 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30')}
          {renderSlot('FLEX2', startingFlex2, 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30')}
          {renderSlot('K', startingK, 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30')}
          {renderSlot('DEF', startingDEF, 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30')}
        </div>

        {/* Bench Section */}
        <div className="mt-5 space-y-2">
          <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-neutral-400">
            Bench Depth ({bench.length}/5)
          </h4>
          {bench.length === 0 ? (
            <p className="text-xs italic text-neutral-500">No bench players drafted yet.</p>
          ) : (
            bench.map((player) => renderSlot('BENCH', player, 'bg-neutral-800 text-neutral-300'))
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-neutral-800 pt-4">
          <button
            onClick={() => {
              if (window.confirm('Clear all drafted players and restart draft?')) {
                onClearDraft();
              }
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Draft</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-100 px-4 py-1.5 text-xs font-bold text-neutral-950 hover:bg-white transition-all shadow-md"
          >
            Back to Draft Board
          </button>
        </div>
      </div>
    </div>
  );
};

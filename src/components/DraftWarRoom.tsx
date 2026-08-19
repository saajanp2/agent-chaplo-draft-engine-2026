import React from 'react';
import { 
  Trophy, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Trash2, 
  Shield, 
  Clock,
  UserCheck
} from 'lucide-react';
import { Player, TeamConfig, DraftPick, RosterSlots } from '../types';

interface DraftWarRoomProps {
  teams: TeamConfig[];
  picks: DraftPick[];
  activeTeamId: number; // 1 to 12
  currentPickNumber: number; // 1 to 180
  onRemovePick?: (overallPick: number) => void;
  onSelectPlayer: (player: Player) => void;
}

export const DraftWarRoom: React.FC<DraftWarRoomProps> = ({
  teams,
  picks,
  activeTeamId,
  currentPickNumber,
  onRemovePick,
  onSelectPlayer,
}) => {
  // Helper to construct roster for a team
  const getTeamRoster = (teamId: number): RosterSlots => {
    const teamPicks = picks.filter((p) => p.teamId === teamId);
    const players = teamPicks.map((p) => p.player);

    const qbs = players.filter((p) => p.Pos === 'QB');
    const rbs = players.filter((p) => p.Pos === 'RB');
    const wrs = players.filter((p) => p.Pos === 'WR');
    const tes = players.filter((p) => p.Pos === 'TE');
    const ks = players.filter((p) => p.Pos === 'K');
    const defs = players.filter((p) => p.Pos === 'DEF');

    const startingQB = qbs[0];
    const startingRB1 = rbs[0];
    const startingRB2 = rbs[1];
    const startingWR1 = wrs[0];
    const startingWR2 = wrs[1];
    const startingTE = tes[0];
    const startingK = ks[0];
    const startingDEF = defs[0];

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

    const flexCandidates = players.filter(
      (p) => !starterIds.has(p.Player_ID) && ['RB', 'WR', 'TE'].includes(p.Pos)
    );
    const startingFlex1 = flexCandidates[0];
    if (startingFlex1) starterIds.add(startingFlex1.Player_ID);

    const startingFlex2 = flexCandidates[1];
    if (startingFlex2) starterIds.add(startingFlex2.Player_ID);

    const bench = players.filter((p) => !starterIds.has(p.Player_ID));

    return {
      QB: startingQB,
      RB1: startingRB1,
      RB2: startingRB2,
      WR1: startingWR1,
      WR2: startingWR2,
      TE: startingTE,
      FLEX1: startingFlex1,
      FLEX2: startingFlex2,
      K: startingK,
      DEF: startingDEF,
      BENCH: bench,
    };
  };

  const renderSlot = (slotLabel: string, player: Player | undefined, badgeColor: string) => {
    return (
      <div className="flex items-center justify-between rounded-lg border border-neutral-800/80 bg-neutral-950/70 px-2 py-1.5 text-[11px] transition-all hover:border-neutral-700">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`flex h-5 w-8 items-center justify-center rounded font-mono text-[9px] font-extrabold ${badgeColor} shrink-0`}>
            {slotLabel}
          </span>
          {player ? (
            <span 
              onClick={() => onSelectPlayer(player)}
              className="font-serif font-bold text-neutral-200 hover:text-amber-400 cursor-pointer truncate"
            >
              {player.Player_Name}
            </span>
          ) : (
            <span className="italic text-neutral-600">Empty</span>
          )}
        </div>

        {player && (
          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            <span className="font-mono text-[10px] font-bold text-emerald-400">
              {player.W1_4_Proj_PPG}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* War Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-neutral-100">
              12-Team Live Draft War Room
            </h2>
            <p className="text-xs text-neutral-400">
              Brown Ballers Live Board • 15 Roster Slots (10 Starters + 5 Bench) • Real-Time Lineup Metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-300">
            Draft Progress: <strong className="text-amber-400">{picks.length} / 180 Picks</strong>
          </span>
        </div>
      </div>

      {/* 12-Team Responsive Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teams.map((team) => {
          const isOnClock = team.id === activeTeamId && picks.length < 180;
          const roster = getTeamRoster(team.id);
          const teamPicks = picks.filter((p) => p.teamId === team.id);
          
          const starters = [
            roster.QB, roster.RB1, roster.RB2, roster.WR1, roster.WR2, 
            roster.TE, roster.FLEX1, roster.FLEX2, roster.K, roster.DEF
          ].filter(Boolean) as Player[];

          const totalProjSeasonPts = teamPicks.reduce((sum, p) => sum + (p.player.Proj_Fantasy_Pts_2026 || 0), 0);
          const startersW14AvgPPG = starters.length > 0 
            ? Number((starters.reduce((sum, p) => sum + p.W1_4_Proj_PPG, 0)).toFixed(1))
            : 0;
          const netPOADPSurplus = Number(
            teamPicks.reduce((sum, p) => sum + p.player.POADP_Points_Over_ADP, 0).toFixed(1)
          );

          return (
            <div
              key={team.id}
              className={`flex flex-col rounded-2xl border p-4 transition-all shadow-xl backdrop-blur-xl ${
                isOnClock
                  ? 'border-amber-500 bg-gradient-to-b from-amber-950/40 via-neutral-900/90 to-neutral-950 ring-2 ring-amber-500/50 shadow-amber-500/10'
                  : team.isUser
                  ? 'border-indigo-500/50 bg-indigo-950/20'
                  : 'border-neutral-800 bg-neutral-900/70 hover:border-neutral-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-800 font-mono text-[11px] font-bold text-neutral-300 shrink-0">
                    #{team.slot}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-serif text-sm font-bold text-neutral-100 truncate">
                      {team.name}
                    </h4>
                    <span className="text-[10px] text-neutral-400 block truncate">
                      {team.archetype}
                    </span>
                  </div>
                </div>

                {isOnClock ? (
                  <span className="flex items-center gap-1 rounded bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-neutral-950 animate-pulse shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>ON CLOCK</span>
                  </span>
                ) : team.isUser ? (
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-500/30 shrink-0">
                    ★ MY TEAM
                  </span>
                ) : null}
              </div>

              {/* Real-time Team Metrics Summary Bar */}
              <div className="my-2.5 grid grid-cols-3 gap-1 rounded-xl bg-neutral-950/80 p-2 text-center text-[10px]">
                <div>
                  <span className="text-neutral-500 block uppercase font-medium">W1–4 PPG</span>
                  <strong className="font-mono text-emerald-400 text-xs">{startersW14AvgPPG}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase font-medium">Season Pts</span>
                  <strong className="font-mono text-neutral-200 text-xs">{Math.round(totalProjSeasonPts)}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase font-medium">POADP</span>
                  <strong className={`font-mono text-xs ${netPOADPSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {netPOADPSurplus > 0 ? `+${netPOADPSurplus}` : netPOADPSurplus}
                  </strong>
                </div>
              </div>

              {/* Roster Slots List */}
              <div className="space-y-1.5 flex-1">
                {renderSlot('QB', roster.QB, 'bg-purple-500/20 text-purple-300')}
                {renderSlot('RB1', roster.RB1, 'bg-blue-500/20 text-blue-300')}
                {renderSlot('RB2', roster.RB2, 'bg-blue-500/20 text-blue-300')}
                {renderSlot('WR1', roster.WR1, 'bg-amber-500/20 text-amber-300')}
                {renderSlot('WR2', roster.WR2, 'bg-amber-500/20 text-amber-300')}
                {renderSlot('TE', roster.TE, 'bg-emerald-500/20 text-emerald-300')}
                {renderSlot('FLEX1', roster.FLEX1, 'bg-indigo-500/20 text-indigo-300')}
                {renderSlot('FLEX2', roster.FLEX2, 'bg-indigo-500/20 text-indigo-300')}
                {renderSlot('K', roster.K, 'bg-teal-500/20 text-teal-300')}
                {renderSlot('DEF', roster.DEF, 'bg-rose-500/20 text-rose-300')}

                {/* Bench Slots */}
                <div className="pt-2 border-t border-neutral-800/80 space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 block px-1">
                    Bench ({roster.BENCH.length}/5)
                  </span>
                  {[0, 1, 2, 3, 4].map((bIdx) => (
                    <React.Fragment key={bIdx}>
                      {renderSlot(`BN${bIdx + 1}`, roster.BENCH[bIdx], 'bg-neutral-800 text-neutral-400')}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  Layers, 
  ShieldAlert, 
  Flame, 
  Filter,
  UserCheck,
  BarChart2,
  Award,
  Target,
  ChevronRight
} from 'lucide-react';
import { Player, TeamConfig, LookaheadPrediction, H2HRule, Position, DraftPick } from '../types';
import { h2hRules } from '../data';
import { analyzeTeamPpg, calculateMarginalPpgLift, analyzeAllTeamsPpg } from '../utils/teamAnalytics';

interface AIForesightHubProps {
  availablePlayers: Player[];
  myTeam: Player[];
  activeTeam: TeamConfig;
  allTeams?: TeamConfig[];
  allPicks?: DraftPick[];
  currentPickNumber: number; // 1 to 180
  currentRound: number; // 1 to 15
  lookaheadPredictions: LookaheadPrediction[];
  onDraftPlayer: (player: Player) => void;
  onSelectPlayer: (player: Player) => void;
}

export const AIForesightHub: React.FC<AIForesightHubProps> = ({
  availablePlayers,
  myTeam,
  activeTeam,
  allTeams = [],
  allPicks = [],
  currentPickNumber,
  currentRound,
  lookaheadPredictions,
  onDraftPlayer,
  onSelectPlayer,
}) => {
  const [selectedH2HCategory, setSelectedH2HCategory] = useState<string>('ALL');
  const [h2hSearch, setH2HSearch] = useState<string>('');

  // Top recommendations for the team on the clock
  const topBPA = availablePlayers?.[0];
  const topPOADP = availablePlayers && availablePlayers.length > 0 
    ? [...availablePlayers].sort((a, b) => (b.POADP_Points_Over_ADP || 0) - (a.POADP_Points_Over_ADP || 0))[0] 
    : undefined;
  const topCliff = availablePlayers && availablePlayers.length > 0 
    ? [...availablePlayers].sort((a, b) => (b.Dynamic_Dropoff || 0) - (a.Dynamic_Dropoff || 0))[0] 
    : undefined;

  // Priority Pick (Green Light)
  const priorityPick = topBPA;

  // Contingency Pivot (Yellow Light)
  const contingencyPick = availablePlayers && availablePlayers.length > 1
    ? (availablePlayers.find((p) => p.Pos !== priorityPick?.Pos) || topPOADP || availablePlayers[1])
    : undefined;

  // Whole-Team Projected PPG Analysis for the active drafting team
  const activeTeamAnalysis = useMemo(() => {
    return analyzeTeamPpg(activeTeam, allPicks);
  }, [activeTeam, allPicks]);

  // League-wide Team PPG Analyses
  const allTeamsAnalysis = useMemo(() => {
    if (allTeams.length === 0) return [];
    return analyzeAllTeamsPpg(allTeams, allPicks);
  }, [allTeams, allPicks]);

  // Calculate Late-Round Marginal Team PPG Value Picks
  const lateRoundValuePicks = useMemo(() => {
    return availablePlayers
      .map((player) => {
        const lift = calculateMarginalPpgLift(player, activeTeam, allPicks);
        return {
          player,
          lift,
        };
      })
      .sort((a, b) => {
        if (b.lift.marginalPpgGain !== a.lift.marginalPpgGain) {
          return b.lift.marginalPpgGain - a.lift.marginalPpgGain;
        }
        return (b.player.Proj_PPG_26 || 0) - (a.player.Proj_PPG_26 || 0);
      })
      .slice(0, 4);
  }, [availablePlayers, activeTeam, allPicks]);

  // Contextual Round Trigger Message (Tailored for Pick #7 Turn Dynamics)
  let roundTrigger = "Round 1 (Pick 7): Target foundational alpha anchor (Tier 1 RB bellcow like Breece/Saquon/Bijan or 30%+ target share WR1 like JJ/CeeDee).";
  if (currentRound === 2) {
    roundTrigger = "Round 2 (Pick 18 = 2.06): Prime window for Brock Bowers (TE Cheat Code), Elite Konami QB (Lamar/Josh Allen), or Alpha WR (Malik Nabers/Rome Odunze).";
  } else if (currentRound === 3) {
    roundTrigger = "Round 3 (Pick 31 = 3.07): Lock in RB2 bellcow (Ashton Jeanty / James Cook / Kenneth Walker) or elite TE (Sam LaPorta / Trey McBride).";
  } else if (currentRound === 4) {
    roundTrigger = "Round 4 (Pick 42 = 4.06): 2-FLEX starter window. Target high-aDOT receivers (Ladd McConkey / Travis Hunter / Tee Higgins) or Patrick Mahomes.";
  } else if (currentRound >= 5 && currentRound <= 7) {
    roundTrigger = "Rounds 5–7: Fill your 2-FLEX lineup with 120+ target WRs and goal-line RBs before the tier cliff.";
  } else if (currentRound >= 8 && currentRound <= 11) {
    roundTrigger = "Rounds 8–11: Exploit market ADP gaps (+10 surplus). Target upside rookie acclimation ramps and high-EPA pass catchers.";
  } else if (currentRound >= 12 && currentRound <= 13) {
    roundTrigger = "Rounds 12–13: Pure 90th percentile boom ceiling. Target backup handcuffs with league-winning contingent value.";
  } else if (currentRound >= 14) {
    roundTrigger = "Rounds 14–15: Target Dome Kickers (Fairbairn, Dicker) and high pressure rate Defenses (SF, BAL, PIT).";
  }

  // Filter H2H rules
  const filteredH2HRules = h2hRules.filter((rule) => {
    const matchesCategory = selectedH2HCategory === 'ALL' || rule.category === selectedH2HCategory;
    const matchesSearch = 
      rule.title.toLowerCase().includes(h2hSearch.toLowerCase()) ||
      rule.winner.toLowerCase().includes(h2hSearch.toLowerCase()) ||
      rule.reasoning.toLowerCase().includes(h2hSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['ALL', 'RB', 'WR', 'TE', 'QB', 'FLEX', 'DRAFT_SLOT'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Live Pick Advisor (Active Team On The Clock) */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-neutral-100">
                  Live Pick Advisor
                </h3>
                <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-xs font-semibold text-neutral-300">
                  Pick #{currentPickNumber} • Round {currentRound}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Optimized recommendation for <strong className="text-amber-400">{activeTeam.name}</strong> ({activeTeam.archetype})
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-1.5 text-xs text-amber-300">
            <span>💡 {roundTrigger}</span>
          </div>
        </div>

        {/* Advisor Cards Grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Priority Pick (Green Light) */}
          {priorityPick && (
            <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 transition-all hover:border-emerald-500/60">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>🟢 Priority Pick (Green Light)</span>
                </div>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                  Rank #{priorityPick.Offline_Draft_Rank} • {priorityPick.Pos}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 pt-1">
                <div>
                  <h4 className="font-serif text-lg font-bold text-white hover:text-emerald-300 cursor-pointer" onClick={() => onSelectPlayer(priorityPick)}>
                    {priorityPick.Player_Name}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {priorityPick.Team} • {priorityPick.Sleeper_Tag} • Tier {priorityPick.Position_Tier}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {priorityPick.W1_4_Proj_PPG} PPG
                  </span>
                  <div className="text-[10px] text-neutral-400">W1-4 Proj</div>
                </div>
              </div>

              <div className="mt-2.5 space-y-1 rounded-lg bg-neutral-950/60 p-2 text-xs text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-400">POADP Surplus:</span>
                  <strong className={priorityPick.POADP_Points_Over_ADP >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {priorityPick.POADP_Points_Over_ADP >= 0 ? `+${priorityPick.POADP_Points_Over_ADP}` : priorityPick.POADP_Points_Over_ADP} spots
                  </strong>
                </div>
                <div className="text-[11px] text-neutral-400 italic">
                  "{priorityPick.Dos_And_Donts}"
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => onSelectPlayer(priorityPick)}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  View Intel
                </button>
                <button
                  onClick={() => onDraftPlayer(priorityPick)}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                >
                  <span>Draft Player</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Contingency Pivot (Yellow Light) */}
          {contingencyPick && (
            <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 transition-all hover:border-amber-500/60">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span>🟡 Contingency Pivot (Yellow Light)</span>
                </div>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                  Rank #{contingencyPick.Offline_Draft_Rank} • {contingencyPick.Pos}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 pt-1">
                <div>
                  <h4 className="font-serif text-lg font-bold text-white hover:text-amber-300 cursor-pointer" onClick={() => onSelectPlayer(contingencyPick)}>
                    {contingencyPick.Player_Name}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {contingencyPick.Team} • {contingencyPick.Sleeper_Tag} • Tier {contingencyPick.Position_Tier}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-amber-400">
                    {contingencyPick.W1_4_Proj_PPG} PPG
                  </span>
                  <div className="text-[10px] text-neutral-400">W1-4 Proj</div>
                </div>
              </div>

              <div className="mt-2.5 space-y-1 rounded-lg bg-neutral-950/60 p-2 text-xs text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Weekly Opportunity:</span>
                  <span className="text-neutral-200">{contingencyPick.Primary_Weekly_Opportunity}</span>
                </div>
                <div className="text-[11px] text-neutral-400 italic">
                  "{contingencyPick.Dos_And_Donts}"
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => onSelectPlayer(contingencyPick)}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  View Intel
                </button>
                <button
                  onClick={() => onDraftPlayer(contingencyPick)}
                  className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-500 shadow-md shadow-amber-600/20"
                >
                  <span>Draft Player</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Whole-Team Projected PPG Analyzer & Late-Round Value Maximizer */}
      <section className="rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-neutral-900 via-neutral-900 to-indigo-950/40 p-5 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-neutral-100">
                  Whole-Team Projected Points (PPG) Engine & Late-Round Maximizer
                </h3>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-300">
                  10 STARTERS + 5 BENCH
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Calculates starting lineup scoring trajectory and identifies highest marginal PPG upgrade candidates for late rounds
              </p>
            </div>
          </div>

          {/* Active Team PPG Score Badge */}
          <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-xl border border-indigo-500/30">
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase font-medium">Starting 10 Projected</span>
              <strong className="font-mono text-emerald-400 text-sm font-black">
                {activeTeamAnalysis.startingPpg} PPG
              </strong>
            </div>
            <span className="text-neutral-600">|</span>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block uppercase font-medium">Starters Filled</span>
              <span className="font-mono text-indigo-300 text-xs font-bold">
                {activeTeamAnalysis.filledStartersCount}/10
              </span>
            </div>
          </div>
        </div>

        {/* Positional PPG Room Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase text-purple-400 block">QB Room</span>
            <strong className="font-mono text-sm text-purple-200">{activeTeamAnalysis.positionalPpg.QB} PPG</strong>
          </div>
          <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase text-blue-400 block">RB Room (RB1+RB2)</span>
            <strong className="font-mono text-sm text-blue-200">{activeTeamAnalysis.positionalPpg.RB} PPG</strong>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase text-amber-400 block">WR Room (WR1+WR2)</span>
            <strong className="font-mono text-sm text-amber-200">{activeTeamAnalysis.positionalPpg.WR} PPG</strong>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-400 block">TE Room</span>
            <strong className="font-mono text-sm text-emerald-200">{activeTeamAnalysis.positionalPpg.TE} PPG</strong>
          </div>
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase text-indigo-400 block">2-FLEX Room</span>
            <strong className="font-mono text-sm text-indigo-200">{activeTeamAnalysis.positionalPpg.FLEX} PPG</strong>
          </div>
          <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase text-teal-400 block">K + DEF Room</span>
            <strong className="font-mono text-sm text-teal-200">
              {(activeTeamAnalysis.positionalPpg.K + activeTeamAnalysis.positionalPpg.DEF).toFixed(1)} PPG
            </strong>
          </div>
        </div>

        {/* Highest Marginal Team PPG Upgrade Candidates for Current Pick */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-emerald-400" />
              <h4 className="font-serif text-sm font-bold text-white">
                Top Marginal PPG Upgrade Candidates for {activeTeam.name}
              </h4>
            </div>
            {activeTeamAnalysis.weakestSlot && (
              <span className="text-[11px] text-amber-400">
                Priority Need: <strong>{activeTeamAnalysis.weakestSlot.slot}</strong> ({activeTeamAnalysis.weakestSlot.ppg > 0 ? `${activeTeamAnalysis.weakestSlot.ppg} PPG` : 'Empty'})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {lateRoundValuePicks.map(({ player, lift }) => (
              <div
                key={player.Player_ID}
                className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950/80 p-3 hover:border-emerald-500/50 transition-all space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-400 font-bold">#{player.Offline_Draft_Rank}</span>
                    <span className="rounded bg-neutral-800 px-1.5 py-0.2 font-mono text-[10px] text-neutral-300 font-bold">
                      {player.Pos}
                    </span>
                  </div>
                  <h5 
                    onClick={() => onSelectPlayer(player)}
                    className="font-serif text-sm font-bold text-white hover:text-emerald-400 cursor-pointer truncate mt-1"
                  >
                    {player.Player_Name}
                  </h5>
                  <p className="text-[10px] text-neutral-400">{player.Team} • Tier {player.Position_Tier}</p>
                </div>

                <div className="space-y-1.5 border-t border-neutral-800/80 pt-2 text-xs">
                  {lift.marginalPpgGain > 0 ? (
                    <div className="rounded bg-emerald-500/20 text-emerald-300 font-bold px-2 py-1 border border-emerald-500/30 text-center font-mono">
                      +{lift.marginalPpgGain} PPG to {lift.targetSlot}
                    </div>
                  ) : (
                    <div className="rounded bg-indigo-500/20 text-indigo-300 font-medium px-2 py-1 text-center font-mono text-[11px]">
                      Bench Ceiling: {player.Ceiling_PPG_26 || 16} PPG
                    </div>
                  )}
                  <p className="text-[10px] text-neutral-400 italic line-clamp-2">
                    "{lift.description}"
                  </p>
                </div>

                <button
                  onClick={() => onDraftPlayer(player)}
                  className="w-full flex items-center justify-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 py-1.5 text-xs font-bold text-white shadow"
                >
                  <span>Draft (+{lift.marginalPpgGain > 0 ? lift.marginalPpgGain : player.Proj_PPG_26} PPG)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. N+3 Multi-Step Lookahead Forecast */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-neutral-100">
              N+3 Multi-Step Draft Lookahead Forecast
            </h3>
            <p className="text-xs text-neutral-400">
              Predictive simulation forecasting picks between now and your next turn at Pick #18 (2.06 turn)
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {lookaheadPredictions.map((pred) => {
            const player = pred.predictedPlayer;
            const playerName = typeof player === 'string' ? player : player?.Player_Name || 'Unknown Player';
            const playerPos = typeof player === 'string' ? 'FLEX' : player?.Pos || 'FLEX';
            const playerTier = typeof player === 'string' ? 1 : player?.Position_Tier || 1;
            const playerPpg = typeof player === 'string' ? '' : player?.W1_4_Proj_PPG ? ` (${player.W1_4_Proj_PPG} PPG)` : '';

            return (
              <div
                key={pred.pickNumber}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3.5 transition-all hover:border-neutral-700"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 font-mono text-xs font-bold text-neutral-300">
                    #{pred.pickNumber}
                  </span>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-neutral-200">
                      {pred.teamName}
                    </h4>
                    <span className="text-xs text-neutral-400">
                      Archetype: {pred.archetype}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs font-semibold text-neutral-300">
                        Likely Target: <strong className="text-amber-400">{playerPos}</strong>
                      </span>
                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-300">
                        Tier {playerTier}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 block font-serif font-bold">
                      Expected: {playerName}{playerPpg}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Golden Head-to-Head Cross-Reference Decision Matrix */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-neutral-100">
                Golden Head-to-Head Cross-Reference Matrix
              </h3>
              <p className="text-xs text-neutral-400">
                Essential comparative decision rules to eliminate draft traps and maximize starting capital
              </p>
            </div>
          </div>

          {/* Search & Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search H2H rules..."
              value={h2hSearch}
              onChange={(e) => setH2HSearch(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-2.5 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedH2HCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                selectedH2HCategory === cat
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Rules Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredH2HRules.map((rule) => (
            <div 
              key={rule.id}
              className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 space-y-2.5 hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-amber-500/25">
                  {rule.category}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">
                  RULE #{rule.id.replace('h2h-', '')}
                </span>
              </div>

              <h4 className="font-serif text-sm font-bold text-neutral-100">
                {rule.title}
              </h4>

              <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Verdict:</span>
                <strong className="text-white">{rule.verdict}</strong>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                {rule.reasoning}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

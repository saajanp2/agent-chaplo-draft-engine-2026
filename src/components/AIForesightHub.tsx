import React, { useState } from 'react';
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
  UserCheck
} from 'lucide-react';
import { Player, TeamConfig, LookaheadPrediction, H2HRule, Position } from '../types';
import { h2hRules } from '../data';

interface AIForesightHubProps {
  availablePlayers: Player[];
  myTeam: Player[];
  activeTeam: TeamConfig;
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
  currentPickNumber,
  currentRound,
  lookaheadPredictions,
  onDraftPlayer,
  onSelectPlayer,
}) => {
  const [selectedH2HCategory, setSelectedH2HCategory] = useState<string>('ALL');
  const [h2hSearch, setH2HSearch] = useState<string>('');

  // Top recommendations for the team on the clock
  const topBPA = availablePlayers[0];
  const topPOADP = [...availablePlayers].sort((a, b) => b.POADP_Points_Over_ADP - a.POADP_Points_Over_ADP)[0];
  const topCliff = [...availablePlayers].sort((a, b) => (b.Dynamic_Dropoff || 0) - (a.Dynamic_Dropoff || 0))[0];

  // Priority Pick (Green Light)
  const priorityPick = topBPA;

  // Contingency Pivot (Yellow Light)
  // Find top alternative player from a different position or top surplus
  const contingencyPick = availablePlayers.find((p) => p.Pos !== priorityPick?.Pos) || topPOADP || availablePlayers[1];

  // Contextual Round Trigger Message
  let roundTrigger = "Round 1: Target foundational alpha anchor (Tier 1 RB bellcow or 30%+ target share WR1).";
  if (currentRound === 2) {
    roundTrigger = "Round 2: If CeeDee, JJ, or Brock Bowers fall, prioritize over mid-tier WR2s to establish massive positional advantage.";
  } else if (currentRound === 3) {
    roundTrigger = "Round 3: Peak window for Elite 6-pt Pass TD QBs (Josh Allen / Lamar / Jayden Daniels) or locking in high-volume RB2.";
  } else if (currentRound >= 4 && currentRound <= 7) {
    roundTrigger = "Rounds 4–7: 2-FLEX Core Starters Window. Fill starting slots with 120+ target WRs & goal-line RBs before the tier cliff.";
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

  const categories = ['ALL', 'Elite WR', 'TE Cheat Code', 'Dead Zone RB', 'Konami QB', 'Flex Target', 'Kicker & DEF'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* SECTION 1: Live Pick Advisor Card */}
      <section className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-neutral-900/80 to-neutral-950/90 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40 shadow-inner">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-100">
                  Live Pick Advisor
                </h3>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-500/30">
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
                  <span>Draft Pivot</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: Projected Next 3 Picks (Expert Lookahead Engine) */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-neutral-100">
                Projected Next 3 Picks (Expert Lookahead Engine)
              </h3>
              <p className="text-xs text-neutral-400">
                Forecasts upcoming draft board trajectory using manager archetypes & BPA/POADP surplus models
              </p>
            </div>
          </div>
          <span className="rounded bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-300 ring-1 ring-purple-500/30">
            N+3 FORECAST
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {lookaheadPredictions.map((pred, idx) => (
            <div 
              key={idx}
              className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/70 p-3.5 transition-all hover:border-purple-500/40 hover:bg-neutral-900/60"
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
                <span className="font-mono text-xs font-extrabold text-purple-400">
                  Pick #{pred.pickNumber} (Rd {pred.round}.{pred.pickInRound})
                </span>
                <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300">
                  {pred.teamName}
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between">
                <div>
                  <h5 className="font-serif text-sm font-bold text-neutral-100">{pred.predictedPlayer.Player_Name}</h5>
                  <p className="text-[11px] text-neutral-400">
                    {pred.predictedPlayer.Pos} • {pred.predictedPlayer.Team}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {pred.predictedPlayer.W1_4_Proj_PPG} PPG
                </span>
              </div>

              <div className="mt-2 text-[11px] text-neutral-400 leading-relaxed bg-neutral-900/60 rounded-lg p-2 border border-neutral-800/50">
                <span className="text-neutral-500 font-semibold uppercase text-[9px] block">Forecast Rationale</span>
                {pred.reasoning}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: Golden Head-to-Head Cross-Reference Matrix */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
              <Zap className="h-4.5 w-4.5" />
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

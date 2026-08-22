import { Player, DraftPick, RosterSlots, TeamConfig } from '../types';

export interface PositionalPpgBreakdown {
  QB: number;
  RB: number;
  WR: number;
  TE: number;
  K: number;
  DEF: number;
  FLEX: number;
}

export interface TeamPpgAnalysis {
  teamId: number;
  teamName: string;
  slot: number;
  isUser: boolean;
  totalSeasonPts: number;
  startingPpg: number;
  w14StartingPpg: number;
  benchCount: number;
  benchCeilingPpg: number;
  filledStartersCount: number;
  positionalPpg: PositionalPpgBreakdown;
  weakestSlot: { slot: string; ppg: number; player?: Player } | null;
  rankInLeague: number;
}

export interface MarginalPpgImpact {
  player: Player;
  marginalPpgGain: number; // e.g. +3.5 PPG
  targetSlot: string; // e.g. "FLEX2", "RB2", "BENCH"
  replacesPlayer?: Player;
  impactType: 'STARTER_FILL' | 'STARTER_UPGRADE' | 'BENCH_UPSIDE';
  description: string;
}

/**
 * Constructs the optimal starting roster (10 starters + 5 bench) for a team.
 */
export function getTeamRosterSlots(teamPicks: DraftPick[]): RosterSlots {
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
}

/**
 * Calculates comprehensive Whole-Team Projected PPG and Positional metrics.
 */
export function analyzeTeamPpg(team: TeamConfig, allPicks: DraftPick[]): TeamPpgAnalysis {
  const teamPicks = allPicks.filter((p) => p.teamId === team.id);
  const roster = getTeamRosterSlots(teamPicks);

  const starterList = [
    { slot: 'QB', player: roster.QB },
    { slot: 'RB1', player: roster.RB1 },
    { slot: 'RB2', player: roster.RB2 },
    { slot: 'WR1', player: roster.WR1 },
    { slot: 'WR2', player: roster.WR2 },
    { slot: 'TE', player: roster.TE },
    { slot: 'FLEX1', player: roster.FLEX1 },
    { slot: 'FLEX2', player: roster.FLEX2 },
    { slot: 'K', player: roster.K },
    { slot: 'DEF', player: roster.DEF },
  ];

  const filledStarters = starterList.filter((s) => s.player !== undefined);

  const startingPpg = Number(
    filledStarters.reduce((sum, s) => sum + (s.player?.Proj_PPG_26 || s.player?.W1_4_Proj_PPG || 0), 0).toFixed(1)
  );

  const w14StartingPpg = Number(
    filledStarters.reduce((sum, s) => sum + (s.player?.W1_4_Proj_PPG || 0), 0).toFixed(1)
  );

  const totalSeasonPts = Math.round(
    teamPicks.reduce((sum, p) => sum + (p.player.Proj_Fantasy_Pts_2026 || 0), 0)
  );

  const positionalPpg: PositionalPpgBreakdown = {
    QB: roster.QB ? (roster.QB.Proj_PPG_26 || roster.QB.W1_4_Proj_PPG || 0) : 0,
    RB: Number(((roster.RB1?.Proj_PPG_26 || 0) + (roster.RB2?.Proj_PPG_26 || 0)).toFixed(1)),
    WR: Number(((roster.WR1?.Proj_PPG_26 || 0) + (roster.WR2?.Proj_PPG_26 || 0)).toFixed(1)),
    TE: roster.TE ? (roster.TE.Proj_PPG_26 || roster.TE.W1_4_Proj_PPG || 0) : 0,
    K: roster.K ? (roster.K.Proj_PPG_26 || roster.K.W1_4_Proj_PPG || 0) : 0,
    DEF: roster.DEF ? (roster.DEF.Proj_PPG_26 || roster.DEF.W1_4_Proj_PPG || 0) : 0,
    FLEX: Number(((roster.FLEX1?.Proj_PPG_26 || 0) + (roster.FLEX2?.Proj_PPG_26 || 0)).toFixed(1)),
  };

  const benchCeilingPpg = Number(
    roster.BENCH.reduce((sum, p) => sum + (p.Ceiling_PPG_26 || p.Proj_PPG_26 || 12), 0).toFixed(1)
  );

  // Find lowest scoring filled starter or first empty starter slot
  let weakestSlot: { slot: string; ppg: number; player?: Player } | null = null;
  const emptyStarter = starterList.find((s) => s.player === undefined);
  if (emptyStarter) {
    weakestSlot = { slot: emptyStarter.slot, ppg: 0 };
  } else if (filledStarters.length > 0) {
    const sorted = [...filledStarters].sort((a, b) => (a.player?.Proj_PPG_26 || 0) - (b.player?.Proj_PPG_26 || 0));
    weakestSlot = {
      slot: sorted[0].slot,
      ppg: sorted[0].player?.Proj_PPG_26 || 0,
      player: sorted[0].player,
    };
  }

  return {
    teamId: team.id,
    teamName: team.name,
    slot: team.slot,
    isUser: team.isUser,
    totalSeasonPts,
    startingPpg,
    w14StartingPpg,
    benchCount: roster.BENCH.length,
    benchCeilingPpg,
    filledStartersCount: filledStarters.length,
    positionalPpg,
    weakestSlot,
    rankInLeague: 1, // Will be populated after sorting all teams
  };
}

/**
 * Calculates league-wide PPG rankings for all 12 teams.
 */
export function analyzeAllTeamsPpg(teams: TeamConfig[], allPicks: DraftPick[]): TeamPpgAnalysis[] {
  const analyses = teams.map((team) => analyzeTeamPpg(team, allPicks));
  // Sort by starting PPG descending
  analyses.sort((a, b) => b.startingPpg - a.startingPpg);
  analyses.forEach((analysis, idx) => {
    analysis.rankInLeague = idx + 1;
  });
  return analyses;
}

/**
 * Computes the Marginal Team PPG Lift of drafting a specific player for a team.
 * Vital for late round value optimization (Rounds 6-15)!
 */
export function calculateMarginalPpgLift(
  candidatePlayer: Player,
  team: TeamConfig,
  currentPicks: DraftPick[]
): MarginalPpgImpact {
  const currentAnalysis = analyzeTeamPpg(team, currentPicks);
  const teamPicks = currentPicks.filter((p) => p.teamId === team.id);
  const currentRoster = getTeamRosterSlots(teamPicks);

  const candidatePpg = candidatePlayer.Proj_PPG_26 || candidatePlayer.W1_4_Proj_PPG || 10.0;

  // Case 1: Empty primary position slot (e.g. QB, RB1/RB2, WR1/WR2, TE, K, DEF)
  if (candidatePlayer.Pos === 'QB' && !currentRoster.QB) {
    return {
      player: candidatePlayer,
      marginalPpgGain: candidatePpg,
      targetSlot: 'QB',
      impactType: 'STARTER_FILL',
      description: `Fills empty QB slot with +${candidatePpg} PPG engine.`,
    };
  }
  if (candidatePlayer.Pos === 'RB' && (!currentRoster.RB1 || !currentRoster.RB2)) {
    const slot = !currentRoster.RB1 ? 'RB1' : 'RB2';
    return {
      player: candidatePlayer,
      marginalPpgGain: candidatePpg,
      targetSlot: slot,
      impactType: 'STARTER_FILL',
      description: `Fills starting ${slot} with +${candidatePpg} PPG volume.`,
    };
  }
  if (candidatePlayer.Pos === 'WR' && (!currentRoster.WR1 || !currentRoster.WR2)) {
    const slot = !currentRoster.WR1 ? 'WR1' : 'WR2';
    return {
      player: candidatePlayer,
      marginalPpgGain: candidatePpg,
      targetSlot: slot,
      impactType: 'STARTER_FILL',
      description: `Fills starting ${slot} with +${candidatePpg} PPG target volume.`,
    };
  }
  if (candidatePlayer.Pos === 'TE' && !currentRoster.TE) {
    return {
      player: candidatePlayer,
      marginalPpgGain: candidatePpg,
      targetSlot: 'TE',
      impactType: 'STARTER_FILL',
      description: `Fills empty TE slot with +${candidatePpg} PPG advantage.`,
    };
  }
  if (candidatePlayer.Pos === 'K' && !currentRoster.K) {
    return {
      player: candidatePlayer,
      marginalPpgGain: candidatePpg,
      targetSlot: 'K',
      impactType: 'STARTER_FILL',
      description: `Fills starting K slot (+${candidatePpg} PPG).`,
    };
  }
  if (candidatePlayer.Pos === 'DEF' && !currentRoster.DEF) {
    return {
      player: candidatePlayer,
      marginalPpgGain: candidatePpg,
      targetSlot: 'DEF',
      impactType: 'STARTER_FILL',
      description: `Fills starting DEF slot (+${candidatePpg} PPG).`,
    };
  }

  // Case 2: FLEX slots (FLEX1 or FLEX2 empty)
  if (['RB', 'WR', 'TE'].includes(candidatePlayer.Pos)) {
    if (!currentRoster.FLEX1) {
      return {
        player: candidatePlayer,
        marginalPpgGain: candidatePpg,
        targetSlot: 'FLEX1',
        impactType: 'STARTER_FILL',
        description: `Fills FLEX1 starter slot with +${candidatePpg} PPG.`,
      };
    }
    if (!currentRoster.FLEX2) {
      return {
        player: candidatePlayer,
        marginalPpgGain: candidatePpg,
        targetSlot: 'FLEX2',
        impactType: 'STARTER_FILL',
        description: `Fills FLEX2 starter slot with +${candidatePpg} PPG.`,
      };
    }

    // Case 3: Upgrading the lowest scoring FLEX starter
    const flex1Ppg = currentRoster.FLEX1.Proj_PPG_26 || currentRoster.FLEX1.W1_4_Proj_PPG || 0;
    const flex2Ppg = currentRoster.FLEX2.Proj_PPG_26 || currentRoster.FLEX2.W1_4_Proj_PPG || 0;
    const minFlexPpg = Math.min(flex1Ppg, flex2Ppg);
    const minFlexSlot = flex1Ppg <= flex2Ppg ? 'FLEX1' : 'FLEX2';
    const minFlexPlayer = flex1Ppg <= flex2Ppg ? currentRoster.FLEX1 : currentRoster.FLEX2;

    if (candidatePpg > minFlexPpg) {
      const delta = Number((candidatePpg - minFlexPpg).toFixed(1));
      return {
        player: candidatePlayer,
        marginalPpgGain: delta,
        targetSlot: minFlexSlot,
        replacesPlayer: minFlexPlayer,
        impactType: 'STARTER_UPGRADE',
        description: `Upgrades ${minFlexSlot} (${minFlexPlayer.Player_Name}) by +${delta} PPG!`,
      };
    }
  }

  // Case 4: High-Upside Bench Handcuff / Contingency Depth
  const benchCeiling = candidatePlayer.Ceiling_PPG_26 || candidatePpg + 4.0;
  return {
    player: candidatePlayer,
    marginalPpgGain: 0,
    targetSlot: 'BENCH',
    impactType: 'BENCH_UPSIDE',
    description: `Bench Depth: 90th% Boom Ceiling of ${benchCeiling} PPG contingency.`,
  };
}

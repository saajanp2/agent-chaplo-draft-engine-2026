const fs = require('fs');
const path = require('path');

// Import full player list from generate_full_dataset
const fullDatasetPath = path.join(__dirname, 'generate_full_dataset.cjs');
const fullContent = fs.readFileSync(fullDatasetPath, 'utf8');

// Extract skillPlayers, kickerOptions, defenseOptions
const skillMatch = fullContent.match(/const skillPlayers = (\[[\s\S]*?\]);\s*\/\/ Appended Kickers/);
const kickerMatch = fullContent.match(/const kickerOptions = (\[[\s\S]*?\]);\s*\/\/ Appended Defenses/);
const defenseMatch = fullContent.match(/const defenseOptions = (\[[\s\S]*?\]);\s*const allPlayers/);

if (!skillMatch || !kickerMatch || !defenseMatch) {
  console.error("Could not parse arrays from generate_full_dataset.cjs");
  process.exit(1);
}

const skillPlayers = eval(skillMatch[1]);
const kickerOptions = eval(kickerMatch[1]);
const defenseOptions = eval(defenseMatch[1]);

// Merge and take top 208 players (176 skill + 16 K + 16 DEF = 208 total)
const allCombined = [...skillPlayers.slice(0, 176), ...kickerOptions, ...defenseOptions];

console.log(`Processing ${allCombined.length} total players for Brown Ballers 2026 Engine...`);

// Helper to determine W1_4_Category
function getW14Category(p, rank, isQB, isRB, isWR, isTE, isK, isDef) {
  if (isQB) {
    if (rank <= 30 || p.desc.toLowerCase().includes('rush') || p.desc.toLowerCase().includes('konami') || p.desc.toLowerCase().includes('dual-threat')) {
      return 'Konami/Dual-Threat QBs';
    }
    return 'High-Floor FLEX Anchors';
  }
  if (isWR) {
    if (rank <= 25 || p.desc.toLowerCase().includes('alpha') || p.desc.toLowerCase().includes('target') || p.desc.toLowerCase().includes('volume')) {
      return 'Alpha Target Monsters';
    }
    if (p.desc.toLowerCase().includes('slot') || p.desc.toLowerCase().includes('ppr') || p.desc.toLowerCase().includes('separation')) {
      return 'PPR Pass-Catching Specialists';
    }
    if (rank > 70) {
      return 'Late Target Value Sleepers';
    }
    return 'High-Floor FLEX Anchors';
  }
  if (isRB) {
    if (rank <= 20 || p.desc.toLowerCase().includes('bellcow') || p.desc.toLowerCase().includes('workhorse')) {
      return 'High-Floor FLEX Anchors';
    }
    if (p.desc.toLowerCase().includes('receiving') || p.desc.toLowerCase().includes('space') || p.desc.toLowerCase().includes('dual-threat')) {
      return 'PPR Pass-Catching Specialists';
    }
    if (p.moved || p.tag.toLowerCase().includes('rookie')) {
      return 'Early Acclimation Ramps';
    }
    if (rank > 60) {
      return 'Late Target Value Sleepers';
    }
    return 'High-Floor FLEX Anchors';
  }
  if (isTE) {
    if (rank <= 40 || p.desc.toLowerCase().includes('cheat code') || p.desc.toLowerCase().includes('wr1')) {
      return 'Alpha Target Monsters';
    }
    if (rank > 70) {
      return 'Late Target Value Sleepers';
    }
    return 'High-Floor FLEX Anchors';
  }
  return 'High-Floor FLEX Anchors';
}

// Helper to generate Primary Weekly Opportunity string
function getOpportunityString(p, rank, isQB, isRB, isWR, isTE, isK, isDef) {
  if (isQB) {
    const passAtt = rank <= 20 ? '36 pass att' : '33 pass att';
    const rush = (p.desc.toLowerCase().includes('rush') || rank <= 20) ? '8 rush att • 45 yds' : '4 rush att • 18 yds';
    const rz = rank <= 25 ? '3.8 RZ trips' : '2.6 RZ trips';
    return `${passAtt} • ${rush} • ${rz}`;
  }
  if (isRB) {
    const touches = rank <= 15 ? '21.5 touches' : rank <= 35 ? '17.0 touches' : rank <= 65 ? '13.5 touches' : '9.5 touches';
    const rz = rank <= 20 ? '4.2 RZ opps' : rank <= 45 ? '2.8 RZ opps' : '1.4 RZ opps';
    const snaps = rank <= 20 ? '82% snaps' : rank <= 50 ? '68% snaps' : '48% snaps';
    return `${touches} • ${rz} • ${snaps}`;
  }
  if (isWR) {
    const tgts = rank <= 15 ? '10.2 tgts' : rank <= 35 ? '8.4 tgts' : rank <= 70 ? '6.8 tgts' : '5.2 tgts';
    const share = rank <= 15 ? '31% tgt share' : rank <= 35 ? '25% tgt share' : '19% tgt share';
    const airYds = rank <= 20 ? '115 air yds' : rank <= 50 ? '85 air yds' : '55 air yds';
    return `${tgts} • ${share} • ${airYds}`;
  }
  if (isTE) {
    const tgts = rank <= 30 ? '8.6 tgts' : rank <= 50 ? '6.5 tgts' : '4.8 tgts';
    const share = rank <= 30 ? '24% tgt share' : '17% tgt share';
    const rz = rank <= 30 ? '2.4 RZ tgts' : '1.2 RZ tgts';
    return `${tgts} • ${share} • ${rz}`;
  }
  if (isK) {
    return '2.8 FG att • 3.2 XP att • Dome / Elite offense';
  }
  if (isDef) {
    return '3.4 sacks • 1.6 turnovers • Top-10 pressure rate';
  }
  return 'High-leverage volume';
}

// Helper to generate Head-to-Head Do's and Don'ts
function getDosAndDonts(p, rank, isQB, isRB, isWR, isTE) {
  if (p.name === "Ja'Marr Chase" || p.name === "CeeDee Lamb" || p.name === "Justin Jefferson") {
    return "DO draft over Amon-Ra for 30+ pt ceiling; DON'T pass in top 4 picks.";
  }
  if (p.name === "Amon-Ra St. Brown") {
    return "DO draft for ultra-safe 16 pt weekly floor; DON'T draft over CeeDee or JJ.";
  }
  if (p.name === "Brock Bowers") {
    return "DO draft in Rd 2/3 over mid WR2s for massive TE cheat code; DON'T wait on TE.";
  }
  if (p.name === "Trey McBride" || p.name === "Sam LaPorta") {
    return "DO take in Rd 3/4 to lock in top-3 positional advantage; DON'T reach in Rd 2.";
  }
  if (p.name === "Ashton Jeanty" || p.name === "James Cook" || p.name === "Kenneth Walker III") {
    return "DO draft as RB1/RB2 anchors over dead-zone WRs; DON'T fade young bellcow volume.";
  }
  if (p.name === "Josh Allen" || p.name === "Lamar Jackson" || p.name === "Jayden Daniels") {
    return "DO prioritize in 6-pt Pass TD format for +9.5 PPG weekly edge; DON'T draft backup QB.";
  }
  if (p.name === "Nico Collins" || p.name === "Malik Nabers" || p.name === "Rome Odunze") {
    return "DO smash at ADP (+10 surplus); DON'T let fall past Round 2/3 turn.";
  }
  if (isQB) {
    return rank <= 30 ? "DO lock in top-5 dual threat; DON'T draft a second QB." : "DO draft as high-floor QB1 in Rd 6–8; DON'T overdraft ahead of skill starters.";
  }
  if (isRB) {
    return rank <= 35 ? "DO draft as cornerstone starter for 2-FLEX lineup; DON'T overlook goal-line share." : "DO target for high-value touch upside; DON'T draft as pure early-down plodder.";
  }
  if (isWR) {
    return rank <= 40 ? "DO draft for target concentration & red zone share; DON'T chase low-aDOT WRs." : "DO draft for 90th% spike weeks; DON'T draft floor-only slot receivers.";
  }
  if (isTE) {
    return "DO draft if top-4 tier; otherwise stream or take late sleeper.";
  }
  return "DO target high-floor consistency; DON'T reach ahead of Round 13.";
}

// Generate the 208 Player records
const playersList = allCombined.map((p, idx) => {
  const id = idx + 1;
  const rank = idx + 1;
  const isK = p.pos === 'K';
  const isDef = p.pos === 'DEF';
  const isQB = p.pos === 'QB';
  const isRB = p.pos === 'RB';
  const isWR = p.pos === 'WR';
  const isTE = p.pos === 'TE';

  // 6-pt Passing TD + Half-PPR + Yardage bonus projections
  let projPpg = 12.0;
  let w14Ppg = 12.0;
  let ceilPpg = 18.0;
  let floorPpg = 6.0;
  let boom = 0.25;
  let bust = 0.15;
  let epa = 0.12;

  if (isQB) {
    projPpg = Number(Math.max(17.5, 28.5 - (rank * 0.08)).toFixed(1));
    w14Ppg = Number((projPpg * 0.98).toFixed(1));
    ceilPpg = Number((projPpg * 1.36).toFixed(1));
    floorPpg = Number((projPpg * 0.68).toFixed(1));
    boom = 0.38;
    bust = 0.10;
    epa = Number((0.32 - rank * 0.0012).toFixed(2));
  } else if (isRB) {
    projPpg = Number(Math.max(6.8, 21.2 - (rank * 0.078)).toFixed(1));
    w14Ppg = Number((projPpg * 0.97).toFixed(1));
    ceilPpg = Number((projPpg * 1.45).toFixed(1));
    floorPpg = Number((projPpg * 0.55).toFixed(1));
    boom = Number(Math.max(0.12, 0.45 - rank * 0.002).toFixed(2));
    bust = Number(Math.min(0.35, 0.08 + rank * 0.0015).toFixed(2));
    epa = Number((0.24 - rank * 0.001).toFixed(2));
  } else if (isWR) {
    projPpg = Number(Math.max(6.2, 21.0 - (rank * 0.078)).toFixed(1));
    w14Ppg = Number((projPpg * 0.96).toFixed(1));
    ceilPpg = Number((projPpg * 1.48).toFixed(1));
    floorPpg = Number((projPpg * 0.52).toFixed(1));
    boom = Number(Math.max(0.14, 0.46 - rank * 0.002).toFixed(2));
    bust = Number(Math.min(0.32, 0.09 + rank * 0.0014).toFixed(2));
    epa = Number((0.25 - rank * 0.001).toFixed(2));
  } else if (isTE) {
    projPpg = Number(Math.max(5.2, 16.2 - (rank * 0.052)).toFixed(1));
    w14Ppg = Number((projPpg * 0.95).toFixed(1));
    ceilPpg = Number((projPpg * 1.46).toFixed(1));
    floorPpg = Number((projPpg * 0.54).toFixed(1));
    boom = Number(Math.max(0.10, 0.38 - rank * 0.0018).toFixed(2));
    bust = Number(Math.min(0.35, 0.10 + rank * 0.0015).toFixed(2));
    epa = Number((0.20 - rank * 0.001).toFixed(2));
  } else if (isK) {
    projPpg = Number((9.8 - (rank - 176) * 0.10).toFixed(1));
    w14Ppg = projPpg;
    ceilPpg = Number((projPpg + 6.0).toFixed(1));
    floorPpg = Number((projPpg - 4.5).toFixed(1));
  } else if (isDef) {
    projPpg = Number((10.0 - (rank - 192) * 0.12).toFixed(1));
    w14Ppg = projPpg;
    ceilPpg = Number((projPpg + 7.5).toFixed(1));
    floorPpg = Number((projPpg - 4.8).toFixed(1));
  }

  const projSeasonPts = Number((projPpg * 17).toFixed(1));
  const w14TotalPts = Number((w14Ppg * 4).toFixed(1));

  const yahoo = p.yahoo || (rank + 5);
  const sleeper = p.sleeper || (rank + 3);
  const avgAdp = Number(((yahoo + sleeper) / 2).toFixed(1));
  const poadpSurplus = Number((yahoo - rank).toFixed(1));
  const marketGap = Number((avgAdp - rank).toFixed(1));

  // Volatility
  let volatility = 'Medium';
  if (p.age > 30 || (p.moved && (p.rz || 0) < 15)) volatility = 'Extreme';
  else if ((p.rz || 0) > 25 && p.age < 27) volatility = 'Low';
  else if ((p.rz || 0) > 15) volatility = 'Medium';
  else volatility = 'High';

  // Category & Opportunity & H2H
  const category = getW14Category(p, rank, isQB, isRB, isWR, isTE, isK, isDef);
  const opportunity = getOpportunityString(p, rank, isQB, isRB, isWR, isTE, isK, isDef);
  const dosAndDonts = getDosAndDonts(p, rank, isQB, isRB, isWR, isTE);

  return {
    Player_ID: id,
    Player_Name: p.name,
    Pos: p.pos,
    Team: p.team,
    Team_2025: p.team25 || p.team,
    Age: p.age,
    Position_Tier: p.tier || (rank <= 36 ? 1 : rank <= 84 ? 2 : rank <= 132 ? 3 : 4),
    Yahoo_ADP: yahoo,
    Sleeper_ADP: sleeper,
    ECR_Rank: p.ecr || rank,
    Offline_Draft_Rank: rank,
    VORP: 0, // Computed dynamically
    POADP_Points_Over_ADP: poadpSurplus,
    Proj_Fantasy_Pts_2026: projSeasonPts,
    W1_4_Proj_PPG: w14Ppg,
    W1_4_Proj_Total_Pts: w14TotalPts,
    Primary_Weekly_Opportunity: opportunity,
    W1_4_Category: category,
    Sleeper_Tag: p.tag,
    Volatility: volatility,
    Notable_Description: p.desc,
    Dos_And_Donts: dosAndDonts,
    Avg_ADP: avgAdp,
    Market_Gap: marketGap,
    True_Value_Rank: rank,
    Proj_PPG_26: projPpg,
    Ceiling_PPG_26: ceilPpg,
    Floor_PPG_26: floorPpg,
    Boom_Rate: boom,
    Bust_Rate: bust,
    RZ_Touches_25: p.rz || 0,
    EPA_Per_Play_25: epa
  };
});

// Calculate static baseline VORP across the 208 players
const qbBaseline = playersList.filter(p => p.Pos === 'QB').sort((a,b) => b.Proj_Fantasy_Pts_2026 - a.Proj_Fantasy_Pts_2026)[11]?.Proj_Fantasy_Pts_2026 || 310;
const rbBaseline = playersList.filter(p => p.Pos === 'RB').sort((a,b) => b.Proj_Fantasy_Pts_2026 - a.Proj_Fantasy_Pts_2026)[33]?.Proj_Fantasy_Pts_2026 || 160;
const wrBaseline = playersList.filter(p => p.Pos === 'WR').sort((a,b) => b.Proj_Fantasy_Pts_2026 - a.Proj_Fantasy_Pts_2026)[37]?.Proj_Fantasy_Pts_2026 || 150;
const teBaseline = playersList.filter(p => p.Pos === 'TE').sort((a,b) => b.Proj_Fantasy_Pts_2026 - a.Proj_Fantasy_Pts_2026)[11]?.Proj_Fantasy_Pts_2026 || 135;

playersList.forEach(p => {
  const base = p.Pos === 'QB' ? qbBaseline : p.Pos === 'RB' ? rbBaseline : p.Pos === 'WR' ? wrBaseline : teBaseline;
  p.VORP = Number((p.Proj_Fantasy_Pts_2026 - base).toFixed(1));
  const gapScore = Math.min(100, Math.max(0, (p.Market_Gap + 20) * 2.5));
  const vorpScore = Math.min(100, Math.max(0, (p.VORP + 50) * 0.7));
  const ceilingScore = Math.min(100, Math.max(0, ((p.Ceiling_PPG_26 || 15) / 28) * 100));
  const rzScore = Math.min(100, Math.max(0, ((p.RZ_Touches_25 || 0) / 35) * 100));
  p.Championship_Edge_Score = Number((gapScore * 0.3 + vorpScore * 0.3 + ceilingScore * 0.2 + rzScore * 0.2).toFixed(1));
});

// Default 12 Brown Ballers Teams
const defaultTeams = [
  { id: 1, name: "Team 1 (Agent Chaplo)", slot: 1, isUser: true, archetype: "BPA & VORP Maximizer", colorTheme: "amber" },
  { id: 2, name: "Team 2 (Brown Baller 2)", slot: 2, isUser: false, archetype: "Hero RB Anchor", colorTheme: "indigo" },
  { id: 3, name: "Team 3 (Brown Baller 3)", slot: 3, isUser: false, archetype: "Zero RB Wideout Heavy", colorTheme: "emerald" },
  { id: 4, name: "Team 4 (Brown Baller 4)", slot: 4, isUser: false, archetype: "Elite QB/TE Hunter", colorTheme: "purple" },
  { id: 5, name: "Team 5 (Brown Baller 5)", slot: 5, isUser: false, archetype: "Dual Workhorse RB", colorTheme: "blue" },
  { id: 6, name: "Team 6 (Brown Baller 6)", slot: 6, isUser: false, archetype: "Balanced Value Drafter", colorTheme: "teal" },
  { id: 7, name: "Team 7 (Brown Baller 7)", slot: 7, isUser: false, archetype: "Upside Rookie Chaser", colorTheme: "rose" },
  { id: 8, name: "Team 8 (Brown Baller 8)", slot: 8, isUser: false, archetype: "Heavy Red-Zone Believer", colorTheme: "amber" },
  { id: 9, name: "Team 9 (Brown Baller 9)", slot: 9, isUser: false, archetype: "PPR Volume Stacker", colorTheme: "cyan" },
  { id: 10, name: "Team 10 (Brown Baller 10)", slot: 10, isUser: false, archetype: "Market ADP Follower", colorTheme: "indigo" },
  { id: 11, name: "Team 11 (Brown Baller 11)", slot: 11, isUser: false, archetype: "Robust RB & Trench", colorTheme: "emerald" },
  { id: 12, name: "Team 12 (Brown Baller 12)", slot: 12, isUser: false, archetype: "Turnover & Ceiling Seeker", colorTheme: "purple" }
];

// Golden Head-to-Head Rules Matrix
const h2hRules = [
  {
    id: "h2h-1",
    title: "Alpha Tier 1 WRs vs Amon-Ra St. Brown",
    winner: "CeeDee Lamb / Justin Jefferson / Ja'Marr Chase",
    loser: "Amon-Ra St. Brown",
    verdict: "Draft CeeDee / JJ / Ja'Marr over Amon-Ra in Top 4",
    reasoning: "While Amon-Ra provides unmatched PPR floor consistency, CeeDee and Justin Jefferson command 30%+ team target shares with immense air-yard ceilings and 30+ point spike week probability in Half-PPR.",
    category: "Elite WR"
  },
  {
    id: "h2h-2",
    title: "Positional Cheat Code: Brock Bowers in Rd 2/3 vs Mid WR2s",
    winner: "Brock Bowers (TE1)",
    loser: "Tier 2 Mid WR2s (Godwin, Kupp, Deebo)",
    verdict: "Prioritize Brock Bowers in Round 2/3 turn",
    reasoning: "Brock Bowers operates as a de facto WR1 in the Raiders offense. Taking him secures a +7.5 PPG positional advantage over 10 of 12 opponents, which is 2x larger than the difference between a WR2 and WR3.",
    category: "TE Cheat Code"
  },
  {
    id: "h2h-3",
    title: "Emerging Bellcows vs Dead-Zone Veteran RBs",
    winner: "Ashton Jeanty / James Cook / Kenneth Walker III",
    loser: "Dead-Zone RBs (Rachaad White, Najee Harris, Tony Pollard)",
    verdict: "Draft explosive 3-down bellcows over volume plodders",
    reasoning: "In 0.5 PPR with 100-yard bonuses, explosive rushers with high tackle-breaking rates and goal-line monopolization outperform satellite backs and committee plodders by +4.0 PPG.",
    category: "Dead Zone RB"
  },
  {
    id: "h2h-4",
    title: "Konami Code / 6-pt Pass TD QBs vs Pocket Passers",
    winner: "Josh Allen / Lamar Jackson / Jayden Daniels",
    loser: "Pocket-only QBs (Goff, Lawrence, Purdy)",
    verdict: "Prioritize Elite Dual-Threat QBs in Round 3/4",
    reasoning: "In a 6-pt Pass TD league, elite dual-threat passers project for 27.5–29.5 PPG, creating an insurmountable +9.5 PPG weekly delta over replacement QB12.",
    category: "Konami QB"
  },
  {
    id: "h2h-5",
    title: "2-FLEX Target Vacuum WRs vs Low-aDOT Slot Receivers",
    winner: "Malik Nabers / Nico Collins / Rome Odunze",
    loser: "Low-aDOT Slot Receivers",
    verdict: "Stack high target share alphas for your 2 FLEX spots",
    reasoning: "With 2 FLEX slots (7 starting skill players per team), 30%+ target share alphas provide the essential high-variance weekly ceiling needed to win high-scoring matchups.",
    category: "Flex Target"
  },
  {
    id: "h2h-6",
    title: "Dome / High-Scoring Kickers vs Outdoor Weather Kickers",
    winner: "Ka'imi Fairbairn / Cameron Dicker / Justin Tucker",
    loser: "Cold Weather / Low-Scoring Kickers",
    verdict: "Draft Dome Kickers in high-efficiency offenses in Rd 14",
    reasoning: "Kickers in dome stadiums attached to high-scoring offenses generate +2.5 more extra points and field goal opportunities with zero wind interference.",
    category: "Kicker & DEF"
  }
];

// Write src/data.ts
const tsContent = `import { Player, TeamConfig, H2HRule } from './types';

export const defaultTeams: TeamConfig[] = ${JSON.stringify(defaultTeams, null, 2)};

export const h2hRules: H2HRule[] = ${JSON.stringify(h2hRules, null, 2)};

export const raw208Players: Player[] = ${JSON.stringify(playersList, null, 2)};

export const players: Player[] = raw208Players;
`;

fs.writeFileSync(path.join(__dirname, '../src/data.ts'), tsContent, 'utf8');
console.log(`Successfully generated src/data.ts with ${playersList.length} players, ${defaultTeams.length} default teams, and ${h2hRules.length} H2H rules!`);

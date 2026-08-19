import { Player, PlayerRaw, Position, VolatilityRating } from '../types';
import { getAccessToken } from './authService';

export const DEFAULT_SHEET_ID = '1JMxaRKYC0MnM_4-9OAUI3_BU4Dpv8iuWtWza1z5hbBM';
export const DEFAULT_SHEET_GID = '1083074523';

/**
 * Calculates derived championship metrics for fantasy football dominance
 */
export function calculateDerivedMetrics(raw: PlayerRaw, allPlayers: PlayerRaw[]): Player {
  const yahoo = raw.Yahoo_ADP || 150;
  const sleeper = raw.Sleeper_ADP || 150;
  const avgAdp = Number(((yahoo + sleeper) / 2).toFixed(1));
  const marketGap = Number((avgAdp - raw.Projected_Rank).toFixed(1));

  // Dynamic VORP (Value Over Replacement Player) calibrated for 12-Team, 2-FLEX, 6-pt Pass TD, 0.5 PPR
  // Starters across 12 teams: 12 QBs, ~34 RBs (24 + flex), ~38 WRs (24 + flex), 12 TEs
  const posPlayers = allPlayers
    .filter(p => p.Pos === raw.Pos)
    .sort((a, b) => (b.Proj_Fantasy_Pts_26 || (b.Proj_PPG_26 || 0) * 17) - (a.Proj_Fantasy_Pts_26 || (a.Proj_PPG_26 || 0) * 17));

  const baselineIndex = raw.Pos === 'QB' ? 11 : raw.Pos === 'RB' ? 33 : raw.Pos === 'WR' ? 37 : 11;
  const baselinePts = posPlayers[Math.min(baselineIndex, Math.max(0, posPlayers.length - 1))]?.Proj_Fantasy_Pts_26 || 170;
  const playerPts = raw.Proj_Fantasy_Pts_26 || ((raw.Proj_PPG_26 || 12) * 17);
  const vorp = Number((playerPts - baselinePts).toFixed(1));

  // Volatility algorithm
  let volatility: VolatilityRating = 'Medium';
  const rz = raw.RZ_Touches_25 || 0;
  const age = raw.Age || 25;
  const hasMoved = raw.Has_Moved;

  if (raw.Boom_Rate && raw.Bust_Rate) {
    if (raw.Bust_Rate > 0.35 || (hasMoved && age > 29)) {
      volatility = 'Extreme';
    } else if (raw.Boom_Rate > 0.30 && raw.Bust_Rate < 0.15) {
      volatility = 'Low';
    } else if (raw.Boom_Rate > 0.25 || raw.Bust_Rate > 0.22) {
      volatility = 'High';
    }
  } else {
    if (age > 30 || (hasMoved && rz < 10)) volatility = 'Extreme';
    else if (rz > 25 && age < 27) volatility = 'Low';
    else if (rz > 15) volatility = 'Medium';
    else volatility = 'High';
  }

  // Championship Edge Score (0 - 100)
  // Combines: Market Gap (+30%), VORP (+30%), Ceiling Potential (+20%), RZ Touches (+20%)
  const gapScore = Math.min(100, Math.max(0, (marketGap + 20) * 2.5));
  const vorpScore = Math.min(100, Math.max(0, (vorp + 50) * 0.7));
  const ceilingScore = Math.min(100, Math.max(0, ((raw.Ceiling_PPG_26 || raw.Proj_PPG_26 || 15) / 28) * 100));
  const rzScore = Math.min(100, Math.max(0, (rz / 35) * 100));

  const championshipEdge = Number(
    (gapScore * 0.3 + vorpScore * 0.3 + ceilingScore * 0.2 + rzScore * 0.2).toFixed(1)
  );

  return {
    ...raw,
    Avg_ADP: avgAdp,
    Market_Gap: marketGap,
    VORP: vorp,
    Championship_Edge_Score: championshipEdge,
    Volatility: volatility,
    True_Value_Rank: raw.Projected_Rank,
  };
}

/**
 * Parses raw 2D array from Google Sheets API and maps to Player models
 */
export function parseSheetData(values: any[][]): PlayerRaw[] {
  if (!values || values.length < 2) return [];

  const headers = values[0].map((h: any) => String(h || '').trim().toLowerCase());
  
  // Find column index helper
  const findCol = (...aliases: string[]): number => {
    for (const alias of aliases) {
      const idx = headers.findIndex(h => h.includes(alias.toLowerCase()));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const nameIdx = findCol('player', 'name');
  const posIdx = findCol('pos', 'position');
  const teamIdx = findCol('team', 'tm');
  const team25Idx = findCol('2025 team', 'team 2025', 'prev team', 'old team');
  const ageIdx = findCol('age');
  const roleIdx = findCol('depth', 'role', 'chart');
  const rankIdx = findCol('rank', 'proj rank', 'projected rank', 'overall');
  const ecrIdx = findCol('ecr', 'expert consensus');
  const yahooIdx = findCol('yahoo', 'yahoo adp');
  const sleeperIdx = findCol('sleeper', 'sleeper adp');
  const tierIdx = findCol('tier', 'pos tier', 'position tier');
  const movedIdx = findCol('moved', 'has moved', 'team change', 'new team');
  const tagIdx = findCol('tag', 'sleeper tag', 'archetype', 'label');
  const descIdx = findCol('description', 'notable', 'notes', 'outlook', 'analysis');

  // 2025 Actuals
  const rz25Idx = findCol('rz touches', 'rz_touches', 'red zone', '25 rz');
  const pYds25Idx = findCol('2025 pass yds', 'pass yds 25', 'pass yards 25');
  const pTd25Idx = findCol('2025 pass td', 'pass td 25');
  const rYds25Idx = findCol('2025 rush yds', 'rush yds 25', 'rush yards 25');
  const rTd25Idx = findCol('2025 rush td', 'rush td 25');
  const rec25Idx = findCol('2025 rec', 'receptions 25', 'rec 25');
  const recYds25Idx = findCol('2025 rec yds', 'rec yds 25', 'receiving yds');
  const recTd25Idx = findCol('2025 rec td', 'rec td 25');
  const tgt25Idx = findCol('2025 targets', 'targets 25', 'tgt 25');
  const ppg25Idx = findCol('2025 ppg', 'ppg 25', 'fantasy ppg 25');
  const tgtShare25Idx = findCol('target share', 'tgt share', 'air yards share');
  const epa25Idx = findCol('epa', 'epa/play', 'epa per play');

  // 2026 Projections
  const projPts26Idx = findCol('2026 pts', 'proj fantasy pts', 'proj pts 26', 'projected pts');
  const projPpg26Idx = findCol('2026 ppg', 'proj ppg 26', 'proj ppg');
  const ceiling26Idx = findCol('ceiling', 'ceiling ppg', '90th percentile', 'max ppg');
  const floor26Idx = findCol('floor', 'floor ppg', '10th percentile', 'min ppg');
  const boomIdx = findCol('boom', 'boom rate', 'boom %');
  const bustIdx = findCol('bust', 'bust rate', 'bust %');

  const parsed: PlayerRaw[] = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row || !row[nameIdx !== -1 ? nameIdx : 0]) continue;

    const name = String(row[nameIdx !== -1 ? nameIdx : 0]).trim();
    if (!name || name.toLowerCase().includes('total') || name.toLowerCase().includes('average')) continue;

    let pos = (posIdx !== -1 ? String(row[posIdx] || 'WR').trim().toUpperCase() : 'WR') as Position;
    if (!['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(pos)) {
      pos = 'WR';
    }

    const team = teamIdx !== -1 ? String(row[teamIdx] || 'FA').trim().toUpperCase() : 'FA';
    const team2025 = team25Idx !== -1 ? String(row[team25Idx] || team).trim().toUpperCase() : team;
    const age = ageIdx !== -1 ? Number(row[ageIdx]) || 25 : 25;
    const depth = roleIdx !== -1 ? String(row[roleIdx] || `${pos}1`).trim() : `${pos}1`;
    const projRank = rankIdx !== -1 ? Number(row[rankIdx]) || i : i;
    const ecr = ecrIdx !== -1 ? Number(row[ecrIdx]) || projRank + 2 : projRank + 2;
    const yahoo = yahooIdx !== -1 ? Number(row[yahooIdx]) || projRank + 5 : projRank + 5;
    const sleeper = sleeperIdx !== -1 ? Number(row[sleeperIdx]) || projRank + 4 : projRank + 4;
    const tierVal = tierIdx !== -1 ? Number(row[tierIdx]) : (projRank <= 24 ? 1 : projRank <= 60 ? 2 : 3);
    const tier = (Math.max(1, Math.min(5, tierVal || 2))) as 1 | 2 | 3 | 4 | 5;
    const hasMovedVal = movedIdx !== -1 ? String(row[movedIdx]).toLowerCase().includes('y') || String(row[movedIdx]).toLowerCase().includes('true') : team !== team2025;
    const tag = tagIdx !== -1 ? String(row[tagIdx] || 'Market Target').trim() : 'Market Target';
    const desc = descIdx !== -1 ? String(row[descIdx] || 'High upside profile in 2026 offensive scheme.').trim() : 'High upside profile in 2026 offensive scheme.';

    // 2025 numbers
    const rz25 = rz25Idx !== -1 ? Number(row[rz25Idx]) || 0 : (pos === 'RB' ? 18 : pos === 'WR' ? 12 : 5);
    const pYds25 = pYds25Idx !== -1 ? Number(row[pYds25Idx]) || undefined : undefined;
    const pTd25 = pTd25Idx !== -1 ? Number(row[pTd25Idx]) || undefined : undefined;
    const rYds25 = rYds25Idx !== -1 ? Number(row[rYds25Idx]) || undefined : undefined;
    const rTd25 = rTd25Idx !== -1 ? Number(row[rTd25Idx]) || undefined : undefined;
    const rec25 = rec25Idx !== -1 ? Number(row[rec25Idx]) || undefined : undefined;
    const recYds25 = recYds25Idx !== -1 ? Number(row[recYds25Idx]) || undefined : undefined;
    const recTd25 = recTd25Idx !== -1 ? Number(row[recTd25Idx]) || undefined : undefined;
    const tgt25 = tgt25Idx !== -1 ? Number(row[tgt25Idx]) || undefined : undefined;
    const ppg25 = ppg25Idx !== -1 ? Number(row[ppg25Idx]) || undefined : undefined;
    const tgtShare25 = tgtShare25Idx !== -1 ? Number(row[tgtShare25Idx]) || undefined : undefined;
    const epa25 = epa25Idx !== -1 ? Number(row[epa25Idx]) || undefined : undefined;

    // 2026 Projections
    const projPts26 = projPts26Idx !== -1 ? Number(row[projPts26Idx]) || undefined : undefined;
    const projPpg26 = projPpg26Idx !== -1 ? Number(row[projPpg26Idx]) || (projPts26 ? Number((projPts26 / 17).toFixed(1)) : undefined) : undefined;
    const ceiling26 = ceiling26Idx !== -1 ? Number(row[ceiling26Idx]) || undefined : (projPpg26 ? Number((projPpg26 * 1.35).toFixed(1)) : undefined);
    const floor26 = floor26Idx !== -1 ? Number(row[floor26Idx]) || undefined : (projPpg26 ? Number((projPpg26 * 0.65).toFixed(1)) : undefined);
    const boom = boomIdx !== -1 ? Number(row[boomIdx]) || undefined : undefined;
    const bust = bustIdx !== -1 ? Number(row[bustIdx]) || undefined : undefined;

    parsed.push({
      Player_ID: i,
      Player_Name: name,
      Pos: pos,
      Team: team,
      Team_2025: team2025,
      Age: age,
      Last_Depth_Chart: depth,
      Projected_Rank: projRank,
      ECR_Rank: ecr,
      Yahoo_ADP: yahoo,
      Sleeper_ADP: sleeper,
      Position_Tier: tier,
      Has_Moved: hasMovedVal,
      Sleeper_Tag: tag,
      Notable_Description: desc,
      RZ_Touches_25: rz25,
      Actual_Pass_Yds_25: pYds25,
      Actual_Pass_TD_25: pTd25,
      Actual_Rush_Yds_25: rYds25,
      Actual_Rush_TD_25: rTd25,
      Actual_Rec_25: rec25,
      Actual_Rec_Yds_25: recYds25,
      Actual_Rec_TD_25: recTd25,
      Actual_Targets_25: tgt25,
      Fantasy_PPG_25: ppg25,
      Target_Share_25: tgtShare25,
      EPA_Per_Play_25: epa25,
      Proj_Fantasy_Pts_26: projPts26 || (projPpg26 ? Number((projPpg26 * 17).toFixed(1)) : Math.max(50, 320 - projRank * 1.3)),
      Proj_PPG_26: projPpg26 || Number(((projPts26 || Math.max(50, 320 - projRank * 1.3)) / 17).toFixed(1)),
      Ceiling_PPG_26: ceiling26,
      Floor_PPG_26: floor26,
      Boom_Rate: boom,
      Bust_Rate: bust,
    });
  }

  return parsed;
}

export const defaultKickerAndDefenseOptions: PlayerRaw[] = [
  { Player_ID: 1001, Player_Name: "Brandon Aubrey", Pos: "K", Team: "DAL", Team_2025: "DAL", Age: 31, Last_Depth_Chart: "K1", Yahoo_ADP: 115.0, Sleeper_ADP: 120.0, ECR_Rank: 110.0, Position_Tier: 1, Has_Moved: false, Sleeper_Tag: "Record Range Kicker", Projected_Rank: 201, Notable_Description: "NFL record 65+ yard range in highest scoring dome offense. Huge positional edge.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 10.2, Proj_Fantasy_Pts_26: 166.6, Proj_PPG_26: 9.8, Ceiling_PPG_26: 15.8, Floor_PPG_26: 5.3, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 18 },
  { Player_ID: 1002, Player_Name: "Justin Tucker", Pos: "K", Team: "BAL", Team_2025: "BAL", Age: 36, Last_Depth_Chart: "K1", Yahoo_ADP: 125.0, Sleeper_ADP: 130.0, ECR_Rank: 122.0, Position_Tier: 1, Has_Moved: false, Sleeper_Tag: "Clutch Legend Kicker", Projected_Rank: 202, Notable_Description: "Automatic scoring opportunities in high-efficiency Lamar Jackson offense.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 10.0, Proj_Fantasy_Pts_26: 164.9, Proj_PPG_26: 9.7, Ceiling_PPG_26: 15.7, Floor_PPG_26: 5.2, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 17 },
  { Player_ID: 1003, Player_Name: "Ka'imi Fairbairn", Pos: "K", Team: "HOU", Team_2025: "HOU", Age: 32, Last_Depth_Chart: "K1", Yahoo_ADP: 138.0, Sleeper_ADP: 135.0, ECR_Rank: 130.0, Position_Tier: 1, Has_Moved: false, Sleeper_Tag: "Dome Accuracy Kicker", Projected_Rank: 203, Notable_Description: "Elite dome conditions with high-scoring C.J. Stroud offense creating constant field goals.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.9, Proj_Fantasy_Pts_26: 163.2, Proj_PPG_26: 9.6, Ceiling_PPG_26: 15.6, Floor_PPG_26: 5.1, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 17 },
  { Player_ID: 1004, Player_Name: "Cameron Dicker", Pos: "K", Team: "LAC", Team_2025: "LAC", Age: 26, Last_Depth_Chart: "K1", Yahoo_ADP: 140.0, Sleeper_ADP: 138.0, ECR_Rank: 132.0, Position_Tier: 1, Has_Moved: false, Sleeper_Tag: "Dicker the Kicker", Projected_Rank: 204, Notable_Description: "95%+ career field goal accuracy in weather-free SoFi stadium.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.8, Proj_Fantasy_Pts_26: 161.5, Proj_PPG_26: 9.5, Ceiling_PPG_26: 15.5, Floor_PPG_26: 5.0, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 17 },
  { Player_ID: 1005, Player_Name: "Harrison Butker", Pos: "K", Team: "KC", Team_2025: "KC", Age: 31, Last_Depth_Chart: "K1", Yahoo_ADP: 144.0, Sleeper_ADP: 142.0, ECR_Rank: 137.0, Position_Tier: 1, Has_Moved: false, Sleeper_Tag: "Chiefs Engine Kicker", Projected_Rank: 205, Notable_Description: "High volume extra points and reliable 50-yard strikes in Chiefs offense.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.7, Proj_Fantasy_Pts_26: 159.8, Proj_PPG_26: 9.4, Ceiling_PPG_26: 15.4, Floor_PPG_26: 4.9, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 17 },
  { Player_ID: 1006, Player_Name: "Jake Bates", Pos: "K", Team: "DET", Team_2025: "DET", Age: 26, Last_Depth_Chart: "K1", Yahoo_ADP: 152.0, Sleeper_ADP: 147.0, ECR_Rank: 142.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "64-Yard Monster Leg", Projected_Rank: 206, Notable_Description: "UFL sensation with 64-yard leg playing under Ford Field dome roof.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.5, Proj_Fantasy_Pts_26: 158.1, Proj_PPG_26: 9.3, Ceiling_PPG_26: 15.3, Floor_PPG_26: 4.8, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 17 },
  { Player_ID: 1007, Player_Name: "Chase McLaughlin", Pos: "K", Team: "TB", Team_2025: "TB", Age: 30, Last_Depth_Chart: "K1", Yahoo_ADP: 155.0, Sleeper_ADP: 150.0, ECR_Rank: 146.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Deep Ball Striker", Projected_Rank: 207, Notable_Description: "Automatic from 50+ yards in sunny Tampa Bay scoring attack.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.4, Proj_Fantasy_Pts_26: 156.4, Proj_PPG_26: 9.2, Ceiling_PPG_26: 15.2, Floor_PPG_26: 4.7, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 17 },
  { Player_ID: 1008, Player_Name: "Jason Sanders", Pos: "K", Team: "MIA", Team_2025: "MIA", Age: 30, Last_Depth_Chart: "K1", Yahoo_ADP: 158.0, Sleeper_ADP: 154.0, ECR_Rank: 148.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Warm Weather Kicker", Projected_Rank: 208, Notable_Description: "Prolific volume in high-flying Miami offensive attack.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.3, Proj_Fantasy_Pts_26: 154.7, Proj_PPG_26: 9.1, Ceiling_PPG_26: 15.1, Floor_PPG_26: 4.6, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 16 },
  { Player_ID: 1009, Player_Name: "Greg Zuerlein", Pos: "K", Team: "NYJ", Team_2025: "NYJ", Age: 38, Last_Depth_Chart: "K1", Yahoo_ADP: 160.0, Sleeper_ADP: 156.0, ECR_Rank: 150.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Greg the Leg", Projected_Rank: 209, Notable_Description: "Huge leg from 50+ yards with improved red-zone stall opportunities.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.2, Proj_Fantasy_Pts_26: 153.0, Proj_PPG_26: 9.0, Ceiling_PPG_26: 15.0, Floor_PPG_26: 4.5, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 16 },
  { Player_ID: 1010, Player_Name: "Chris Boswell", Pos: "K", Team: "PIT", Team_2025: "PIT", Age: 35, Last_Depth_Chart: "K1", Yahoo_ADP: 162.0, Sleeper_ADP: 158.0, ECR_Rank: 152.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Steel City Automatic", Projected_Rank: 210, Notable_Description: "Lethal 50+ yard accuracy carrying Pittsburgh offense in close games.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.1, Proj_Fantasy_Pts_26: 151.3, Proj_PPG_26: 8.9, Ceiling_PPG_26: 14.9, Floor_PPG_26: 4.4, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 16 },
  { Player_ID: 1011, Player_Name: "Younghoe Koo", Pos: "K", Team: "ATL", Team_2025: "ATL", Age: 32, Last_Depth_Chart: "K1", Yahoo_ADP: 165.0, Sleeper_ADP: 160.0, ECR_Rank: 154.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Dome Specialist", Projected_Rank: 211, Notable_Description: "Clutch dome kicker with prolific opportunities in Atlanta offense.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.0, Proj_Fantasy_Pts_26: 149.6, Proj_PPG_26: 8.8, Ceiling_PPG_26: 14.8, Floor_PPG_26: 4.3, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 16 },
  { Player_ID: 1012, Player_Name: "Jake Moody", Pos: "K", Team: "SF", Team_2025: "SF", Age: 26, Last_Depth_Chart: "K1", Yahoo_ADP: 167.0, Sleeper_ADP: 162.0, ECR_Rank: 156.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Bay Area Leg", Projected_Rank: 212, Notable_Description: "High point total potential in high-scoring 49ers offensive engine.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 8.9, Proj_Fantasy_Pts_26: 147.9, Proj_PPG_26: 8.7, Ceiling_PPG_26: 14.7, Floor_PPG_26: 4.2, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 16 },
  { Player_ID: 1013, Player_Name: "Evan McPherson", Pos: "K", Team: "CIN", Team_2025: "CIN", Age: 27, Last_Depth_Chart: "K1", Yahoo_ADP: 168.0, Sleeper_ADP: 164.0, ECR_Rank: 158.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Money Mac", Projected_Rank: 213, Notable_Description: "Huge postseason clutch leg attached to Joe Burrow high-scoring unit.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 8.8, Proj_Fantasy_Pts_26: 146.2, Proj_PPG_26: 8.6, Ceiling_PPG_26: 14.6, Floor_PPG_26: 4.1, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 15 },
  { Player_ID: 1014, Player_Name: "Matt Gay", Pos: "K", Team: "IND", Team_2025: "IND", Age: 32, Last_Depth_Chart: "K1", Yahoo_ADP: 170.0, Sleeper_ADP: 166.0, ECR_Rank: 160.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Indy Dome Ace", Projected_Rank: 214, Notable_Description: "Lucas Oil Stadium dome kicker with reliable 50+ yard range.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 8.7, Proj_Fantasy_Pts_26: 144.5, Proj_PPG_26: 8.5, Ceiling_PPG_26: 14.5, Floor_PPG_26: 4.0, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 15 },
  { Player_ID: 1015, Player_Name: "Dustin Hopkins", Pos: "K", Team: "CLE", Team_2025: "CLE", Age: 35, Last_Depth_Chart: "K1", Yahoo_ADP: 172.0, Sleeper_ADP: 168.0, ECR_Rank: 162.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Long Range Ace", Projected_Rank: 215, Notable_Description: "Consistently drilled 50+ yard field goals in tough conditions.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 8.6, Proj_Fantasy_Pts_26: 142.8, Proj_PPG_26: 8.4, Ceiling_PPG_26: 14.4, Floor_PPG_26: 3.9, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 15 },
  { Player_ID: 1016, Player_Name: "Cairo Santos", Pos: "K", Team: "CHI", Team_2025: "CHI", Age: 34, Last_Depth_Chart: "K1", Yahoo_ADP: 174.0, Sleeper_ADP: 170.0, ECR_Rank: 164.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Windy City Sniper", Projected_Rank: 216, Notable_Description: "Outstanding accuracy benefiting from high-scoring Ben Johnson offense.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 8.5, Proj_Fantasy_Pts_26: 141.1, Proj_PPG_26: 8.3, Ceiling_PPG_26: 14.3, Floor_PPG_26: 3.8, Boom_Rate: 0.22, Bust_Rate: 0.14, Touch_Equity: 15 },

  // 16 Defenses
  { Player_ID: 2001, Player_Name: "San Francisco 49ers", Pos: "DEF", Team: "SF", Team_2025: "SF", Age: 28, Last_Depth_Chart: "DEF1", Yahoo_ADP: 130.0, Sleeper_ADP: 125.0, ECR_Rank: 120.0, Position_Tier: 1, Has_Moved: false, Sleeper_Tag: "Elite Turnovers DEF", Projected_Rank: 217, Notable_Description: "Dominant defensive front with Nick Bosa generating constant sacks and takeaways.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 10.5, Proj_Fantasy_Pts_26: 170.0, Proj_PPG_26: 10.0, Ceiling_PPG_26: 17.5, Floor_PPG_26: 5.2, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 18 },
  { Player_ID: 2002, Player_Name: "Baltimore Ravens", Pos: "DEF", Team: "BAL", Team_2025: "BAL", Age: 27, Last_Depth_Chart: "DEF1", Yahoo_ADP: 132.0, Sleeper_ADP: 128.0, ECR_Rank: 124.0, Position_Tier: 1, Has_Moved: false, Sleeper_Tag: "Sack Machine DEF", Projected_Rank: 218, Notable_Description: "Blitz-heavy scheme with elite safety play forcing multi-turnover games.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 10.3, Proj_Fantasy_Pts_26: 168.0, Proj_PPG_26: 9.9, Ceiling_PPG_26: 17.4, Floor_PPG_26: 5.1, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 18 },
  { Player_ID: 2003, Player_Name: "Pittsburgh Steelers", Pos: "DEF", Team: "PIT", Team_2025: "PIT", Age: 28, Last_Depth_Chart: "DEF1", Yahoo_ADP: 135.0, Sleeper_ADP: 132.0, ECR_Rank: 126.0, Position_Tier: 1, Has_Moved: false, Sleeper_Tag: "T.J. Watt Havoc DEF", Projected_Rank: 219, Notable_Description: "T.J. Watt and elite pass rush lead NFL in defensive touchdowns and strip sacks.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 10.1, Proj_Fantasy_Pts_26: 166.0, Proj_PPG_26: 9.8, Ceiling_PPG_26: 17.3, Floor_PPG_26: 5.0, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 18 },
  { Player_ID: 2004, Player_Name: "Buffalo Bills", Pos: "DEF", Team: "BUF", Team_2025: "BUF", Age: 28, Last_Depth_Chart: "DEF1", Yahoo_ADP: 137.0, Sleeper_ADP: 135.0, ECR_Rank: 131.0, Position_Tier: 1, Has_Moved: false, Sleeper_Tag: "Opportunistic DEF", Projected_Rank: 220, Notable_Description: "Sean McDermott ball-hawking secondary consistently wins turnover battles.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.9, Proj_Fantasy_Pts_26: 164.0, Proj_PPG_26: 9.6, Ceiling_PPG_26: 17.1, Floor_PPG_26: 4.8, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 17 },
  { Player_ID: 2005, Player_Name: "Kansas City Chiefs", Pos: "DEF", Team: "KC", Team_2025: "KC", Age: 26, Last_Depth_Chart: "DEF1", Yahoo_ADP: 142.0, Sleeper_ADP: 139.0, ECR_Rank: 135.0, Position_Tier: 1, Has_Moved: false, Sleeper_Tag: "Spagnuolo Blitz DEF", Projected_Rank: 221, Notable_Description: "Steve Spagnuolo exotic blitz packages create constant 3rd-down sacks and INTs.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.7, Proj_Fantasy_Pts_26: 162.0, Proj_PPG_26: 9.5, Ceiling_PPG_26: 17.0, Floor_PPG_26: 4.7, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 17 },
  { Player_ID: 2006, Player_Name: "Houston Texans", Pos: "DEF", Team: "HOU", Team_2025: "HOU", Age: 26, Last_Depth_Chart: "DEF1", Yahoo_ADP: 145.0, Sleeper_ADP: 140.0, ECR_Rank: 136.0, Position_Tier: 1, Has_Moved: false, Sleeper_Tag: "DeMeco Ryans Swarm", Projected_Rank: 222, Notable_Description: "Will Anderson Jr. and Danielle Hunter create ferocious edge rush pressure.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.6, Proj_Fantasy_Pts_26: 160.0, Proj_PPG_26: 9.4, Ceiling_PPG_26: 16.9, Floor_PPG_26: 4.6, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 17 },
  { Player_ID: 2007, Player_Name: "Philadelphia Eagles", Pos: "DEF", Team: "PHI", Team_2025: "PHI", Age: 27, Last_Depth_Chart: "DEF1", Yahoo_ADP: 147.0, Sleeper_ADP: 144.0, ECR_Rank: 139.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Vic Fangio Scheme", Projected_Rank: 223, Notable_Description: "Talented young secondary with Jalen Carter wrecking interior offensive lines.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.4, Proj_Fantasy_Pts_26: 158.0, Proj_PPG_26: 9.3, Ceiling_PPG_26: 16.8, Floor_PPG_26: 4.5, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 17 },
  { Player_ID: 2008, Player_Name: "Detroit Lions", Pos: "DEF", Team: "DET", Team_2025: "DET", Age: 27, Last_Depth_Chart: "DEF1", Yahoo_ADP: 150.0, Sleeper_ADP: 146.0, ECR_Rank: 143.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Aidan Hutchinson Edge", Projected_Rank: 224, Notable_Description: "Aidan Hutchinson pass rush engine forcing quarterbacks into hurried throws.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.3, Proj_Fantasy_Pts_26: 156.0, Proj_PPG_26: 9.2, Ceiling_PPG_26: 16.7, Floor_PPG_26: 4.4, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 17 },
  { Player_ID: 2009, Player_Name: "Minnesota Vikings", Pos: "DEF", Team: "MIN", Team_2025: "MIN", Age: 28, Last_Depth_Chart: "DEF1", Yahoo_ADP: 153.0, Sleeper_ADP: 148.0, ECR_Rank: 145.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Brian Flores Chaos DEF", Projected_Rank: 225, Notable_Description: "Brian Flores psycho blitz packages confuse opposing QBs for cheap pick-sixes.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.2, Proj_Fantasy_Pts_26: 154.0, Proj_PPG_26: 9.1, Ceiling_PPG_26: 16.6, Floor_PPG_26: 4.3, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 17 },
  { Player_ID: 2010, Player_Name: "Denver Broncos", Pos: "DEF", Team: "DEN", Team_2025: "DEN", Age: 27, Last_Depth_Chart: "DEF1", Yahoo_ADP: 155.0, Sleeper_ADP: 150.0, ECR_Rank: 147.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Surtain Lock Island", Projected_Rank: 226, Notable_Description: "Patrick Surtain II erases opponent WR1s while defensive front racks up sacks.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 9.0, Proj_Fantasy_Pts_26: 152.0, Proj_PPG_26: 8.9, Ceiling_PPG_26: 16.4, Floor_PPG_26: 4.1, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 16 },
  { Player_ID: 2011, Player_Name: "Cleveland Browns", Pos: "DEF", Team: "CLE", Team_2025: "CLE", Age: 28, Last_Depth_Chart: "DEF1", Yahoo_ADP: 157.0, Sleeper_ADP: 152.0, ECR_Rank: 149.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Myles Garrett Force", Projected_Rank: 227, Notable_Description: "Myles Garrett terrorizes pocket passers with league-leading sack pressure.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 8.9, Proj_Fantasy_Pts_26: 150.0, Proj_PPG_26: 8.8, Ceiling_PPG_26: 16.3, Floor_PPG_26: 4.0, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 16 },
  { Player_ID: 2012, Player_Name: "New York Jets", Pos: "DEF", Team: "NYJ", Team_2025: "NYJ", Age: 27, Last_Depth_Chart: "DEF1", Yahoo_ADP: 159.0, Sleeper_ADP: 154.0, ECR_Rank: 151.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Sauce Island Blanket", Projected_Rank: 228, Notable_Description: "Sauce Gardner lockdown boundary coverage limits big passing plays.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 8.8, Proj_Fantasy_Pts_26: 148.0, Proj_PPG_26: 8.7, Ceiling_PPG_26: 16.2, Floor_PPG_26: 3.9, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 16 },
  { Player_ID: 2013, Player_Name: "Dallas Cowboys", Pos: "DEF", Team: "DAL", Team_2025: "DAL", Age: 27, Last_Depth_Chart: "DEF1", Yahoo_ADP: 161.0, Sleeper_ADP: 156.0, ECR_Rank: 153.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Micah Parsons Havoc", Projected_Rank: 229, Notable_Description: "Micah Parsons lightning first-step generates constant strip sacks and fumbles.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 8.7, Proj_Fantasy_Pts_26: 146.0, Proj_PPG_26: 8.6, Ceiling_PPG_26: 16.1, Floor_PPG_26: 3.8, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 16 },
  { Player_ID: 2014, Player_Name: "Chicago Bears", Pos: "DEF", Team: "CHI", Team_2025: "CHI", Age: 26, Last_Depth_Chart: "DEF1", Yahoo_ADP: 163.0, Sleeper_ADP: 158.0, ECR_Rank: 155.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Montez Sweat Pass Rush", Projected_Rank: 230, Notable_Description: "Turnover-forcing secondary and Montez Sweat interior pocket push.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 8.6, Proj_Fantasy_Pts_26: 144.0, Proj_PPG_26: 8.5, Ceiling_PPG_26: 16.0, Floor_PPG_26: 3.7, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 15 },
  { Player_ID: 2015, Player_Name: "Green Bay Packers", Pos: "DEF", Team: "GB", Team_2025: "GB", Age: 26, Last_Depth_Chart: "DEF1", Yahoo_ADP: 165.0, Sleeper_ADP: 160.0, ECR_Rank: 157.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Jeff Hafley Aggression", Projected_Rank: 231, Notable_Description: "Xavier McKinney ball-hawking safety play creating regular interception returns.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 8.5, Proj_Fantasy_Pts_26: 142.0, Proj_PPG_26: 8.4, Ceiling_PPG_26: 15.9, Floor_PPG_26: 3.6, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 15 },
  { Player_ID: 2016, Player_Name: "Miami Dolphins", Pos: "DEF", Team: "MIA", Team_2025: "MIA", Age: 28, Last_Depth_Chart: "DEF1", Yahoo_ADP: 167.0, Sleeper_ADP: 162.0, ECR_Rank: 159.0, Position_Tier: 2, Has_Moved: false, Sleeper_Tag: "Anthony Weaver Pressure", Projected_Rank: 232, Notable_Description: "Speed rushers capitalizing on opponents playing from behind against Miami.", RZ_Touches_25: 0, Snap_Share_25: 0.70, EPA_Per_Play_25: 0.10, Fantasy_PPG_25: 8.4, Proj_Fantasy_Pts_26: 140.0, Proj_PPG_26: 8.2, Ceiling_PPG_26: 15.8, Floor_PPG_26: 3.5, Boom_Rate: 0.26, Bust_Rate: 0.16, Touch_Equity: 15 },
];

/**
 * Fetch live data from Google Sheets API
 */
export async function fetchLiveGoogleSheetData(
  spreadsheetId: string, 
  sheetNameOrRange: string = 'A1:ZZ500',
  explicitToken?: string | null
): Promise<Player[]> {
  const token = explicitToken || getAccessToken();
  if (!token) {
    throw new Error('Google OAuth token not found. Please sign in with Google to sync live Google Sheet data.');
  }

  // 1. Fetch metadata first to discover sheet title if needed
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!metaRes.ok) {
    const errText = await metaRes.text();
    throw new Error(`Google Sheets API Error (${metaRes.status}): ${errText}`);
  }

  const metaData = await metaRes.json();
  const sheets = metaData.sheets || [];
  const firstSheetTitle = sheets[0]?.properties?.title || 'Sheet1';
  
  // 2. Fetch sheet values
  const range = sheetNameOrRange.includes('!') ? sheetNameOrRange : `'${firstSheetTitle}'!A1:ZZ500`;
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  
  const valuesRes = await fetch(valuesUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!valuesRes.ok) {
    const errText = await valuesRes.text();
    throw new Error(`Failed to fetch spreadsheet values (${valuesRes.status}): ${errText}`);
  }

  const valuesData = await valuesRes.json();
  const rawPlayers = parseSheetData(valuesData.values);
  
  if (rawPlayers.length === 0) {
    throw new Error('No valid player rows found in the specified Google Sheet range.');
  }

  // Append Kickers and Defenses if not present in the Google Sheet
  const hasKicker = rawPlayers.some(p => p.Pos === 'K');
  const hasDefense = rawPlayers.some(p => p.Pos === 'DEF');

  let combined = [...rawPlayers];
  if (!hasKicker || !hasDefense) {
    const nextRankStart = rawPlayers.length + 1;
    const toAppend = defaultKickerAndDefenseOptions
      .filter(opt => (!hasKicker && opt.Pos === 'K') || (!hasDefense && opt.Pos === 'DEF'))
      .map((opt, idx) => ({
        ...opt,
        Player_ID: 9000 + idx,
        Projected_Rank: nextRankStart + idx,
        ECR_Rank: nextRankStart + idx,
      }));
    combined = [...rawPlayers, ...toAppend];
  }

  return combined.map(p => calculateDerivedMetrics(p, combined));
}

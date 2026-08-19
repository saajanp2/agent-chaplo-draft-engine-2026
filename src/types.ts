export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
export type VolatilityRating = 'Low' | 'Medium' | 'High' | 'Extreme';

export interface PlayerRaw {
  Player_ID: number;
  Player_Name: string;
  Pos: Position;
  Team: string;
  Team_2025: string;
  Age: number;
  Last_Depth_Chart: string;
  Yahoo_ADP: number;
  Sleeper_ADP: number;
  ECR_Rank: number;
  Position_Tier: 1 | 2 | 3 | 4 | 5;
  Has_Moved: boolean;
  Sleeper_Tag: string;
  Projected_Rank: number;
  Notable_Description: string;

  // 2025 Actual Statistics
  Actual_Pass_Yds_25?: number;
  Actual_Pass_TD_25?: number;
  Actual_Rush_Yds_25?: number;
  Actual_Rush_TD_25?: number;
  Actual_Rec_25?: number;
  Actual_Rec_Yds_25?: number;
  Actual_Rec_TD_25?: number;
  Actual_Targets_25?: number;
  RZ_Touches_25: number;
  Target_Share_25?: number; // e.g. 0.28 = 28%
  Snap_Share_25?: number; // e.g. 0.82 = 82%
  EPA_Per_Play_25?: number; // e.g. 0.18
  Fantasy_PPG_25?: number; // 2025 PPR PPG

  // 2026 Projected Statistics
  Proj_Pass_Yds_26?: number;
  Proj_Pass_TD_26?: number;
  Proj_Rush_Yds_26?: number;
  Proj_Rush_TD_26?: number;
  Proj_Rec_26?: number;
  Proj_Rec_Yds_26?: number;
  Proj_Rec_TD_26?: number;
  Proj_Targets_26?: number;
  Proj_RZ_Touches_26?: number;
  Proj_Fantasy_Pts_26?: number;
  Proj_PPG_26?: number;
  Floor_PPG_26?: number; // 10th percentile outcome
  Ceiling_PPG_26?: number; // 90th percentile outcome
  Boom_Rate?: number; // % chance of 25+ pt week
  Bust_Rate?: number; // % chance of <8 pt week
  Touch_Equity?: number; // Goal line + target volume weighted
}

export interface DynamicDropoff {
  dropoffPts: number; // Projected points difference to next best available player at position
  dropoffPPG: number; // PPG difference to next best available player at position
  nextPlayerName?: string; // Name of next available player at position
  nextPlayerPPG?: number; // PPG of next available player at position
  posRankAvailable: number; // Rank among currently available players at position (e.g. 1 for best available RB)
  isPosLeader: boolean; // True if #1 available at this position
  tierCliffDropoffPPG?: number; // PPG dropoff to next tier down
}

export interface Player extends PlayerRaw {
  Avg_ADP: number;
  Market_Gap: number; // Avg_ADP - Projected_Rank (positive = undervalued)
  VORP: number; // Value Over Replacement Player (points above baseline starter)
  Championship_Edge_Score: number; // 0-100 composite algorithmic rating
  Volatility: VolatilityRating;
  True_Value_Rank: number;
  Dynamic_Dropoff?: number; // Real-time PPG drop-off vs next available player at position
  dynamicDropoff?: DynamicDropoff; // Detailed dynamic drop-off metrics
}

export interface DraftPick {
  id: number;
  playerId: number;
  round: number;
  pickNumber: number;
  draftedBy: 'user' | 'opponent';
  timestamp: string;
}

export interface DraftSession {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  myTeamIds: number[];
  opponentDraftedIds: number[];
  notes?: string;
}

export interface RosterState {
  QB: Player[];
  RB: Player[];
  WR: Player[];
  TE: Player[];
  FLEX: Player[];
  BENCH: Player[];
}

export interface SheetColumnMapping {
  key: string;
  label: string;
  category: 'Core' | 'Market & ADP' | '2026 Projections' | '2025 Actuals' | 'Advanced Metrics' | 'Actions';
  format?: 'number' | 'decimal' | 'percentage' | 'currency' | 'text' | 'badge';
  description?: string;
  defaultVisible?: boolean;
}

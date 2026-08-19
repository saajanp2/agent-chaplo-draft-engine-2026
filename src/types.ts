export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
export type VolatilityRating = 'Low' | 'Medium' | 'High' | 'Extreme';

export type W1_4_Category = 
  | 'Alpha Target Monsters'
  | 'High-Floor FLEX Anchors'
  | 'Konami/Dual-Threat QBs'
  | 'PPR Pass-Catching Specialists'
  | 'Early Acclimation Ramps'
  | 'Late Target Value Sleepers';

export interface DynamicDropoff {
  dropoffPts: number;
  dropoffPPG: number;
  nextPlayerName?: string;
  nextPlayerPPG?: number;
  posRankAvailable: number;
  isPosLeader: boolean;
  tierCliffDropoffPPG?: number;
}

export interface PlayerRaw {
  Player_ID: number;
  Player_Name: string;
  Pos: Position;
  Team: string;
  Team_2025?: string;
  Age: number;
  Last_Depth_Chart?: string;
  Position_Tier: 1 | 2 | 3 | 4 | 5;
  Yahoo_ADP: number;
  Sleeper_ADP: number;
  ECR_Rank: number;
  Projected_Rank?: number;
  Offline_Draft_Rank?: number;
  VORP?: number;
  POADP_Points_Over_ADP?: number;
  Proj_Fantasy_Pts_2026?: number;
  Proj_Fantasy_Pts_26?: number;
  Proj_PPG_26?: number;
  W1_4_Proj_PPG?: number;
  W1_4_Proj_Total_Pts?: number;
  Primary_Weekly_Opportunity?: string;
  W1_4_Category?: W1_4_Category;
  Sleeper_Tag?: string;
  Volatility?: VolatilityRating;
  Notable_Description?: string;
  Dos_And_Donts?: string;
  Has_Moved?: boolean;
  Boom_Rate?: number;
  Bust_Rate?: number;
  Ceiling_PPG_26?: number;
  Floor_PPG_26?: number;
  RZ_Touches_25?: number;
  Fantasy_PPG_25?: number;
  Snap_Share_25?: number;
  Target_Share_25?: number;
  Touch_Equity?: number;
  EPA_Per_Play_25?: number;
  Actual_Pass_Yds_25?: number;
  Actual_Pass_TD_25?: number;
  Actual_Rush_Yds_25?: number;
  Actual_Rush_TD_25?: number;
  Actual_Rec_25?: number;
  Actual_Rec_Yds_25?: number;
  Actual_Rec_TD_25?: number;
  Actual_Targets_25?: number;
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

export interface Player extends PlayerRaw {
  Player_ID: number;
  Player_Name: string;
  Pos: Position;
  Team: string;
  Team_2025?: string;
  Age: number;
  Position_Tier: 1 | 2 | 3 | 4 | 5;
  Yahoo_ADP: number;
  Sleeper_ADP: number;
  ECR_Rank: number;
  Offline_Draft_Rank?: number;
  VORP: number;
  POADP_Points_Over_ADP?: number; // Points Over ADP Surplus
  Proj_Fantasy_Pts_2026?: number;
  W1_4_Proj_PPG?: number;
  W1_4_Proj_Total_Pts?: number;
  Primary_Weekly_Opportunity?: string;
  W1_4_Category?: W1_4_Category;
  Sleeper_Tag?: string;
  Volatility: VolatilityRating;
  Notable_Description?: string;
  Dos_And_Donts?: string;
  
  // Legacy / Supplemental compatibility
  Avg_ADP?: number;
  Market_Gap?: number;
  Championship_Edge_Score?: number;
  True_Value_Rank?: number;
  Proj_PPG_26?: number;
  Ceiling_PPG_26?: number;
  Floor_PPG_26?: number;
  Boom_Rate?: number;
  Bust_Rate?: number;
  RZ_Touches_25?: number;
  EPA_Per_Play_25?: number;
  Dynamic_Dropoff?: number;
  dynamicDropoff?: DynamicDropoff;
}

export interface TeamConfig {
  id: number; // 1 to 12
  name: string;
  slot: number; // 1 to 12
  isUser: boolean;
  archetype: string;
  colorTheme?: string;
}

export interface DraftPick {
  overallPick: number; // 1 - 180
  round: number; // 1 - 15
  pickInRound: number; // 1 - 12
  teamId: number; // 1 - 12
  teamName: string;
  playerId: number;
  player: Player;
  timestamp: string;
}

export interface LookaheadPrediction {
  pickNumber: number;
  round: number;
  pickInRound: number;
  teamId: number;
  teamName: string;
  archetype: string;
  predictedPlayer: Player;
  reasoning: string;
}

export interface H2HRule {
  id: string;
  title: string;
  winner: string;
  loser: string;
  verdict: string;
  reasoning: string;
  category: 'Elite WR' | 'TE Cheat Code' | 'Dead Zone RB' | 'Konami QB' | 'Flex Target' | 'Kicker & DEF';
}

export type ViewMode = 'grid' | 'warroom' | 'foresight' | 'comparison';

export interface RosterSlots {
  QB?: Player;
  RB1?: Player;
  RB2?: Player;
  WR1?: Player;
  WR2?: Player;
  TE?: Player;
  FLEX1?: Player;
  FLEX2?: Player;
  K?: Player;
  DEF?: Player;
  BENCH: Player[];
}

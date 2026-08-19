import React from 'react';
import { User } from 'firebase/auth';
import { 
  Sheet, 
  RefreshCw, 
  LogIn, 
  LogOut, 
  Trophy, 
  Users, 
  Plus, 
  RotateCcw, 
  FolderOpen,
  Target
} from 'lucide-react';

export interface PresetFilterOption {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon?: string;
  badge?: string;
}

export const DRAFT_PRESETS: PresetFilterOption[] = [
  { 
    id: 'all', 
    label: 'All Players', 
    shortLabel: 'All', 
    description: 'Complete 2026 database with full projected ranks and live market ADP.' 
  },
  { 
    id: 'team_need', 
    label: '🎯 Team Need (Smart Best Fit)', 
    shortLabel: '🎯 Team Need', 
    description: 'Dynamically prioritizes players filling your immediate starting roster holes & greatest positional gaps.',
    badge: 'AI RECOMMENDATION'
  },
  { 
    id: 'phase_auto', 
    label: '⚡ Current Draft Phase (Auto)', 
    shortLabel: '⚡ Auto Phase', 
    description: 'Dynamically shifts focus based on current draft round (Anchors -> Core Starters -> Market Gaps -> Sleepers).' 
  },
  { 
    id: 'phase_early', 
    label: '🛡️ Phase 1: Anchors (R1–3)', 
    shortLabel: '🛡️ Phase 1 (R1-3)', 
    description: 'Foundation elite assets: bellcow RBs, alpha WR1s, and tier-1 dual-threat QBs.' 
  },
  { 
    id: 'phase_mid', 
    label: '⚔️ Phase 2: Core Starters (R4–7)', 
    shortLabel: '⚔️ Phase 2 (R4-7)', 
    description: 'VORP maximizers: High-volume WR2s, starting RBs, and top-tier tight ends.' 
  },
  { 
    id: 'phase_late', 
    label: '🎯 Phase 3: Market Gaps (R8–11)', 
    shortLabel: '🎯 Phase 3 (R8-11)', 
    description: 'ADP Arbitrage: Target share and red-zone dominators undervalued by Yahoo/Sleeper.' 
  },
  { 
    id: 'phase_deep', 
    label: '💎 Phase 4: Sleepers (R12+)', 
    shortLabel: '💎 Phase 4 (R12+)', 
    description: 'Late-round league winners, handcuff bellcows, and massive market gaps (+10 ADP).' 
  },
  { 
    id: 'high_gap', 
    label: '📈 Market Arbitrage (+10 Gap)', 
    shortLabel: '📈 Market Gaps', 
    description: 'Players significantly underpriced by Yahoo and Sleeper relative to true predictive value.' 
  },
  { 
    id: 'max_ppg', 
    label: '⚡ Max Weekly Points (16+ PPG)', 
    shortLabel: '⚡ Max PPG', 
    description: 'Highest raw projected weekly fantasy points calibrated for 6-pt Pass TD, Half-PPR, and 2-FLEX starting slots.' 
  },
  { 
    id: 'high_edge', 
    label: '🔥 Championship Edge (70+)', 
    shortLabel: '🔥 High Edge', 
    description: 'Highest overall composite rating combining VORP, market gap, and ceiling equity.' 
  },
  { 
    id: 'high_vorp', 
    label: '👑 Top VORP Dominators (40+)', 
    shortLabel: '👑 Top VORP', 
    description: 'Players offering the largest raw points advantage above baseline positional starters.' 
  },
  { 
    id: 'high_dropoff', 
    label: '⚡ Positional Cliffs (1.5+ PPG Drop-off)', 
    shortLabel: '⚡ Positional Cliffs', 
    description: 'Dynamic drop-off: Players with the steepest projected point loss to the next available option on the live board.' 
  },
  { 
    id: 'high_ceiling', 
    label: '🚀 90th% Ceilings (20+ PPG)', 
    shortLabel: '🚀 20+ PPG Ceiling', 
    description: 'Explosive ceiling targets capable of individual week-winning spike weeks.' 
  },
  { 
    id: 'red_zone', 
    label: '🎯 Red Zone Monsters (18+ Touches)', 
    shortLabel: '🎯 RZ Monsters', 
    description: 'High-leverage goal line touches and red zone target dominators.' 
  },
];

interface NavbarProps {
  user: User | null;
  isLoggingIn: boolean;
  isSyncing: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSyncModal: () => void;
  onSyncLiveSheet?: () => void;
  onOpenDraftRoom: () => void;
  onOpenSessionModal: () => void;
  onStartNewDraft: () => void;
  onHardRefresh: () => void;
  savedSessionsCount: number;
  myTeamCount: number;
  activeFilterPreset: string;
  onSelectFilterPreset: (preset: string) => void;
  currentDraftPhaseName?: string;
  currentTeamNeedName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isLoggingIn,
  isSyncing,
  onLogin,
  onLogout,
  onOpenSyncModal,
  onSyncLiveSheet,
  onOpenDraftRoom,
  onOpenSessionModal,
  onStartNewDraft,
  onHardRefresh,
  savedSessionsCount,
  myTeamCount,
  activeFilterPreset,
  onSelectFilterPreset,
  currentDraftPhaseName,
  currentTeamNeedName,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-[1600px] w-full flex-col gap-2.5 px-3 py-2.5 sm:px-5 lg:px-6">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30">
              <Trophy className="h-4.5 w-4.5 text-neutral-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-base sm:text-lg font-bold tracking-tight text-neutral-100">
                  2026 Fantasy Data Engine
                </h1>
                <span className="inline-flex items-center rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-inset ring-amber-500/25">
                  CHAMPIONSHIP V2.5
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Predictive Analytics, Positional Scarcity & Cross-Market Inefficiencies
              </p>
            </div>
          </div>

          {/* Action Center: Google Sheets + Draft Controls + My Team */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Start New Draft Button */}
            <button
              id="btn-new-draft"
              onClick={onStartNewDraft}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/40 hover:bg-indigo-600/30 transition-all shadow-sm"
              title="Start a new clean draft (archives current draft)"
            >
              <Plus className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">New Draft</span>
            </button>

            {/* Saved Draft Sessions & Hard Refresh Modal Button */}
            <button
              id="btn-draft-sessions"
              onClick={onOpenSessionModal}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-neutral-300 ring-1 ring-neutral-700/60 hover:bg-neutral-800 transition-all"
              title="Manage Saved Drafts & Hard Refresh"
            >
              <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline">Drafts</span>
              {savedSessionsCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500/25 px-1 text-[9px] font-bold text-amber-300 ring-1 ring-amber-500/30">
                  {savedSessionsCount}
                </span>
              )}
            </button>

            {/* Quick Hard Refresh Button */}
            <button
              id="btn-hard-refresh"
              onClick={onHardRefresh}
              className="flex items-center gap-1 rounded-lg bg-neutral-900 px-2 py-1.5 text-xs font-medium text-neutral-400 ring-1 ring-neutral-700/60 hover:bg-neutral-800 hover:text-amber-300 transition-all"
              title="Hard Refresh Master Dataset & Cache"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden lg:inline text-[11px]">Hard Refresh</span>
            </button>

            {/* Draft War Room Open */}
            <button
              id="btn-open-draft-war-room"
              onClick={onOpenDraftRoom}
              className="flex items-center gap-2 rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/30 hover:bg-rose-500/25 transition-all shadow-sm"
            >
              <div className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-rose-500/40 animate-pulse" />
              <span>WAR ROOM</span>
            </button>

            {/* My Roster Quick Pill */}
            <button
              id="btn-toggle-roster"
              onClick={onOpenDraftRoom}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 ring-1 ring-neutral-700/60 hover:bg-neutral-800 transition-all"
            >
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span>Roster:</span>
              <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-indigo-500/25 px-1 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-500/30">
                {myTeamCount}/15
              </span>
            </button>

            {/* Google Sheets Connection Pill */}
            <div className="flex items-center rounded-lg bg-neutral-900 p-0.5 ring-1 ring-neutral-700/60">
              <button
                id="btn-open-sheet-modal"
                onClick={onOpenSyncModal}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
                title="Configure Google Sheet Link"
              >
                <Sheet className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Google Sheet</span>
              </button>

              {user && onSyncLiveSheet && (
                <button
                  id="btn-sync-live-sheet"
                  onClick={onSyncLiveSheet}
                  disabled={isSyncing}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                  title="Sync live spreadsheet updates"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden md:inline">Sync</span>
                </button>
              )}

              {user ? (
                <button
                  id="btn-google-logout"
                  onClick={onLogout}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-all"
                  title={`Signed in as ${user.email}`}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  id="btn-google-signin"
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/25 transition-all"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>{isLoggingIn ? 'Connecting...' : 'Connect Sheet'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preset Quick Filters Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 pt-0.5 no-scrollbar">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400 whitespace-nowrap">
            <Target className="h-3 w-3 text-indigo-400" />
            <span>Draft Presets:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {DRAFT_PRESETS.map((preset) => {
              const isActive = activeFilterPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  onClick={() => onSelectFilterPreset(preset.id)}
                  title={preset.description}
                  className={`group relative whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-950 font-bold shadow-md shadow-neutral-950/20 ring-1 ring-white'
                      : 'bg-neutral-900/90 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 ring-1 ring-neutral-700/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{preset.label}</span>
                    {preset.badge && (
                      <span className={`rounded px-1 py-0.2 text-[9px] font-extrabold uppercase ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {preset.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};


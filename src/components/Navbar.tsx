import React from 'react';
import { 
  Trophy, 
  Settings, 
  RotateCcw, 
  Undo2, 
  Download, 
  Clock, 
  Grid, 
  Users, 
  Sparkles, 
  Scale, 
  CheckCircle2 
} from 'lucide-react';
import { TeamConfig, ViewMode } from '../types';

interface NavbarProps {
  currentPickIndex: number; // 0 to 179
  activeTeam: TeamConfig;
  userTeam: TeamConfig;
  currentRound: number; // 1 to 15
  pickInRound: number; // 1 to 12
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  comparedCount: number;
  onOpenDraftOrderModal: () => void;
  onUndoPick: () => void;
  canUndo: boolean;
  onResetDraft: () => void;
  onExportCSV: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPickIndex,
  activeTeam,
  userTeam,
  currentRound,
  pickInRound,
  currentView,
  onSelectView,
  comparedCount,
  onOpenDraftOrderModal,
  onUndoPick,
  canUndo,
  onResetDraft,
  onExportCSV,
}) => {
  const isDraftComplete = currentPickIndex >= 180;
  const overallPickNumber = Math.min(180, currentPickIndex + 1);
  const progressPercent = Math.round((currentPickIndex / 180) * 100);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-xl transition-all shadow-xl">
      <div className="mx-auto flex max-w-[1600px] w-full flex-col gap-2.5 px-3 py-2.5 sm:px-5 lg:px-6">
        {/* Row 1: Logo & Branding + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & League Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30">
              <Trophy className="h-4.5 w-4.5 text-neutral-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-base sm:text-lg font-bold tracking-tight text-neutral-100">
                  Agent Chaplo 2026
                </h1>
                <span className="inline-flex items-center rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-inset ring-amber-500/25">
                  BROWN BALLERS LIVE
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                12 Teams • 0.5 PPR • 6-pt Pass TD • 2 FLEX • 15 Rounds (180 Picks)
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Draft Order Modal */}
            <button
              id="btn-draft-order"
              onClick={onOpenDraftOrderModal}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all shadow-sm"
              title="Customize 12-team draft slots & order"
            >
              <Settings className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Draft Order</span>
            </button>

            {/* Undo Pick */}
            <button
              id="btn-undo-pick"
              onClick={onUndoPick}
              disabled={!canUndo}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Undo last pick made"
            >
              <Undo2 className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Undo</span>
            </button>

            {/* Reset Draft */}
            <button
              id="btn-reset-draft"
              onClick={onResetDraft}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-rose-400 transition-all shadow-sm"
              title="Reset live draft board"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>

            {/* Export CSV */}
            <button
              id="btn-export-csv"
              onClick={onExportCSV}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 hover:text-white transition-all shadow-sm"
              title="Export completed picks to CSV file"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Row 2: Live On-The-Clock Status Banner + View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-neutral-800/80 pt-2">
          {/* On-The-Clock Banner */}
          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            {!isDraftComplete ? (
              <div className="flex items-center gap-2 rounded-xl bg-amber-950/40 border border-amber-500/40 px-3 py-1 text-xs">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                <div className="flex items-center gap-2">
                  <span className="font-extrabold uppercase tracking-wider text-amber-300">
                    ON CLOCK:
                  </span>
                  <strong className="text-white font-serif text-sm truncate">
                    {activeTeam.name}
                  </strong>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.2 font-mono text-[10px] font-bold text-amber-400">
                    Slot #{activeTeam.slot}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 px-3 py-1 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="font-bold">180/180 Picks Complete! Draft Finished.</span>
              </div>
            )}

            {/* My Team Slot Indicator */}
            <div className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold ring-1 ${
              activeTeam.id === userTeam.id
                ? 'bg-amber-500 text-neutral-950 ring-amber-400 animate-pulse shadow-md shadow-amber-500/30'
                : 'bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 ring-indigo-500/20'
            }`}>
              <span>★ My Slot: #{userTeam.slot}</span>
              {activeTeam.id === userTeam.id && (
                <span className="bg-neutral-950 text-amber-400 px-1.5 py-0.2 rounded text-[10px] font-black">
                  YOUR PICK!
                </span>
              )}
            </div>

            {/* Round & Pick Telemetry */}
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="font-mono font-bold text-neutral-200">
                Round {currentRound} • Pick {pickInRound}
              </span>
              <span className="text-neutral-600">|</span>
              <span className="font-mono text-neutral-400">
                Overall #{overallPickNumber} / 180 ({progressPercent}%)
              </span>
            </div>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              id="tab-view-grid"
              onClick={() => onSelectView('grid')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                currentView === 'grid'
                  ? 'bg-neutral-100 text-neutral-950 font-bold shadow-md shadow-neutral-950/30'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>📊 Master Grid</span>
            </button>

            <button
              id="tab-view-warroom"
              onClick={() => onSelectView('warroom')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                currentView === 'warroom'
                  ? 'bg-neutral-100 text-neutral-950 font-bold shadow-md shadow-neutral-950/30'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>🏟️ War Room</span>
            </button>

            <button
              id="tab-view-foresight"
              onClick={() => onSelectView('foresight')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                currentView === 'foresight'
                  ? 'bg-neutral-100 text-neutral-950 font-bold shadow-md shadow-neutral-950/30'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>🔮 AI Foresight</span>
            </button>

            <button
              id="tab-view-comparison"
              onClick={() => onSelectView('comparison')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                currentView === 'comparison'
                  ? 'bg-neutral-100 text-neutral-950 font-bold shadow-md shadow-neutral-950/30'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Scale className="h-3.5 w-3.5 text-amber-400" />
              <span>⚖️ Compare</span>
              {comparedCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-extrabold text-neutral-950">
                  {comparedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

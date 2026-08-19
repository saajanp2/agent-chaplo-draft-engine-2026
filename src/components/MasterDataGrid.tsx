import React, { useState, useMemo } from 'react';
import { Player, Position, SheetColumnMapping } from '../types';
import { 
  Search, ArrowUpDown, ArrowUp, ArrowDown, Eye, SlidersHorizontal, 
  Sparkles, Check, Plus, UserX, ChevronDown, ChevronUp, ChevronsUpDown, Scale, Info, ShieldAlert,
  Flame, TrendingUp, Target, Zap, RotateCcw, Layers, Maximize2, Minimize2
} from 'lucide-react';
import { DRAFT_PRESETS } from './Navbar';

interface MasterDataGridProps {
  players: Player[];
  myTeamIds: Set<number>;
  opponentDraftedIds: Set<number>;
  comparisonIds: Set<number>;
  onDraftPlayer: (player: Player) => void;
  onOpponentDraftPlayer: (player: Player) => void;
  onToggleCompare: (player: Player) => void;
  onSelectPlayer: (player: Player) => void;
  selectedPos: string;
  onSelectPos: (pos: string) => void;
  activeFilterPreset?: string;
  onSelectFilterPreset?: (preset: string) => void;
  currentDraftPhaseName?: string;
  currentTeamNeedName?: string;
  strategyTip?: string;
}

export const ALL_COLUMNS: SheetColumnMapping[] = [
  { key: 'Projected_Rank', label: 'True Rank', category: 'Core', defaultVisible: true },
  { key: 'Player_Name', label: 'Player & Profile', category: 'Core', defaultVisible: true },
  { key: 'Championship_Edge_Score', label: 'Edge Score', category: 'Advanced Metrics', defaultVisible: true },
  { key: 'Market_Gap', label: 'Market Gap', category: 'Market & ADP', defaultVisible: true },
  { key: 'Avg_ADP', label: 'Avg ADP', category: 'Market & ADP', defaultVisible: true },
  { key: 'VORP', label: 'VORP', category: 'Advanced Metrics', defaultVisible: true, description: 'Season Value Over Replacement Player vs baseline starter (QB12/RB24/WR36/TE12)' },
  { key: 'Dynamic_Dropoff', label: 'Next Drop-off', category: 'Advanced Metrics', defaultVisible: true, description: 'Live drop-off (PPG) to next best available player at this position on the live board' },
  { key: 'Proj_PPG_26', label: "'26 Proj PPG", category: '2026 Projections', defaultVisible: true },
  { key: 'Ceiling_PPG_26', label: '90% Ceiling', category: '2026 Projections', defaultVisible: true },
  { key: 'RZ_Touches_25', label: "'25 RZ Touches", category: '2025 Actuals', defaultVisible: true },
  { key: 'Pos', label: 'Pos (Standalone)', category: 'Core', defaultVisible: false },
  { key: 'Team', label: 'Team (Standalone)', category: 'Core', defaultVisible: false },
  { key: 'Position_Tier', label: 'Tier (Standalone)', category: 'Core', defaultVisible: false },
  { key: 'Sleeper_Tag', label: 'Archetype (Standalone)', category: 'Core', defaultVisible: false },
  { key: 'Yahoo_ADP', label: 'Yahoo ADP', category: 'Market & ADP', defaultVisible: false },
  { key: 'Sleeper_ADP', label: 'Sleeper ADP', category: 'Market & ADP', defaultVisible: false },
  { key: 'ECR_Rank', label: 'ECR Rank', category: 'Market & ADP', defaultVisible: false },
  { key: 'Floor_PPG_26', label: '10% Floor', category: '2026 Projections', defaultVisible: false },
  { key: 'Proj_Fantasy_Pts_26', label: "'26 Proj Total", category: '2026 Projections', defaultVisible: false },
  { key: 'Boom_Rate', label: 'Boom %', category: '2026 Projections', defaultVisible: false },
  { key: 'Bust_Rate', label: 'Bust %', category: '2026 Projections', defaultVisible: false },
  { key: 'Fantasy_PPG_25', label: "'25 Actual PPG", category: '2025 Actuals', defaultVisible: false },
  { key: 'Target_Share_25', label: "'25 Tgt Share", category: '2025 Actuals', defaultVisible: false },
  { key: 'EPA_Per_Play_25', label: "'25 EPA/Play", category: '2025 Actuals', defaultVisible: false },
  { key: 'Volatility', label: 'Volatility', category: 'Advanced Metrics', defaultVisible: false },
  { key: 'Age', label: 'Age', category: 'Core', defaultVisible: false },
];

export const MasterDataGrid: React.FC<MasterDataGridProps> = ({
  players,
  myTeamIds,
  opponentDraftedIds,
  comparisonIds,
  onDraftPlayer,
  onOpponentDraftPlayer,
  onToggleCompare,
  onSelectPlayer,
  selectedPos,
  onSelectPos,
  activeFilterPreset = 'all',
  onSelectFilterPreset,
  currentDraftPhaseName,
  currentTeamNeedName,
  strategyTip,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('Projected_Rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [expandedPlayerIds, setExpandedPlayerIds] = useState<Set<number>>(new Set());
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [hideDrafted, setHideDrafted] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(ALL_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key))
  );

  // Position filter tabs
  const posTabs = ['ALL', 'QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'];

  // Active preset metadata
  const currentPresetMeta = useMemo(() => {
    return DRAFT_PRESETS.find((p) => p.id === activeFilterPreset) || DRAFT_PRESETS[0];
  }, [activeFilterPreset]);

  // Handle Column Sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // default descending for higher-is-better metrics
      const descFields = ['Championship_Edge_Score', 'Market_Gap', 'VORP', 'Dynamic_Dropoff', 'Proj_PPG_26', 'Ceiling_PPG_26', 'Proj_Fantasy_Pts_26', 'RZ_Touches_25', 'Fantasy_PPG_25', 'Target_Share_25', 'EPA_Per_Play_25', 'Boom_Rate'];
      setSortAsc(!descFields.includes(field));
    }
  };

  // Toggle Column Visibility
  const toggleColumn = (key: string) => {
    const next = new Set(visibleColumns);
    if (next.has(key)) {
      if (next.size > 2) next.delete(key);
    } else {
      next.add(key);
    }
    setVisibleColumns(next);
  };

  // Toggle single row expansion
  const toggleExpandPlayer = (playerId: number) => {
    setExpandedPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  // Filtered & Sorted Players
  const processedPlayers = useMemo(() => {
    return players
      .filter((player) => {
        // Hide drafted if enabled
        if (hideDrafted) {
          const isDrafted = myTeamIds.has(player.Player_ID) || opponentDraftedIds.has(player.Player_ID);
          if (isDrafted) return false;
        }

        // Position filter
        if (selectedPos === 'FLEX') {
          if (!['RB', 'WR', 'TE'].includes(player.Pos)) return false;
        } else if (selectedPos !== 'ALL' && player.Pos !== selectedPos) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = player.Player_Name.toLowerCase().includes(q) || 
            (q.includes('daxson') && player.Player_Name.toLowerCase().includes('dart')) ||
            (q.includes('jaxson') && player.Player_Name.toLowerCase().includes('dart'));
          
          const matchTeam = player.Team.toLowerCase().includes(q) ||
            (q === 'giants' && player.Team === 'NYG') ||
            (q === 'jets' && player.Team === 'NYJ') ||
            (q === 'raiders' && player.Team === 'LV') ||
            (q === 'bills' && player.Team === 'BUF') ||
            (q === 'cowboys' && player.Team === 'DAL');

          const matchTag = player.Sleeper_Tag.toLowerCase().includes(q);
          const matchDesc = player.Notable_Description.toLowerCase().includes(q);
          const matchPos = player.Pos.toLowerCase() === q;
          
          if (!matchName && !matchTeam && !matchTag && !matchDesc && !matchPos) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = (a as any)[sortField];
        let valB = (b as any)[sortField];

        if (valA === undefined || valA === null) valA = sortAsc ? Infinity : -Infinity;
        if (valB === undefined || valB === null) valB = sortAsc ? Infinity : -Infinity;

        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [players, selectedPos, searchQuery, sortField, sortAsc, hideDrafted, myTeamIds, opponentDraftedIds]);

  // Expand / Collapse All Handler
  const areAllExpanded = processedPlayers.length > 0 && processedPlayers.every((p) => expandedPlayerIds.has(p.Player_ID));

  const handleToggleExpandAll = () => {
    if (areAllExpanded) {
      setExpandedPlayerIds(new Set());
    } else {
      setExpandedPlayerIds(new Set(processedPlayers.map((p) => p.Player_ID)));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Strategic Draft Phase & Need Banner */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-neutral-900/90 via-indigo-950/40 to-neutral-900/90 p-3.5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40">
              {activeFilterPreset === 'team_need' ? (
                <Target className="h-5 w-5 text-amber-400" />
              ) : activeFilterPreset.startsWith('phase') ? (
                <Zap className="h-5 w-5 text-indigo-400" />
              ) : activeFilterPreset === 'high_gap' ? (
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              ) : (
                <Layers className="h-5 w-5 text-indigo-300" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-serif text-sm font-bold text-neutral-100">
                  {currentPresetMeta.label}
                </span>
                {activeFilterPreset !== 'all' && (
                  <span className="inline-flex items-center rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-500/30">
                    ACTIVE FILTER
                  </span>
                )}
                {currentTeamNeedName && (
                  <span className="inline-flex items-center rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-500/25">
                    Need: {currentTeamNeedName}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-neutral-300 leading-relaxed">
                {strategyTip || currentPresetMeta.description}
              </p>
            </div>
          </div>

          {/* Quick Preset Action Switcher inside Grid */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onSelectFilterPreset && (
              <div className="flex items-center gap-1 rounded-lg bg-neutral-950/80 p-1 ring-1 ring-neutral-800">
                <button
                  id="grid-preset-team-need"
                  onClick={() => onSelectFilterPreset('team_need')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                    activeFilterPreset === 'team_need'
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Target your greatest starting roster holes"
                >
                  🎯 Team Need
                </button>

                <button
                  id="grid-preset-phase-auto"
                  onClick={() => onSelectFilterPreset('phase_auto')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                    activeFilterPreset === 'phase_auto'
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Auto-switch based on draft round"
                >
                  ⚡ Auto Phase
                </button>

                {activeFilterPreset !== 'all' && (
                  <button
                    id="grid-preset-reset-all"
                    onClick={() => onSelectFilterPreset('all')}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-all"
                    title="View all players"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            )}

            <div className="text-right">
              <span className="font-mono text-xs font-bold text-emerald-400 block">
                {processedPlayers.length} Targets
              </span>
              <span className="text-[10px] text-neutral-400">
                in active view
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Pos Tabs, Expand All, Columns Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-2.5 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            id="input-player-search"
            type="text"
            placeholder="Search player, team, tag, scheme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-700/60 bg-neutral-950/80 py-1.5 pl-8 pr-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-indigo-500/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Position Filter Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-neutral-950/80 p-1 ring-1 ring-neutral-800">
          {posTabs.map((pos) => {
            const isActive = selectedPos === pos;
            return (
              <button
                key={pos}
                id={`tab-pos-${pos}`}
                onClick={() => onSelectPos(pos)}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {pos}
              </button>
            );
          })}
        </div>

        {/* Action Controls: Expand All, Available Only, Customize Columns */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Global Expand / Collapse All Details Button */}
          <button
            id="btn-expand-all-details"
            onClick={handleToggleExpandAll}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              areAllExpanded
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40 font-semibold'
                : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700 ring-1 ring-neutral-700/60'
            }`}
            title="Expand in-depth scouting, ranges, and tactical metrics for all players"
          >
            {areAllExpanded ? (
              <>
                <Minimize2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Expand All ({processedPlayers.length})</span>
              </>
            )}
          </button>

          {/* Hide Drafted / Taken Toggle */}
          <button
            id="btn-toggle-hide-drafted"
            onClick={() => setHideDrafted(!hideDrafted)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              hideDrafted
                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 ring-1 ring-neutral-700/60'
            }`}
            title="Toggle visibility of already drafted players"
          >
            <UserX className="h-3.5 w-3.5" />
            <span>{hideDrafted ? 'Available' : 'All'}</span>
          </button>

          {/* Column Configuration Trigger */}
          <button
            id="btn-column-config"
            onClick={() => setShowColumnConfig(!showColumnConfig)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              showColumnConfig
                ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 ring-1 ring-neutral-700/60'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Cols ({visibleColumns.size})</span>
          </button>
        </div>
      </div>

      {/* Column Visibility Manager Modal / Drawer */}
      {showColumnConfig && (
        <div className="rounded-xl border border-indigo-500/30 bg-neutral-900/95 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h4 className="font-serif text-sm font-bold text-neutral-100">
                Display & Analysis Metrics
              </h4>
              <p className="text-xs text-neutral-400">
                Select columns to display in your active draft engine grid.
              </p>
            </div>
            <button
              onClick={() => setShowColumnConfig(false)}
              className="rounded px-2 py-1 text-xs text-neutral-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {ALL_COLUMNS.map((col) => {
              const isChecked = visibleColumns.has(col.key);
              return (
                <label
                  key={col.key}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs transition-all ${
                    isChecked
                      ? 'bg-indigo-950/40 text-indigo-200 ring-1 ring-indigo-500/40 font-semibold'
                      : 'bg-neutral-950/40 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleColumn(col.key)}
                    className="h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-900 text-indigo-500 focus:ring-0"
                  />
                  <span>{col.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Master Data Grid Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-950/90 shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/90 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {/* 1. Expand / Details Column Header */}
                <th className="py-2 px-2 w-9 text-center">
                  <button
                    onClick={handleToggleExpandAll}
                    title="Toggle Expand/Collapse All"
                    className="p-0.5 hover:text-neutral-100 transition-colors"
                  >
                    <ChevronsUpDown className="h-3.5 w-3.5 mx-auto" />
                  </button>
                </th>

                {/* 2. Actions Column Header (FIRST COLUMN) */}
                <th className="py-2 px-2.5 whitespace-nowrap text-left w-32">
                  Quick Actions
                </th>
                
                {/* 3. Visible Data Metric Headers */}
                {ALL_COLUMNS.filter((col) => visibleColumns.has(col.key)).map((col) => {
                  const isSorted = sortField === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="cursor-pointer whitespace-nowrap py-2 px-2.5 transition-colors hover:text-neutral-100 select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        {isSorted ? (
                          sortAsc ? (
                            <ArrowUp className="h-3 w-3 text-indigo-400" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-indigo-400" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-neutral-800/60 font-medium">
              {processedPlayers.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.size + 2}
                    className="py-12 text-center text-neutral-400"
                  >
                    No players found matching your filters.
                  </td>
                </tr>
              ) : (
                processedPlayers.map((player) => {
                  const isMyTeam = myTeamIds.has(player.Player_ID);
                  const isOpponentDrafted = opponentDraftedIds.has(player.Player_ID);
                  const isCompared = comparisonIds.has(player.Player_ID);
                  const isExpanded = expandedPlayerIds.has(player.Player_ID);

                  // Position styling
                  const posBadgeStyle =
                    player.Pos === 'RB'
                      ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40'
                      : player.Pos === 'WR'
                      ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                      : player.Pos === 'TE'
                      ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40';

                  // Row background state
                  let rowBgClass = 'hover:bg-neutral-900/70 transition-colors';
                  if (isMyTeam) rowBgClass = 'bg-indigo-950/30 border-l-2 border-indigo-500';
                  else if (isOpponentDrafted) rowBgClass = 'bg-neutral-950/40 opacity-40 grayscale';

                  return (
                    <React.Fragment key={player.Player_ID}>
                      <tr
                        id={`player-row-${player.Player_ID}`}
                        className={`group ${rowBgClass}`}
                      >
                        {/* 1. Row Index / Expand toggle */}
                        <td className="py-2.5 px-2 text-center text-neutral-500 align-middle">
                          <button
                            onClick={() => toggleExpandPlayer(player.Player_ID)}
                            className="flex h-6 w-6 items-center justify-center rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all mx-auto"
                            title="Toggle player scouting & breakdown"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-amber-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 opacity-60 group-hover:opacity-100" />
                            )}
                          </button>
                        </td>

                        {/* 2. Action Buttons (NOW FIRST COLUMN) */}
                        <td className="py-2 px-2.5 text-left whitespace-nowrap align-middle">
                          <div className="flex items-center gap-1.5">
                            {!isMyTeam && !isOpponentDrafted ? (
                              <>
                                {/* Primary Draft Button */}
                                <button
                                  id={`btn-draft-${player.Player_ID}`}
                                  onClick={() => onDraftPlayer(player)}
                                  className="flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95"
                                  title="Draft to your squad"
                                >
                                  <Plus className="h-3.5 w-3.5 stroke-[3]" />
                                  <span>Draft</span>
                                </button>

                                {/* Opponent Pick */}
                                <button
                                  id={`btn-opponent-draft-${player.Player_ID}`}
                                  onClick={() => onOpponentDraftPlayer(player)}
                                  className="rounded-md bg-neutral-800/90 p-1 text-neutral-400 hover:bg-neutral-700 hover:text-rose-400 transition-all ring-1 ring-neutral-700/60"
                                  title="Mark drafted by opponent"
                                >
                                  <UserX className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : isMyTeam ? (
                              <button
                                onClick={() => onDraftPlayer(player)}
                                className="rounded-md bg-indigo-500/25 px-2 py-0.5 text-[11px] font-bold text-indigo-300 hover:bg-rose-500/20 hover:text-rose-300 transition-all ring-1 ring-indigo-500/40"
                                title="Click to undo draft pick"
                              >
                                Drafted (Undo)
                              </button>
                            ) : (
                              <button
                                onClick={() => onOpponentDraftPlayer(player)}
                                className="rounded-md bg-neutral-800 px-2 py-0.5 text-[11px] font-medium text-neutral-400 hover:text-neutral-200"
                                title="Click to undo opponent draft"
                              >
                                Opponent (Undo)
                              </button>
                            )}

                            {/* Compare Toggle */}
                            <button
                              id={`btn-compare-${player.Player_ID}`}
                              onClick={() => onToggleCompare(player)}
                              className={`rounded-md p-1 transition-all ${
                                isCompared
                                  ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                              }`}
                              title="Compare head-to-head"
                            >
                              <Scale className="h-3.5 w-3.5" />
                            </button>

                            {/* Deep Dive Modal */}
                            <button
                              id={`btn-details-${player.Player_ID}`}
                              onClick={() => onSelectPlayer(player)}
                              className="rounded-md p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
                              title="Open player dossier drawer"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* 3. Visible Data Cells */}
                        {ALL_COLUMNS.filter((col) => visibleColumns.has(col.key)).map((col) => {
                          const val = (player as any)[col.key];

                          // Custom Player Cell with Integrated Chips (POS, TEAM, TIER, ARCHETYPE)
                          if (col.key === 'Player_Name') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap align-middle">
                                <div className="flex flex-col gap-1">
                                  {/* Top Line: Name & Status */}
                                  <div className="flex items-center gap-2">
                                    <span
                                      onClick={() => onSelectPlayer(player)}
                                      className="cursor-pointer font-serif text-sm font-bold text-neutral-100 hover:text-indigo-400 transition-colors"
                                    >
                                      {player.Player_Name}
                                    </span>

                                    {isMyTeam && (
                                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-extrabold text-indigo-300 ring-1 ring-indigo-500/30">
                                        MY TEAM
                                      </span>
                                    )}
                                    {isOpponentDrafted && (
                                      <span className="rounded bg-neutral-800 px-1.5 py-0.2 text-[9px] font-bold text-neutral-400">
                                        DRAFTED
                                      </span>
                                    )}
                                  </div>

                                  {/* Bottom Line: Consolidated Chips for POS, TEAM, TIER, ARCHETYPE */}
                                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                    {/* Position Chip */}
                                    <span className={`rounded px-1.5 py-0.2 font-black ${posBadgeStyle}`}>
                                      {player.Pos}
                                    </span>

                                    {/* Team Chip */}
                                    <span className="rounded bg-neutral-800/90 px-1.5 py-0.2 font-bold text-neutral-200 ring-1 ring-neutral-700/50">
                                      {player.Team}
                                    </span>

                                    {/* Tier Chip */}
                                    <span className={`rounded px-1.5 py-0.2 font-bold ${
                                      player.Position_Tier === 1
                                        ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
                                        : player.Position_Tier === 2
                                        ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
                                        : 'bg-neutral-800 text-neutral-400'
                                    }`}>
                                      Tier {player.Position_Tier}
                                    </span>

                                    {/* Archetype / Sleeper Tag Chip */}
                                    {player.Sleeper_Tag && (
                                      <span className="rounded bg-neutral-900/90 px-1.5 py-0.2 text-neutral-300 ring-1 ring-neutral-800 truncate max-w-[150px]">
                                        {player.Sleeper_Tag}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                            );
                          }

                          if (col.key === 'Projected_Rank') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap font-mono align-middle">
                                <span className={`font-bold ${
                                  player.Projected_Rank <= 12
                                    ? 'text-amber-400 font-extrabold'
                                    : player.Projected_Rank <= 36
                                    ? 'text-indigo-300'
                                    : 'text-neutral-300'
                                }`}>
                                  #{player.Projected_Rank}
                                </span>
                              </td>
                            );
                          }

                          if (col.key === 'Championship_Edge_Score') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap align-middle">
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-9 rounded-full bg-neutral-800 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
                                      style={{ width: `${Math.min(100, player.Championship_Edge_Score)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-xs font-bold text-emerald-400">
                                    {player.Championship_Edge_Score}
                                  </span>
                                </div>
                              </td>
                            );
                          }

                          if (col.key === 'Market_Gap') {
                            const isPositive = player.Market_Gap > 0;
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap align-middle">
                                <span
                                  className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-xs font-bold ${
                                    isPositive
                                      ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                                      : 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30'
                                  }`}
                                >
                                  {isPositive ? `+${player.Market_Gap}` : player.Market_Gap}
                                </span>
                              </td>
                            );
                          }

                          if (col.key === 'Avg_ADP') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap font-mono text-neutral-300 align-middle">
                                {player.Avg_ADP || '-'}
                              </td>
                            );
                          }

                          if (col.key === 'VORP') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap font-mono align-middle" title="Season VORP vs fixed baseline starter">
                                <span
                                  className={`font-bold ${
                                    player.VORP > 50
                                      ? 'text-indigo-400'
                                      : player.VORP > 20
                                      ? 'text-indigo-300'
                                      : 'text-neutral-400'
                                  }`}
                                >
                                  {player.VORP > 0 ? `+${player.VORP}` : player.VORP}
                                </span>
                              </td>
                            );
                          }

                          if (col.key === 'Dynamic_Dropoff') {
                            const drop = player.Dynamic_Dropoff || 0;
                            const isDrafted = myTeamIds.has(player.Player_ID) || opponentDraftedIds.has(player.Player_ID);
                            if (isDrafted) {
                              return (
                                <td key={col.key} className="py-2 px-2.5 whitespace-nowrap font-mono text-neutral-600 align-middle">
                                  -
                                </td>
                              );
                            }
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap font-mono align-middle">
                                {drop > 0 ? (
                                  <div className="flex items-center gap-1.5" title={player.dynamicDropoff?.nextPlayerName ? `+${drop} PPG over next ${player.Pos}: ${player.dynamicDropoff.nextPlayerName} (${player.dynamicDropoff.nextPlayerPPG} PPG)` : 'Next available at position'}>
                                    <span
                                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${
                                        drop >= 2.5
                                          ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30 font-extrabold'
                                          : drop >= 1.2
                                          ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30'
                                          : 'bg-neutral-800 text-neutral-300'
                                      }`}
                                    >
                                      +{drop} PPG
                                    </span>
                                    {player.dynamicDropoff?.isPosLeader && (
                                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-sans font-semibold">
                                        #1 {player.Pos}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-neutral-500">0.0</span>
                                )}
                              </td>
                            );
                          }

                          if (col.key === 'Proj_PPG_26') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap font-mono text-emerald-400 font-bold align-middle">
                                {player.Proj_PPG_26} PPG
                              </td>
                            );
                          }

                          if (col.key === 'Ceiling_PPG_26') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap font-mono text-amber-300 font-bold align-middle">
                                {player.Ceiling_PPG_26 || '-'} PPG
                              </td>
                            );
                          }

                          if (col.key === 'RZ_Touches_25') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap font-mono text-neutral-300 align-middle">
                                {player.RZ_Touches_25} rz
                              </td>
                            );
                          }

                          if (col.key === 'Target_Share_25') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap font-mono text-neutral-300 align-middle">
                                {player.Target_Share_25 ? `${Math.round(player.Target_Share_25 * 100)}%` : '-'}
                              </td>
                            );
                          }

                          if (col.key === 'Boom_Rate') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap font-mono text-emerald-400 font-semibold align-middle">
                                {player.Boom_Rate ? `${Math.round(player.Boom_Rate * 100)}%` : '-'}
                              </td>
                            );
                          }

                          // Standalone Pos / Team / Tier / Tag fallback if user explicitly enabled them in columns manager
                          if (col.key === 'Pos') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap align-middle">
                                <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-black ${posBadgeStyle}`}>
                                  {player.Pos}
                                </span>
                              </td>
                            );
                          }

                          if (col.key === 'Team') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap font-bold text-neutral-200 align-middle">
                                {player.Team}
                              </td>
                            );
                          }

                          if (col.key === 'Position_Tier') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap font-bold text-amber-400 align-middle">
                                Tier {player.Position_Tier}
                              </td>
                            );
                          }

                          if (col.key === 'Sleeper_Tag') {
                            return (
                              <td key={col.key} className="py-2 px-2.5 whitespace-nowrap text-neutral-300 align-middle">
                                {player.Sleeper_Tag}
                              </td>
                            );
                          }

                          // Standard fallback
                          return (
                            <td key={col.key} className="py-2 px-2.5 whitespace-nowrap text-neutral-300 align-middle">
                              {val !== undefined && val !== null ? String(val) : '-'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Expanded In-line Player Detail */}
                      {isExpanded && (
                        <tr className="bg-neutral-900/95 border-b border-neutral-800/80">
                          <td colSpan={visibleColumns.size + 2} className="p-3.5">
                            <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
                              {/* 1. FIRST: 2025 Actuals vs 2026 Statistical Comparison Matrix (Left Column) */}
                              <div className="rounded-xl border border-neutral-800/90 bg-neutral-950/80 p-3 lg:col-span-7 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-serif text-xs font-bold uppercase tracking-wider text-amber-400">
                                        2025 Actuals vs. 2026 Statistical Projections
                                      </h5>
                                      <span className="rounded bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 ring-1 ring-amber-500/25">
                                        PREDICTIVE MATRIX
                                      </span>
                                    </div>
                                    <span className="font-mono text-[11px] font-bold text-emerald-400">
                                      {player.Market_Gap > 0 ? `+${player.Market_Gap} Spots Value` : 'Consensus ADP'}
                                    </span>
                                  </div>

                                  {/* Side-by-Side Performance Comparison Grid */}
                                  <div className="mt-2.5 grid grid-cols-2 gap-3 text-xs">
                                    {/* 2025 Actual Production */}
                                    <div className="rounded-lg bg-neutral-900/70 p-2.5 border border-neutral-800/60">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                                        2025 Season Baseline
                                      </span>
                                      <div className="space-y-1 font-mono text-[11px]">
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Fantasy PPG:</span>
                                          <span className="text-neutral-200 font-bold">{player.Fantasy_PPG_25 || '-'} PPG</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Red-Zone Touches:</span>
                                          <span className="text-neutral-200">{player.RZ_Touches_25 || 0} rz</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Target / Opp Share:</span>
                                          <span className="text-neutral-200">
                                            {player.Target_Share_25 ? `${Math.round(player.Target_Share_25 * 100)}%` : '-'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">EPA / Play:</span>
                                          <span className="text-neutral-200">
                                            {player.EPA_Per_Play_25 !== undefined && player.EPA_Per_Play_25 !== null ? player.EPA_Per_Play_25 : '-'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* 2026 Model Projections */}
                                    <div className="rounded-lg bg-indigo-950/20 p-2.5 border border-indigo-500/20">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-1.5">
                                        2026 Model Outlook
                                      </span>
                                      <div className="space-y-1 font-mono text-[11px]">
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Projected PPG:</span>
                                          <span className="text-emerald-400 font-bold">{player.Proj_PPG_26} PPG</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Floor / Ceiling:</span>
                                          <span className="text-amber-300">
                                            {player.Floor_PPG_26 || '-'} – {player.Ceiling_PPG_26 || '-'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Season VORP:</span>
                                          <span className="text-indigo-300 font-bold" title="Points above baseline starter">
                                            {player.VORP > 0 ? `+${player.VORP}` : player.VORP} VORP
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Live Drop-off ({player.Pos}):</span>
                                          <span className="text-rose-300 font-bold" title={player.dynamicDropoff?.nextPlayerName ? `vs next ${player.Pos}: ${player.dynamicDropoff.nextPlayerName}` : 'Next available at position'}>
                                            +{player.Dynamic_Dropoff || 0} PPG {player.dynamicDropoff?.nextPlayerName ? `(vs ${player.dynamicDropoff.nextPlayerName})` : ''}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-neutral-400">Boom / Bust:</span>
                                          <span className="text-neutral-300">
                                            {player.Boom_Rate ? `${Math.round(player.Boom_Rate * 100)}%` : '-'} / {player.Bust_Rate ? `${Math.round(player.Bust_Rate * 100)}%` : '-'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Bottom Market Footprint */}
                                <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-neutral-800/60 text-[10px] font-mono text-neutral-400">
                                  <span>Avg ADP: <b className="text-neutral-200">{player.Avg_ADP || '-'}</b></span>
                                  <span>Yahoo: <b className="text-neutral-300">{player.Yahoo_ADP || '-'}</b></span>
                                  <span>Sleeper: <b className="text-neutral-300">{player.Sleeper_ADP || '-'}</b></span>
                                  <span>ECR: <b className="text-neutral-300">{player.ECR_Rank || '-'}</b></span>
                                </div>
                              </div>

                              {/* 2. NEXT: Tactical Scouting & Scheme Fit (Right Column) */}
                              <div className="rounded-xl border border-neutral-800/90 bg-neutral-950/80 p-3 lg:col-span-5 flex flex-col justify-between space-y-2">
                                <div>
                                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-serif text-xs font-bold uppercase tracking-wider text-indigo-400">
                                        Tactical Scouting & Scheme Fit
                                      </h5>
                                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-bold text-indigo-300">
                                        {player.Team} • {player.Pos}
                                      </span>
                                    </div>
                                    <span className="rounded bg-neutral-800 px-1.5 py-0.2 text-[9px] font-bold text-neutral-300">
                                      Tier {player.Position_Tier}
                                    </span>
                                  </div>

                                  <p className="mt-2 text-xs leading-relaxed text-neutral-300">
                                    {player.Notable_Description}
                                  </p>
                                </div>

                                {/* Contextual Intel Tags */}
                                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-800/60 text-[10px]">
                                  <span className="rounded bg-neutral-900 px-2 py-0.5 text-neutral-300 ring-1 ring-neutral-800">
                                    Depth Chart: <b className="text-white">{player.Last_Depth_Chart}</b>
                                  </span>
                                  <span className="rounded bg-neutral-900 px-2 py-0.5 text-neutral-300 ring-1 ring-neutral-800">
                                    Status: <b className="text-white">{player.Has_Moved ? `Transferred to ${player.Team}` : 'System Incumbent'}</b>
                                  </span>
                                  <span className="rounded bg-neutral-900 px-2 py-0.5 text-neutral-300 ring-1 ring-neutral-800">
                                    Volatility: <b className="text-amber-400">{player.Volatility}</b>
                                  </span>
                                  {player.Age && (
                                    <span className="rounded bg-neutral-900 px-2 py-0.5 text-neutral-300 ring-1 ring-neutral-800">
                                      Age: <b className="text-neutral-200">{player.Age}</b>
                                    </span>
                                  )}
                                  {player.Sleeper_Tag && (
                                    <span className="rounded bg-neutral-900 px-2 py-0.5 text-indigo-300 ring-1 ring-neutral-800">
                                      {player.Sleeper_Tag}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

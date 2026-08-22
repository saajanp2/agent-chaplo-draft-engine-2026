import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Trash2, 
  Shield, 
  Clock, 
  UserCheck, 
  Search, 
  Plus, 
  GripVertical, 
  ArrowRightLeft, 
  X, 
  Check, 
  AlertCircle, 
  Layers, 
  Flame, 
  Zap, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Award
} from 'lucide-react';
import { Player, TeamConfig, DraftPick, RosterSlots, Position } from '../types';
import { 
  analyzeAllTeamsPpg, 
  analyzeTeamPpg, 
  calculateMarginalPpgLift, 
  TeamPpgAnalysis 
} from '../utils/teamAnalytics';

interface DraftWarRoomProps {
  teams: TeamConfig[];
  picks: DraftPick[];
  activeTeamId: number; // 1 to 12
  currentPickNumber: number; // 1 to 180
  availablePlayers: Player[];
  allPlayers: Player[];
  onDraftPlayer: (player: Player, targetTeamId?: number) => void;
  onMovePlayer: (playerId: number, targetTeamId: number) => void;
  onRemovePlayer: (playerId: number) => void;
  onSelectPlayer: (player: Player) => void;
  onSetUserTeam?: (teamId: number) => void;
}

export const DraftWarRoom: React.FC<DraftWarRoomProps> = ({
  teams,
  picks,
  activeTeamId,
  currentPickNumber,
  availablePlayers,
  allPlayers,
  onDraftPlayer,
  onMovePlayer,
  onRemovePlayer,
  onSelectPlayer,
  onSetUserTeam,
}) => {
  // Global Quick-Type Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargetTeamId, setSelectedTargetTeamId] = useState<number>(activeTeamId);
  const [activePosFilter, setActivePosFilter] = useState<string>('ALL');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showStandings, setShowStandings] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Per-team inline add search state
  const [inlineTeamSearchId, setInlineTeamSearchId] = useState<number | null>(null);
  const [inlineSearchQuery, setInlineSearchQuery] = useState('');
  const [inlinePosFilter, setInlinePosFilter] = useState<string>('ALL');

  // Drag & Drop State
  const [draggedPlayerId, setDraggedPlayerId] = useState<number | null>(null);
  const [draggedFromTeamId, setDraggedFromTeamId] = useState<number | null>(null);
  const [dragOverTeamId, setDragOverTeamId] = useState<number | null>(null);

  // Quick Move Dropdown Modal State
  const [quickMovePlayer, setQuickMovePlayer] = useState<{ player: Player; fromTeamId: number } | null>(null);

  // Update selected target team when active on-clock team changes
  useEffect(() => {
    setSelectedTargetTeamId(activeTeamId);
  }, [activeTeamId]);

  // Global Keyboard shortcut (/ or Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.metaKey && e.key === 'k') || (e.ctrlKey && e.key === 'k')) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute Positional Tier Statistics & Scarcity Counts
  const posScarcity = useMemo(() => {
    const stats: Record<Position, { t1Count: number; t2Count: number; total: number; best?: Player }> = {
      QB: { t1Count: 0, t2Count: 0, total: 0 },
      RB: { t1Count: 0, t2Count: 0, total: 0 },
      WR: { t1Count: 0, t2Count: 0, total: 0 },
      TE: { t1Count: 0, t2Count: 0, total: 0 },
      K: { t1Count: 0, t2Count: 0, total: 0 },
      DEF: { t1Count: 0, t2Count: 0, total: 0 },
    };

    availablePlayers.forEach((p) => {
      if (!stats[p.Pos]) return;
      stats[p.Pos].total += 1;
      if (p.Position_Tier === 1) stats[p.Pos].t1Count += 1;
      if (p.Position_Tier === 2) stats[p.Pos].t2Count += 1;
      if (!stats[p.Pos].best) {
        stats[p.Pos].best = p;
      }
    });

    return stats;
  }, [availablePlayers]);

  // League-wide Team PPG Analyses
  const allTeamsAnalysis = useMemo(() => {
    return analyzeAllTeamsPpg(teams, picks);
  }, [teams, picks]);

  const analysisByTeamId = useMemo(() => {
    const map = new Map<number, TeamPpgAnalysis>();
    allTeamsAnalysis.forEach((a) => map.set(a.teamId, a));
    return map;
  }, [allTeamsAnalysis]);

  const targetTeam = teams.find((t) => t.id === selectedTargetTeamId) || teams[0];

  // Filtered available players for top search bar
  const filteredAvailablePlayers = useMemo(() => {
    return availablePlayers
      .filter((p) => {
        // Position filter
        if (activePosFilter === 'FLEX') {
          if (!['RB', 'WR', 'TE'].includes(p.Pos)) return false;
        } else if (activePosFilter !== 'ALL' && p.Pos !== activePosFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.Player_Name.toLowerCase().includes(q) ||
            p.Team.toLowerCase().includes(q) ||
            p.Pos.toLowerCase().includes(q) ||
            p.Sleeper_Tag?.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .slice(0, 14);
  }, [availablePlayers, activePosFilter, searchQuery]);

  // Filtered for inline team search
  const filteredInlinePlayers = useMemo(() => {
    return availablePlayers
      .filter((p) => {
        if (inlinePosFilter === 'FLEX') {
          if (!['RB', 'WR', 'TE'].includes(p.Pos)) return false;
        } else if (inlinePosFilter !== 'ALL' && p.Pos !== inlinePosFilter) {
          return false;
        }

        if (inlineSearchQuery.trim()) {
          const q = inlineSearchQuery.toLowerCase();
          return (
            p.Player_Name.toLowerCase().includes(q) ||
            p.Team.toLowerCase().includes(q) ||
            p.Pos.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .slice(0, 8);
  }, [availablePlayers, inlinePosFilter, inlineSearchQuery]);

  // Helper to construct roster for a team
  const getTeamRoster = (teamId: number): RosterSlots => {
    const teamPicks = picks.filter((p) => p.teamId === teamId);
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
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, player: Player, fromTeamId: number) => {
    setDraggedPlayerId(player.Player_ID);
    setDraggedFromTeamId(fromTeamId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ playerId: player.Player_ID, fromTeamId }));
  };

  const handleDragOver = (e: React.DragEvent, targetTeamId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTeamId !== targetTeamId) {
      setDragOverTeamId(targetTeamId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, targetTeamId: number) => {
    if (dragOverTeamId === targetTeamId) {
      setDragOverTeamId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetTeamId: number) => {
    e.preventDefault();
    setDragOverTeamId(null);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.playerId && data.fromTeamId !== targetTeamId) {
          onMovePlayer(data.playerId, targetTeamId);
        }
      }
    } catch (err) {
      if (draggedPlayerId && draggedFromTeamId !== targetTeamId) {
        onMovePlayer(draggedPlayerId, targetTeamId);
      }
    }
    setDraggedPlayerId(null);
    setDraggedFromTeamId(null);
  };

  const posBadgeColor = (pos: Position) => {
    switch (pos) {
      case 'QB': return 'bg-purple-500/20 text-purple-300 ring-purple-500/30';
      case 'RB': return 'bg-blue-500/20 text-blue-300 ring-blue-500/30';
      case 'WR': return 'bg-amber-500/20 text-amber-300 ring-amber-500/30';
      case 'TE': return 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30';
      case 'K': return 'bg-teal-500/20 text-teal-300 ring-teal-500/30';
      case 'DEF': return 'bg-rose-500/20 text-rose-300 ring-rose-500/30';
      default: return 'bg-neutral-800 text-neutral-300 ring-neutral-700';
    }
  };

  const posTabs = [
    { id: 'ALL', label: 'ALL', count: availablePlayers.length },
    { id: 'RB', label: 'RB', t1: posScarcity.RB.t1Count, t2: posScarcity.RB.t2Count, count: posScarcity.RB.total },
    { id: 'WR', label: 'WR', t1: posScarcity.WR.t1Count, t2: posScarcity.WR.t2Count, count: posScarcity.WR.total },
    { id: 'TE', label: 'TE', t1: posScarcity.TE.t1Count, t2: posScarcity.TE.t2Count, count: posScarcity.TE.total },
    { id: 'QB', label: 'QB', t1: posScarcity.QB.t1Count, t2: posScarcity.QB.t2Count, count: posScarcity.QB.total },
    { id: 'FLEX', label: 'FLEX', count: posScarcity.RB.total + posScarcity.WR.total + posScarcity.TE.total },
    { id: 'K', label: 'K', count: posScarcity.K.total },
    { id: 'DEF', label: 'DEF', count: posScarcity.DEF.total },
  ];

  const renderSlot = (slotLabel: string, player: Player | undefined, badgeColor: string, teamId: number) => {
    const isThisDragged = player && draggedPlayerId === player.Player_ID;

    return (
      <div 
        key={slotLabel}
        draggable={!!player}
        onDragStart={(e) => player && handleDragStart(e, player, teamId)}
        className={`group relative flex items-center justify-between rounded-lg border px-2 py-1.5 text-[11px] transition-all select-none ${
          player 
            ? 'cursor-grab active:cursor-grabbing border-neutral-800/80 bg-neutral-950/70 hover:border-neutral-700 hover:bg-neutral-900/60' 
            : 'border-neutral-800/40 bg-neutral-950/30'
        } ${isThisDragged ? 'opacity-40 border-amber-500 ring-1 ring-amber-500' : ''}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
          {player && (
            <GripVertical className="h-3 w-3 text-neutral-600 group-hover:text-neutral-400 shrink-0 cursor-grab" />
          )}
          <span className={`flex h-5 w-8 items-center justify-center rounded font-mono text-[9px] font-extrabold ${badgeColor} shrink-0`}>
            {slotLabel}
          </span>
          {player ? (
            <span 
              onClick={() => onSelectPlayer(player)}
              className="font-serif font-bold text-neutral-200 hover:text-amber-400 cursor-pointer truncate"
              title={`Click to view intel • Drag to move`}
            >
              {player.Player_Name}
            </span>
          ) : (
            <span className="italic text-neutral-600 text-[10px]">Empty</span>
          )}
        </div>

        {player ? (
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-mono text-[10px] font-bold text-emerald-400 group-hover:hidden">
              {player.W1_4_Proj_PPG}
            </span>

            {/* Quick Action Buttons on Hover */}
            <div className="hidden group-hover:flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickMovePlayer({ player, fromTeamId: teamId });
                }}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-amber-300 transition-all"
                title="Transfer player to another team"
              >
                <ArrowRightLeft className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePlayer(player.Player_ID);
                }}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-rose-400 transition-all"
                title="Remove / Drop player from draft"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Positional Scarcity & Top-Tier Cliff Tracker Strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {(['RB', 'WR', 'TE', 'QB', 'K', 'DEF'] as Position[]).map((pos) => {
          const info = posScarcity[pos];
          const isLowTier1 = info.t1Count <= 2 && info.t1Count > 0;
          const isDepletedTier1 = info.t1Count === 0;

          return (
            <div
              key={pos}
              onClick={() => {
                setActivePosFilter(pos);
                setIsSearchOpen(true);
                searchInputRef.current?.focus();
              }}
              className={`rounded-xl border p-3 transition-all cursor-pointer shadow-lg backdrop-blur-xl ${
                activePosFilter === pos
                  ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/50'
                  : 'border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] font-bold ring-1 ${posBadgeColor(pos)}`}>
                  {pos}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {info.total} avail
                </span>
              </div>

              {/* Tier Counts */}
              <div className="mt-2 flex items-center gap-2 text-xs">
                {pos !== 'K' && pos !== 'DEF' ? (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-neutral-400">T1:</span>
                      <strong className={`font-mono text-xs ${
                        isDepletedTier1 ? 'text-neutral-500' : isLowTier1 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                      }`}>
                        {info.t1Count} left
                      </strong>
                    </div>
                    <span className="text-neutral-700">|</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-neutral-400">T2:</span>
                      <strong className="font-mono text-neutral-200 text-xs">
                        {info.t2Count}
                      </strong>
                    </div>
                  </>
                ) : (
                  <span className="text-[11px] text-neutral-400">
                    Stream / Late Target
                  </span>
                )}
              </div>

              {/* Best Available Player at Pos */}
              {info.best && (
                <div className="mt-1.5 pt-1.5 border-t border-neutral-800/80 truncate text-[11px]">
                  <span className="text-[9px] uppercase font-bold text-neutral-500 block">Top Available:</span>
                  <span className="font-serif font-bold text-neutral-200 truncate block">
                    {info.best.Player_Name} ({info.best.W1_4_Proj_PPG} PPG)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Top Quick-Type Search Bar & Fast Position Filter Tabs */}
      <div className="relative z-30 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 p-4 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base sm:text-lg font-bold text-neutral-100">
                  12-Team Live War Room Board
                </h2>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-amber-500/30">
                  ⚡ INSTANT POSITION TOGGLE & DRAFT
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Filter top-tier available players across positions, or drag & drop cards to transfer
              </p>
            </div>
          </div>

          {/* Quick-Type Search Input + Target Team Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-2xl">
            {/* Target Team Dropdown */}
            <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 shrink-0">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Assign to:
              </span>
              <select
                value={selectedTargetTeamId}
                onChange={(e) => setSelectedTargetTeamId(Number(e.target.value))}
                className="bg-transparent text-xs font-serif font-bold text-amber-400 focus:outline-none cursor-pointer"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id} className="bg-neutral-900 text-neutral-200">
                    Slot #{t.slot}: {t.name} {t.id === activeTeamId ? ' (On Clock)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Type to Draft Autocomplete Input */}
            <div className="relative flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={`Search ${activePosFilter === 'ALL' ? 'all positions' : activePosFilter} (e.g. Ashton Jeanty, Bowers)... [Press /]`}
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredAvailablePlayers.length > 0) {
                      onDraftPlayer(filteredAvailablePlayers[0], selectedTargetTeamId);
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    } else if (e.key === 'Escape') {
                      setIsSearchOpen(false);
                    }
                  }}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 pl-9 pr-8 py-2 text-xs font-medium text-neutral-100 placeholder-neutral-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown with Position Tier Separation */}
              {isSearchOpen && (
                <div 
                  className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-80 overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900/98 p-1.5 shadow-2xl backdrop-blur-2xl divide-y divide-neutral-800"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="flex items-center justify-between px-2.5 py-1 text-[10px] text-neutral-400 bg-neutral-950/60 rounded-lg mb-1">
                    <span>
                      Filter: <strong className="text-amber-400">{activePosFilter}</strong> • Drafting to: <strong className="text-white">{teams.find((t) => t.id === selectedTargetTeamId)?.name}</strong>
                    </span>
                    <span className="text-neutral-500">Press Enter for #1 match</span>
                  </div>

                  {filteredAvailablePlayers.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-neutral-500">
                      No available players match current position filter & search "{searchQuery}"
                    </div>
                  ) : (
                    filteredAvailablePlayers.map((player, idx) => {
                      const lift = calculateMarginalPpgLift(player, targetTeam, picks);

                      return (
                        <div
                          key={player.Player_ID}
                          onClick={() => {
                            onDraftPlayer(player, selectedTargetTeamId);
                            setSearchQuery('');
                            setIsSearchOpen(false);
                          }}
                          className={`flex flex-col gap-1.5 rounded-lg p-2 text-xs transition-all cursor-pointer hover:bg-amber-500/20 hover:text-white ${
                            idx === 0 ? 'bg-neutral-800/60' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="font-mono text-[11px] font-bold text-neutral-400">
                                #{player.Offline_Draft_Rank}
                              </span>
                              <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ring-1 ${posBadgeColor(player.Pos)}`}>
                                {player.Pos}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <strong className="text-white font-serif block truncate">
                                    {player.Player_Name}
                                  </strong>
                                  <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-bold text-amber-300">
                                    Tier {player.Position_Tier}
                                  </span>
                                </div>
                                <span className="text-[10px] text-neutral-400 truncate block">
                                  {player.Team} • {player.Sleeper_Tag}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 ml-2">
                              <div className="text-right">
                                <span className="font-mono text-xs font-bold text-emerald-400">
                                  {player.W1_4_Proj_PPG} PPG
                                </span>
                                <span className="text-[10px] text-neutral-500 block">
                                  POADP {player.POADP_Points_Over_ADP >= 0 ? `+${player.POADP_Points_Over_ADP}` : player.POADP_Points_Over_ADP}
                                </span>
                              </div>

                              <button
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow hover:bg-emerald-500"
                              >
                                Draft
                              </button>
                            </div>
                          </div>

                          {/* Marginal Team PPG Lift Indicator (Late Round Optimization) */}
                          <div className="flex items-center gap-2 rounded bg-neutral-950/80 px-2 py-1 text-[11px]">
                            {lift.marginalPpgGain > 0 ? (
                              <span className="rounded bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 border border-emerald-500/30 shrink-0">
                                +{lift.marginalPpgGain} PPG to {lift.targetSlot}
                              </span>
                            ) : (
                              <span className="rounded bg-indigo-500/20 text-indigo-300 font-medium px-1.5 py-0.2 shrink-0">
                                Bench Ceiling: {player.Ceiling_PPG_26 || 16} PPG
                              </span>
                            )}
                            <span className="text-neutral-400 italic truncate text-[10px]">
                              "{lift.description}"
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Position Filter Pills with Tier Counters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-neutral-800/80 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1">
            Quick Position Toggle:
          </span>
          {posTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActivePosFilter(tab.id);
                setIsSearchOpen(true);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all shrink-0 ${
                activePosFilter === tab.id
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.t1 !== undefined && tab.t1 > 0 ? (
                <span className={`rounded px-1 py-0.2 text-[9px] font-bold ${
                  activePosFilter === tab.id ? 'bg-neutral-950 text-amber-400' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  T1: {tab.t1}
                </span>
              ) : (
                <span className={`text-[10px] ${activePosFilter === tab.id ? 'text-neutral-900 font-extrabold' : 'text-neutral-500'}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2.5. League Standings & Projected Team PPG Analysis Drawer */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-xl backdrop-blur-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <BarChart2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-neutral-100">
                League Projected Team PPG Standings & Power Rankings
              </h3>
              <p className="text-[11px] text-neutral-400">
                Real-time total starting 10 lineup PPG analysis across all 12 teams to optimize late-round value
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowStandings(!showStandings)}
            className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all"
          >
            <span>{showStandings ? 'Hide Standings' : 'View Full Standings'}</span>
            {showStandings ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Collapsible Standings Table */}
        {showStandings && (
          <div className="overflow-x-auto pt-2 border-t border-neutral-800/80 animate-fadeIn">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/70 text-[10px] uppercase tracking-wider text-neutral-400">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-2 text-center">Starting 10 PPG</th>
                  <th className="py-2.5 px-2 text-center">W1–4 PPG</th>
                  <th className="py-2.5 px-2 text-center">QB</th>
                  <th className="py-2.5 px-2 text-center">RB Room</th>
                  <th className="py-2.5 px-2 text-center">WR Room</th>
                  <th className="py-2.5 px-2 text-center">TE</th>
                  <th className="py-2.5 px-2 text-center">FLEX</th>
                  <th className="py-2.5 px-2 text-center">K/DEF</th>
                  <th className="py-2.5 px-3 text-right">Season Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {allTeamsAnalysis.map((analysis) => (
                  <tr
                    key={analysis.teamId}
                    className={`transition-colors ${
                      analysis.isUser
                        ? 'bg-amber-950/20 font-bold'
                        : 'hover:bg-neutral-800/40'
                    }`}
                  >
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center justify-center h-5 w-6 rounded text-[10px] font-bold ${
                        analysis.rankInLeague === 1
                          ? 'bg-amber-500 text-neutral-950 font-black'
                          : analysis.rankInLeague <= 3
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        #{analysis.rankInLeague}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-serif font-bold text-neutral-200">
                      {analysis.teamName} {analysis.isUser && <span className="text-amber-400 text-[10px] font-sans">★ MY TEAM</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-emerald-400 text-xs">
                      {analysis.startingPpg} PPG
                    </td>
                    <td className="py-2 px-2 text-center text-neutral-300">
                      {analysis.w14StartingPpg}
                    </td>
                    <td className="py-2 px-2 text-center text-purple-300">
                      {analysis.positionalPpg.QB || '-'}
                    </td>
                    <td className="py-2 px-2 text-center text-blue-300">
                      {analysis.positionalPpg.RB || '-'}
                    </td>
                    <td className="py-2 px-2 text-center text-amber-300">
                      {analysis.positionalPpg.WR || '-'}
                    </td>
                    <td className="py-2 px-2 text-center text-emerald-300">
                      {analysis.positionalPpg.TE || '-'}
                    </td>
                    <td className="py-2 px-2 text-center text-indigo-300">
                      {analysis.positionalPpg.FLEX || '-'}
                    </td>
                    <td className="py-2 px-2 text-center text-teal-300">
                      {(analysis.positionalPpg.K + analysis.positionalPpg.DEF).toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-300 font-sans">
                      {analysis.totalSeasonPts} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. 12-Team Responsive Grid Board */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teams.map((team) => {
          const isOnClock = team.id === activeTeamId && picks.length < 180;
          const isDragOver = dragOverTeamId === team.id;
          const roster = getTeamRoster(team.id);
          const isInlineSearchOpen = inlineTeamSearchId === team.id;
          const analysis = analysisByTeamId.get(team.id);

          return (
            <div
              key={team.id}
              onDragOver={(e) => handleDragOver(e, team.id)}
              onDragLeave={(e) => handleDragLeave(e, team.id)}
              onDrop={(e) => handleDrop(e, team.id)}
              className={`relative flex flex-col rounded-2xl border p-4 transition-all shadow-xl backdrop-blur-xl ${
                isDragOver
                  ? 'border-emerald-400 bg-emerald-950/40 ring-4 ring-emerald-500/50 scale-[1.02] shadow-emerald-500/20'
                  : isOnClock && team.isUser
                  ? 'border-amber-400 bg-gradient-to-b from-amber-950/60 via-neutral-900/95 to-neutral-950 ring-4 ring-amber-500/60 shadow-2xl shadow-amber-500/20'
                  : isOnClock
                  ? 'border-amber-500 bg-gradient-to-b from-amber-950/40 via-neutral-900/90 to-neutral-950 ring-2 ring-amber-500/50 shadow-amber-500/10'
                  : team.isUser
                  ? 'border-indigo-500/80 bg-gradient-to-b from-indigo-950/40 via-neutral-900/90 to-neutral-950 ring-2 ring-indigo-500/50 shadow-indigo-500/10'
                  : 'border-neutral-800 bg-neutral-900/70 hover:border-neutral-700'
              }`}
            >
              {/* Drop Target Overlay Notice */}
              {isDragOver && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-emerald-950/85 backdrop-blur-sm border-2 border-dashed border-emerald-400 text-emerald-200 animate-fadeIn p-4 text-center">
                  <ArrowRightLeft className="h-8 w-8 text-emerald-300 animate-bounce mb-2" />
                  <strong className="font-serif text-sm">Drop player here</strong>
                  <span className="text-xs text-emerald-400">Transfer to {team.name}</span>
                </div>
              )}

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-[11px] font-bold shrink-0 ${
                    team.isUser ? 'bg-amber-500 text-neutral-950 font-black' : 'bg-neutral-800 text-neutral-300'
                  }`}>
                    #{team.slot}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-serif text-sm font-bold text-neutral-100 truncate">
                        {team.name}
                      </h4>
                    </div>
                    <span className="text-[10px] text-neutral-400 block truncate">
                      {team.archetype}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isOnClock && team.isUser ? (
                    <span className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 px-2.5 py-1 text-[10px] font-black text-neutral-950 shadow-md shadow-amber-500/30 animate-pulse">
                      <Clock className="h-3.5 w-3.5 stroke-[3]" />
                      <span>🚨 YOUR TURN!</span>
                    </span>
                  ) : isOnClock ? (
                    <span className="flex items-center gap-1 rounded bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-neutral-950 animate-pulse">
                      <Clock className="h-3 w-3" />
                      <span>ON CLOCK</span>
                    </span>
                  ) : team.isUser ? (
                    <span className="rounded-lg bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-black text-indigo-300 ring-1 ring-indigo-500/30 shadow-sm">
                      ★ MY TEAM (Pick #{team.slot})
                    </span>
                  ) : (
                    onSetUserTeam && (
                      <button
                        onClick={() => onSetUserTeam(team.id)}
                        className="rounded px-1.5 py-0.5 text-[10px] text-neutral-500 hover:text-amber-300 hover:bg-neutral-800 transition-all opacity-60 hover:opacity-100"
                        title={`Set Slot #${team.slot} as My Team`}
                      >
                        Set Mine
                      </button>
                    )
                  )}

                  {/* Quick Add Button */}
                  <button
                    onClick={() => {
                      setInlineTeamSearchId(isInlineSearchOpen ? null : team.id);
                      setInlineSearchQuery('');
                      setInlinePosFilter('ALL');
                    }}
                    className={`rounded p-1 text-xs transition-all ${
                      isInlineSearchOpen
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                    title="Quick add player directly to this team"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline Search with Pos Filter for this Team */}
              {isInlineSearchOpen && (
                <div className="my-2 space-y-2 rounded-xl border border-amber-500/40 bg-neutral-950 p-2.5 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">
                      Quick Add to {team.name}
                    </span>
                    <button
                      onClick={() => setInlineTeamSearchId(null)}
                      className="text-neutral-500 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Inline Position Filter Chips */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                    {['ALL', 'RB', 'WR', 'TE', 'QB', 'K', 'DEF'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setInlinePosFilter(pos)}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-all ${
                          inlinePosFilter === pos
                            ? 'bg-amber-500 text-neutral-950'
                            : 'bg-neutral-900 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    autoFocus
                    placeholder="Type name to add..."
                    value={inlineSearchQuery}
                    onChange={(e) => setInlineSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {filteredInlinePlayers.map((p) => (
                      <div
                        key={p.Player_ID}
                        onClick={() => {
                          onDraftPlayer(p, team.id);
                          setInlineTeamSearchId(null);
                        }}
                        className="flex items-center justify-between rounded p-1 hover:bg-neutral-800 cursor-pointer text-[11px]"
                      >
                        <div className="truncate mr-1">
                          <strong className="text-white">{p.Player_Name}</strong>
                          <span className="text-neutral-500 ml-1">({p.Pos} • Tier {p.Position_Tier})</span>
                        </div>
                        <span className="font-mono text-emerald-400 text-[10px] shrink-0">
                          {p.W1_4_Proj_PPG} PPG
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-time Whole-Team Projected PPG Summary Bar */}
              {analysis && (
                <div className="my-2.5 space-y-1.5 rounded-xl bg-neutral-950/90 p-2.5 border border-neutral-800/80">
                  {/* Top Row: Total Starting PPG + League Rank */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800/60 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-medium block">Starting 10 Total</span>
                      <strong className="font-mono text-emerald-400 text-sm font-bold">
                        {analysis.startingPpg} PPG
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        analysis.rankInLeague === 1
                          ? 'bg-amber-500 text-neutral-950 font-black'
                          : analysis.rankInLeague <= 3
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        <Award className="h-3 w-3" />
                        <span>Rank #{analysis.rankInLeague} / 12</span>
                      </span>
                      <span className="text-[10px] text-neutral-500 block">
                        {analysis.filledStartersCount}/10 Starters ({analysis.totalSeasonPts} pts)
                      </span>
                    </div>
                  </div>

                  {/* Positional Room PPG Breakdown Chips */}
                  <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px] pt-0.5">
                    <div className="rounded bg-purple-950/30 border border-purple-500/20 py-0.5" title="QB Room Projected PPG">
                      <span className="text-[9px] text-purple-400 block font-bold">QB</span>
                      <strong className="text-purple-200">{analysis.positionalPpg.QB}</strong>
                    </div>
                    <div className="rounded bg-blue-950/30 border border-blue-500/20 py-0.5" title="RB Room Projected PPG">
                      <span className="text-[9px] text-blue-400 block font-bold">RB</span>
                      <strong className="text-blue-200">{analysis.positionalPpg.RB}</strong>
                    </div>
                    <div className="rounded bg-amber-950/30 border border-amber-500/20 py-0.5" title="WR Room Projected PPG">
                      <span className="text-[9px] text-amber-400 block font-bold">WR</span>
                      <strong className="text-amber-200">{analysis.positionalPpg.WR}</strong>
                    </div>
                    <div className="rounded bg-emerald-950/30 border border-emerald-500/20 py-0.5" title="TE Room Projected PPG">
                      <span className="text-[9px] text-emerald-400 block font-bold">TE</span>
                      <strong className="text-emerald-200">{analysis.positionalPpg.TE}</strong>
                    </div>
                    <div className="rounded bg-indigo-950/30 border border-indigo-500/20 py-0.5" title="2-FLEX Room Projected PPG">
                      <span className="text-[9px] text-indigo-400 block font-bold">FLEX</span>
                      <strong className="text-indigo-200">{analysis.positionalPpg.FLEX}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Roster Slots List */}
              <div className="space-y-1.5 flex-1">
                {renderSlot('QB', roster.QB, 'bg-purple-500/20 text-purple-300', team.id)}
                {renderSlot('RB1', roster.RB1, 'bg-blue-500/20 text-blue-300', team.id)}
                {renderSlot('RB2', roster.RB2, 'bg-blue-500/20 text-blue-300', team.id)}
                {renderSlot('WR1', roster.WR1, 'bg-amber-500/20 text-amber-300', team.id)}
                {renderSlot('WR2', roster.WR2, 'bg-amber-500/20 text-amber-300', team.id)}
                {renderSlot('TE', roster.TE, 'bg-emerald-500/20 text-emerald-300', team.id)}
                {renderSlot('FLEX1', roster.FLEX1, 'bg-indigo-500/20 text-indigo-300', team.id)}
                {renderSlot('FLEX2', roster.FLEX2, 'bg-indigo-500/20 text-indigo-300', team.id)}
                {renderSlot('K', roster.K, 'bg-teal-500/20 text-teal-300', team.id)}
                {renderSlot('DEF', roster.DEF, 'bg-rose-500/20 text-rose-300', team.id)}

                {/* Bench Slots */}
                <div className="pt-2 border-t border-neutral-800/80 space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                      Bench ({roster.BENCH.length}/5)
                    </span>
                    <span className="text-[9px] text-neutral-600">Drag to move</span>
                  </div>
                  {[0, 1, 2, 3, 4].map((bIdx) => (
                    <React.Fragment key={bIdx}>
                      {renderSlot(`BN${bIdx + 1}`, roster.BENCH[bIdx], 'bg-neutral-800 text-neutral-400', team.id)}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Move Team Transfer Modal */}
      {quickMovePlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 p-4 backdrop-blur-md animate-fadeIn">
          <div 
            className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/95 p-5 shadow-2xl backdrop-blur-2xl text-neutral-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-amber-400" />
                <h3 className="font-serif text-base font-bold">Transfer Player</h3>
              </div>
              <button
                onClick={() => setQuickMovePlayer(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl bg-neutral-950 p-3 border border-neutral-800">
              <span className="text-xs text-neutral-400">Moving Player:</span>
              <h4 className="font-serif text-base font-bold text-white">
                {quickMovePlayer.player.Player_Name} ({quickMovePlayer.player.Pos}, {quickMovePlayer.player.Team})
              </h4>
              <p className="text-xs text-neutral-500">
                Currently with: <strong>{teams.find((t) => t.id === quickMovePlayer.fromTeamId)?.name}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                Select Destination Team:
              </span>
              <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {teams.map((targetTeam) => {
                  const isCurrent = targetTeam.id === quickMovePlayer.fromTeamId;
                  return (
                    <button
                      key={targetTeam.id}
                      disabled={isCurrent}
                      onClick={() => {
                        onMovePlayer(quickMovePlayer.player.Player_ID, targetTeam.id);
                        setQuickMovePlayer(null);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl border p-2.5 text-xs text-left transition-all ${
                        isCurrent
                          ? 'border-neutral-800 bg-neutral-950/40 text-neutral-600 cursor-not-allowed'
                          : 'border-neutral-800 bg-neutral-950/80 hover:border-amber-500/50 hover:bg-neutral-800 text-neutral-200'
                      }`}
                    >
                      <div>
                        <strong className="text-white block font-serif">#{targetTeam.slot} {targetTeam.name}</strong>
                        <span className="text-[10px] text-neutral-400">{targetTeam.archetype}</span>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] text-neutral-600">Current</span>
                      ) : (
                        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          Transfer
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

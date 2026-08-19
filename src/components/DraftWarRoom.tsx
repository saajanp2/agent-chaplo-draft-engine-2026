import React, { useState, useRef, useEffect } from 'react';
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
  MoveHorizontal
} from 'lucide-react';
import { Player, TeamConfig, DraftPick, RosterSlots, Position } from '../types';

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
}) => {
  // Global Quick-Type Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargetTeamId, setSelectedTargetTeamId] = useState<number>(activeTeamId);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Per-team inline add search state
  const [inlineTeamSearchId, setInlineTeamSearchId] = useState<number | null>(null);
  const [inlineSearchQuery, setInlineSearchQuery] = useState('');

  // Drag & Drop State
  const [draggedPlayerId, setDraggedPlayerId] = useState<number | null>(null);
  const [draggedFromTeamId, setDraggedFromTeamId] = useState<number | null>(null);
  const [dragOverTeamId, setDragOverTeamId] = useState<number | null>(null);

  // Quick Move Dropdown Modal / Popover State
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

  // Filtered available players for search
  const filteredAvailablePlayers = React.useMemo(() => {
    if (!searchQuery.trim()) return availablePlayers.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return availablePlayers.filter((p) => {
      return (
        p.Player_Name.toLowerCase().includes(q) ||
        p.Team.toLowerCase().includes(q) ||
        p.Pos.toLowerCase().includes(q) ||
        p.Sleeper_Tag.toLowerCase().includes(q)
      );
    }).slice(0, 10);
  }, [availablePlayers, searchQuery]);

  // Filtered for inline team search
  const filteredInlinePlayers = React.useMemo(() => {
    if (!inlineSearchQuery.trim()) return availablePlayers.slice(0, 6);
    const q = inlineSearchQuery.toLowerCase();
    return availablePlayers.filter((p) => {
      return (
        p.Player_Name.toLowerCase().includes(q) ||
        p.Team.toLowerCase().includes(q) ||
        p.Pos.toLowerCase().includes(q)
      );
    }).slice(0, 8);
  }, [availablePlayers, inlineSearchQuery]);

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
    // Only clear if leaving the card boundary
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
      // Fallback to state
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
      {/* Top Section: Quick-Type Manual Search Bar & Fast Draft Dispatcher */}
      <div className="relative z-30 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 p-4 shadow-2xl backdrop-blur-xl">
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
                  ⚡ HIGH-SPEED QUICK DRAFT & DRAG-AND-DROP
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Type any player to assign instantly, or drag & drop player cards between teams to correct mistakes
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
                  placeholder="Type player name to draft (e.g. Ashton Jeanty, Bowers)... [Press /]"
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

              {/* Autocomplete Dropdown */}
              {isSearchOpen && (
                <div 
                  className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-72 overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900/98 p-1.5 shadow-2xl backdrop-blur-2xl divide-y divide-neutral-800"
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                >
                  <div className="flex items-center justify-between px-2.5 py-1 text-[10px] text-neutral-400 bg-neutral-950/60 rounded-lg mb-1">
                    <span>
                      Drafting to: <strong className="text-amber-400">{teams.find((t) => t.id === selectedTargetTeamId)?.name}</strong>
                    </span>
                    <span className="text-neutral-500">Press Enter for #1 match</span>
                  </div>

                  {filteredAvailablePlayers.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-neutral-500">
                      No available players match "{searchQuery}"
                    </div>
                  ) : (
                    filteredAvailablePlayers.map((player, idx) => (
                      <div
                        key={player.Player_ID}
                        onClick={() => {
                          onDraftPlayer(player, selectedTargetTeamId);
                          setSearchQuery('');
                          setIsSearchOpen(false);
                        }}
                        className={`flex items-center justify-between rounded-lg p-2 text-xs transition-all cursor-pointer hover:bg-amber-500/20 hover:text-white ${
                          idx === 0 ? 'bg-neutral-800/60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-[11px] font-bold text-neutral-400">
                            #{player.Offline_Draft_Rank}
                          </span>
                          <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ring-1 ${posBadgeColor(player.Pos)}`}>
                            {player.Pos}
                          </span>
                          <div className="min-w-0">
                            <strong className="text-white font-serif block truncate">
                              {player.Player_Name}
                            </strong>
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
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 12-Team Responsive Grid Board */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teams.map((team) => {
          const isOnClock = team.id === activeTeamId && picks.length < 180;
          const isDragOver = dragOverTeamId === team.id;
          const roster = getTeamRoster(team.id);
          const teamPicks = picks.filter((p) => p.teamId === team.id);
          
          const starters = [
            roster.QB, roster.RB1, roster.RB2, roster.WR1, roster.WR2, 
            roster.TE, roster.FLEX1, roster.FLEX2, roster.K, roster.DEF
          ].filter(Boolean) as Player[];

          const totalProjSeasonPts = teamPicks.reduce((sum, p) => sum + (p.player.Proj_Fantasy_Pts_2026 || 0), 0);
          const startersW14AvgPPG = starters.length > 0 
            ? Number((starters.reduce((sum, p) => sum + p.W1_4_Proj_PPG, 0)).toFixed(1))
            : 0;
          const netPOADPSurplus = Number(
            teamPicks.reduce((sum, p) => sum + (p.player.POADP_Points_Over_ADP || 0), 0).toFixed(1)
          );

          const isInlineSearchOpen = inlineTeamSearchId === team.id;

          return (
            <div
              key={team.id}
              onDragOver={(e) => handleDragOver(e, team.id)}
              onDragLeave={(e) => handleDragLeave(e, team.id)}
              onDrop={(e) => handleDrop(e, team.id)}
              className={`relative flex flex-col rounded-2xl border p-4 transition-all shadow-xl backdrop-blur-xl ${
                isDragOver
                  ? 'border-emerald-400 bg-emerald-950/40 ring-4 ring-emerald-500/50 scale-[1.02] shadow-emerald-500/20'
                  : isOnClock
                  ? 'border-amber-500 bg-gradient-to-b from-amber-950/40 via-neutral-900/90 to-neutral-950 ring-2 ring-amber-500/50 shadow-amber-500/10'
                  : team.isUser
                  ? 'border-indigo-500/50 bg-indigo-950/20'
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
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-800 font-mono text-[11px] font-bold text-neutral-300 shrink-0">
                    #{team.slot}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-serif text-sm font-bold text-neutral-100 truncate">
                      {team.name}
                    </h4>
                    <span className="text-[10px] text-neutral-400 block truncate">
                      {team.archetype}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isOnClock ? (
                    <span className="flex items-center gap-1 rounded bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-neutral-950 animate-pulse">
                      <Clock className="h-3 w-3" />
                      <span>ON CLOCK</span>
                    </span>
                  ) : team.isUser ? (
                    <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-500/30">
                      ★ MY TEAM
                    </span>
                  ) : null}

                  {/* Quick Add Button */}
                  <button
                    onClick={() => {
                      setInlineTeamSearchId(isInlineSearchOpen ? null : team.id);
                      setInlineSearchQuery('');
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

              {/* Inline Search for this Team */}
              {isInlineSearchOpen && (
                <div className="my-2 space-y-1.5 rounded-xl border border-amber-500/40 bg-neutral-950 p-2 text-xs animate-fadeIn">
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
                          <span className="text-neutral-500 ml-1">({p.Pos} • {p.Team})</span>
                        </div>
                        <span className="font-mono text-emerald-400 text-[10px] shrink-0">
                          {p.W1_4_Proj_PPG} PPG
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-time Team Metrics Summary Bar */}
              <div className="my-2.5 grid grid-cols-3 gap-1 rounded-xl bg-neutral-950/80 p-2 text-center text-[10px]">
                <div>
                  <span className="text-neutral-500 block uppercase font-medium">W1–4 PPG</span>
                  <strong className="font-mono text-emerald-400 text-xs">{startersW14AvgPPG}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase font-medium">Season Pts</span>
                  <strong className="font-mono text-neutral-200 text-xs">{Math.round(totalProjSeasonPts)}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block uppercase font-medium">POADP</span>
                  <strong className={`font-mono text-xs ${netPOADPSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {netPOADPSurplus > 0 ? `+${netPOADPSurplus}` : netPOADPSurplus}
                  </strong>
                </div>
              </div>

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

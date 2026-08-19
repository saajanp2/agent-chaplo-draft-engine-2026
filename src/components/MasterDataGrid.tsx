import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  UserPlus, 
  Eye, 
  PlusCircle, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Flame, 
  Shield, 
  Sparkles, 
  Zap, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Player, Position, W1_4_Category } from '../types';

interface MasterDataGridProps {
  players: Player[];
  draftedPlayerIds: Set<number>;
  comparisonIds: Set<number>;
  onDraftPlayer: (player: Player) => void;
  onToggleCompare: (player: Player) => void;
  onSelectPlayer: (player: Player) => void;
  selectedPos: string;
  onSelectPos: (pos: string) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  activeTeamName: string;
}

export const MasterDataGrid: React.FC<MasterDataGridProps> = ({
  players,
  draftedPlayerIds,
  comparisonIds,
  onDraftPlayer,
  onToggleCompare,
  onSelectPlayer,
  selectedPos,
  onSelectPos,
  activeCategory,
  onSelectCategory,
  activeTeamName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Player>('Offline_Draft_Rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [expandedPlayerId, setExpandedPlayerId] = useState<number | null>(null);
  const [hideDrafted, setHideDrafted] = useState<boolean>(true);

  // Position Tabs
  const posTabs = ['ALL', 'FLEX', 'WR', 'RB', 'TE', 'QB', 'K', 'DEF'];

  // W1-4 Strategic Category Filters
  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'Alpha Target Monsters', label: '🔥 Alpha Target Monsters (8.5+ Tgt)' },
    { id: 'High-Floor FLEX Anchors', label: '🛡️ High-Floor FLEX Anchors' },
    { id: 'Konami/Dual-Threat QBs', label: '⚡ Konami/Dual-Threat QBs' },
    { id: 'PPR Pass-Catching Specialists', label: '🎯 PPR Pass-Catching Specialists' },
    { id: 'Early Acclimation Ramps', label: '📈 Early Acclimation Ramps' },
    { id: 'Late Target Value Sleepers', label: '💎 Late Target Value Sleepers' },
  ];

  // Sorting handler
  const handleSort = (field: keyof Player) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'Offline_Draft_Rank' || field === 'Yahoo_ADP' || field === 'ECR_Rank');
    }
  };

  // Filter and Sort Pipeline
  const filteredAndSortedPlayers = useMemo(() => {
    return players
      .filter((player) => {
        // Hide drafted toggle
        if (hideDrafted && draftedPlayerIds.has(player.Player_ID)) {
          return false;
        }

        // Position Filter
        if (selectedPos === 'FLEX') {
          if (!['RB', 'WR', 'TE'].includes(player.Pos)) return false;
        } else if (selectedPos !== 'ALL' && player.Pos !== selectedPos) {
          return false;
        }

        // Category Filter
        if (activeCategory !== 'ALL' && player.W1_4_Category !== activeCategory) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = player.Player_Name.toLowerCase().includes(q);
          const teamMatch = player.Team.toLowerCase().includes(q);
          const tagMatch = player.Sleeper_Tag.toLowerCase().includes(q);
          const noteMatch = player.Notable_Description.toLowerCase().includes(q);
          const oppMatch = player.Primary_Weekly_Opportunity.toLowerCase().includes(q);
          if (!nameMatch && !teamMatch && !tagMatch && !noteMatch && !oppMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField] ?? 0;
        let valB = b[sortField] ?? 0;

        if (typeof valA === 'string') {
          return sortAsc 
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }

        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [players, draftedPlayerIds, selectedPos, activeCategory, searchQuery, sortField, sortAsc, hideDrafted]);

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

  const getSortIcon = (field: keyof Player) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortAsc ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-xl backdrop-blur-xl">
        {/* Row 1: Position Tabs + Search + Hide Drafted Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Position Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {posTabs.map((pos) => {
              const count = pos === 'ALL' 
                ? players.filter(p => !draftedPlayerIds.has(p.Player_ID)).length
                : pos === 'FLEX' 
                ? players.filter(p => ['RB', 'WR', 'TE'].includes(p.Pos) && !draftedPlayerIds.has(p.Player_ID)).length
                : players.filter(p => p.Pos === pos && !draftedPlayerIds.has(p.Player_ID)).length;

              return (
                <button
                  key={pos}
                  onClick={() => onSelectPos(pos)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedPos === pos
                      ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <span>{pos}</span>
                  <span className={`text-[10px] ${selectedPos === pos ? 'text-neutral-950 font-extrabold' : 'text-neutral-500'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input & Hide Drafted Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search player, team, note..."
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-neutral-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <label className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideDrafted}
                onChange={(e) => setHideDrafted(e.target.checked)}
                className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-amber-500"
              />
              <span className="hidden sm:inline">Hide Drafted</span>
            </label>
          </div>
        </div>

        {/* Row 2: Weeks 1–4 Strategic Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-neutral-800/80 pt-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 whitespace-nowrap mr-1">
            W1–4 Archetypes:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-neutral-100 text-neutral-950 font-bold shadow-sm'
                  : 'bg-neutral-950/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/90 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/90 text-[11px] uppercase tracking-wider text-neutral-400 select-none">
                <th className="py-3 px-3 cursor-pointer" onClick={() => handleSort('Offline_Draft_Rank')}>
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    {getSortIcon('Offline_Draft_Rank')}
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => handleSort('Player_Name')}>
                  <div className="flex items-center gap-1">
                    <span>Player / Profile</span>
                    {getSortIcon('Player_Name')}
                  </div>
                </th>
                <th className="py-3 px-2 text-center cursor-pointer" onClick={() => handleSort('Pos')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Pos</span>
                    {getSortIcon('Pos')}
                  </div>
                </th>
                <th className="py-3 px-2 text-center cursor-pointer hidden md:table-cell" onClick={() => handleSort('Team')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Team</span>
                    {getSortIcon('Team')}
                  </div>
                </th>
                <th className="py-3 px-2 text-center cursor-pointer" onClick={() => handleSort('Yahoo_ADP')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Yahoo ADP</span>
                    {getSortIcon('Yahoo_ADP')}
                  </div>
                </th>
                <th className="py-3 px-2 text-center cursor-pointer" onClick={() => handleSort('POADP_Points_Over_ADP')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>POADP Surplus</span>
                    {getSortIcon('POADP_Points_Over_ADP')}
                  </div>
                </th>
                <th className="py-3 px-2 text-center cursor-pointer" onClick={() => handleSort('W1_4_Proj_PPG')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>W1–4 Proj PPG</span>
                    {getSortIcon('W1_4_Proj_PPG')}
                  </div>
                </th>
                <th className="py-3 px-3 hidden lg:table-cell">
                  <span>Primary Weekly Opportunity</span>
                </th>
                <th className="py-3 px-3 hidden xl:table-cell">
                  <span>Head-to-Head Do's & Don'ts</span>
                </th>
                <th className="py-3 px-3 text-right">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredAndSortedPlayers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-neutral-500">
                    No players found matching current filters or search term.
                  </td>
                </tr>
              ) : (
                filteredAndSortedPlayers.map((player) => {
                  const isDrafted = draftedPlayerIds.has(player.Player_ID);
                  const isCompared = comparisonIds.has(player.Player_ID);
                  const isExpanded = expandedPlayerId === player.Player_ID;

                  return (
                    <React.Fragment key={player.Player_ID}>
                      <tr 
                        className={`group transition-colors ${
                          isDrafted
                            ? 'bg-neutral-950/40 opacity-45'
                            : isCompared
                            ? 'bg-amber-950/20'
                            : 'hover:bg-neutral-900/50'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-2.5 px-3 font-mono font-bold text-neutral-300 whitespace-nowrap">
                          <button
                            onClick={() => setExpandedPlayerId(isExpanded ? null : player.Player_ID)}
                            className="flex items-center gap-1 hover:text-amber-400"
                          >
                            {isExpanded ? <ChevronDown className="h-3 w-3 text-amber-400" /> : <ChevronRight className="h-3 w-3 text-neutral-500" />}
                            <span>#{player.Offline_Draft_Rank}</span>
                          </button>
                        </td>

                        {/* Player Name + Tag + Tier */}
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span 
                                onClick={() => onSelectPlayer(player)}
                                className="font-serif font-bold text-sm text-neutral-100 hover:text-amber-400 cursor-pointer transition-colors"
                              >
                                {player.Player_Name}
                              </span>
                              {player.Age && (
                                <span className="text-[10px] text-neutral-500">({player.Age}y)</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                              <span className="text-amber-400/90 font-medium">{player.Sleeper_Tag}</span>
                              <span>•</span>
                              <span className="text-neutral-500">Tier {player.Position_Tier}</span>
                            </div>
                          </div>
                        </td>

                        {/* Pos */}
                        <td className="py-2.5 px-2 text-center">
                          <span className={`inline-flex items-center justify-center rounded px-2 py-0.5 font-mono text-[10px] font-bold ring-1 ${posBadgeColor(player.Pos)}`}>
                            {player.Pos}
                          </span>
                        </td>

                        {/* Team */}
                        <td className="py-2.5 px-2 text-center hidden md:table-cell font-mono text-neutral-300">
                          {player.Team}
                        </td>

                        {/* Yahoo ADP */}
                        <td className="py-2.5 px-2 text-center font-mono text-neutral-300">
                          {player.Yahoo_ADP.toFixed(1)}
                        </td>

                        {/* POADP Surplus */}
                        <td className="py-2.5 px-2 text-center font-mono">
                          <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-bold ${
                            player.POADP_Points_Over_ADP >= 10
                              ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30'
                              : player.POADP_Points_Over_ADP > 0
                              ? 'text-emerald-400'
                              : player.POADP_Points_Over_ADP === 0
                              ? 'text-neutral-400'
                              : 'text-rose-400'
                          }`}>
                            {player.POADP_Points_Over_ADP > 0 ? `+${player.POADP_Points_Over_ADP.toFixed(1)}` : player.POADP_Points_Over_ADP.toFixed(1)}
                          </span>
                        </td>

                        {/* W1-4 Proj PPG */}
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-400">
                          {player.W1_4_Proj_PPG} PPG
                          <div className="text-[10px] text-neutral-500 font-normal">
                            ({player.W1_4_Proj_Total_Pts} total)
                          </div>
                        </td>

                        {/* Primary Weekly Opportunity */}
                        <td className="py-2.5 px-3 hidden lg:table-cell text-[11px] text-neutral-300 max-w-xs truncate">
                          {player.Primary_Weekly_Opportunity}
                        </td>

                        {/* Head-to-Head Do's & Don'ts */}
                        <td className="py-2.5 px-3 hidden xl:table-cell text-[11px] text-amber-300/90 max-w-sm italic truncate">
                          "{player.Dos_And_Donts}"
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Compare Button */}
                            <button
                              onClick={() => onToggleCompare(player)}
                              className={`rounded p-1.5 transition-all ${
                                isCompared
                                  ? 'bg-amber-500 text-neutral-950 font-bold'
                                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                              }`}
                              title={isCompared ? 'Remove from comparison' : 'Compare player'}
                            >
                              <PlusCircle className="h-3.5 w-3.5" />
                            </button>

                            {/* View Detail Button */}
                            <button
                              onClick={() => onSelectPlayer(player)}
                              className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
                              title="Deep dive intel"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* Draft Button */}
                            <button
                              onClick={() => onDraftPlayer(player)}
                              disabled={isDrafted}
                              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                                isDrafted
                                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-600/20 active:scale-95'
                              }`}
                              title={`Draft to ${activeTeamName}`}
                            >
                              {isDrafted ? (
                                <span>Drafted</span>
                              ) : (
                                <>
                                  <UserPlus className="h-3.5 w-3.5" />
                                  <span>Draft</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-neutral-900/70 border-b border-neutral-800 animate-fadeIn">
                          <td colSpan={10} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div className="space-y-1 rounded-xl bg-neutral-950/70 p-3 border border-neutral-800">
                                <span className="font-bold text-neutral-400 uppercase text-[10px] block">
                                  Opportunity & Volume
                                </span>
                                <p className="text-neutral-200">{player.Primary_Weekly_Opportunity}</p>
                                <div className="pt-1 text-[11px] text-neutral-400">
                                  2026 Season Proj: <strong className="text-emerald-400">{player.Proj_Fantasy_Pts_2026} pts</strong> ({player.Proj_PPG_26} PPG)
                                </div>
                              </div>

                              <div className="space-y-1 rounded-xl bg-neutral-950/70 p-3 border border-neutral-800">
                                <span className="font-bold text-amber-400 uppercase text-[10px] block">
                                  Head-to-Head Strategy (Do's & Don'ts)
                                </span>
                                <p className="text-amber-200/90 italic">{player.Dos_And_Donts}</p>
                                <div className="pt-1 text-[11px] text-neutral-400">
                                  Category: <span className="text-white font-medium">{player.W1_4_Category}</span>
                                </div>
                              </div>

                              <div className="space-y-1 rounded-xl bg-neutral-950/70 p-3 border border-neutral-800">
                                <span className="font-bold text-indigo-400 uppercase text-[10px] block">
                                  Scouting & Role Breakdown
                                </span>
                                <p className="text-neutral-300 leading-relaxed">{player.Notable_Description}</p>
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
